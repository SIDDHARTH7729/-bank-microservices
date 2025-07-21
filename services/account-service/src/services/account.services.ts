import { Repository } from "typeorm";
import { Account, AccountType } from "../entity/account.entity";
import { AppDataSource } from "../data-source"
import { SAVINGS_ACCOUNT } from "../constants";
import { TransactionType } from "../types/transaction.types";
import { createError,generateAccountNumber } from "../utils";
import { ERROR_CODES } from "@bank/constants";
import { publishAccountCreatedToKafka } from "../events/producers/accountCreated.producer";
import logger from "../config/logger";
import { publishAccountDeletedTokafka } from "../events/producers/accountDeleted.producer";

interface AccountDto{
    userId:number;
    accountType?:AccountType;
    accountName?:string;
}

interface AccountFindDto{
    accountNumber:string;
    userId:number;
}

interface AccountDeleteDto{
    userId:number;
    accountNumber:string;
}

interface UpdateBalanceDto{
    accountNumber:string;
    type:TransactionType;
    amount:number;
}

export class AccountService{
    accountRepository:Repository<Account>
    
    constructor(){
        this.accountRepository = AppDataSource.getRepository(Account)
    }

    async create({userId,accountName=SAVINGS_ACCOUNT,accountType=AccountType.SAVINGS}:AccountDto){
        const existing = await this.accountRepository.findOneBy({userId,accountType});
        if (existing){
            throw createError('Account already exists',400,ERROR_CODES.ACCOUNT_ALREADY_EXISTS);
        }
         
        const account = new Account()
        account.userId = userId;
        account.accountNumber = generateAccountNumber(accountType);
        account.accountType = accountType;
        account.accountName = accountName;
        account.balance = 0;

        await this.accountRepository.save(account);
        await publishAccountCreatedToKafka({
            key:userId.toString(),
            value:account,
        });

        return account
        
    }

    async list(userId:number){
        const accounts = await this.accountRepository.find({
            where:{userId}
        })
        if(!accounts.length){
            throw createError('No accounts found',404,ERROR_CODES.ACCOUNT_NOT_FOUND);
        }
        return accounts;
    }

    async findAccountByNumber({accountNumber,userId}:AccountFindDto){
          const account = await this.accountRepository.findOneBy({
            accountNumber,
            ...(userId ? {userId} : {}) // conditional statement
          });

          if(!account){
            return createError('Account not found',404,ERROR_CODES.ACCOUNT_NOT_FOUND);
          }

          return account;
    }


    async delete({userId,accountNumber}:AccountDeleteDto){
         const account = await this.accountRepository.findOneBy({
            accountNumber,
            userId
         })

         if(!account){
            throw createError('Account not found',404,ERROR_CODES.ACCOUNT_NOT_FOUND);
         }

         const deleteRes = await this.accountRepository.delete({
            accountNumber,
            userId
         })

         if(deleteRes.affected === 0){
            throw createError('Account not found',404,ERROR_CODES.ACCOUNT_NOT_FOUND);
         }else if(deleteRes.affected===1){
            logger.info(
                `Account ${accountNumber} deleted successfully for user ${userId}`,deleteRes
            )

            await publishAccountDeletedTokafka({
                key:userId.toString(),
                value:account,
            })
         }else{
             logger.error(
                `Failed to delete account ${accountNumber} for user ${userId}`,deleteRes
             )
             throw createError('Failed to delete account',500,ERROR_CODES.FAILED_TO_DELETE_ACCOUNT);
         }
    }

    async updateBalance({accountNumber,type,amount}:UpdateBalanceDto){
       amount = Math.abs(amount)

       const account = await this.accountRepository.findOneBy({accountNumber});

       if(!account){
        throw createError('Account not found',404,ERROR_CODES.ACCOUNT_NOT_FOUND);
       }

       if(type===TransactionType.CREDIT){
          account.balance += amount;
       }else if(type === TransactionType.DEBIT){
        if(account.balance<amount){
            throw createError('Insufficient balance',400,ERROR_CODES.INSUFFICIENT_BALANCE);
        }
        account.balance -= amount;
       }

       account.balance = Number(account.balance.toFixed(2))
       await this.accountRepository.save(account)
       return account
    }

    async updateBalanceByAccNumber({accountNumber,type,amount}:UpdateBalanceDto){
          amount = Math.abs(amount)

          const account = await this.accountRepository.findOneBy({accountNumber});

          if(!account){
           throw createError('Account not found',404,ERROR_CODES.ACCOUNT_NOT_FOUND);
          }

          if(type===TransactionType.CREDIT){
             account.balance += amount;
          }else if(type === TransactionType.DEBIT){
           if(account.balance<amount){
               throw createError('Insufficient balance',400,ERROR_CODES.INSUFFICIENT_BALANCE);
           }
           account.balance -= amount;
          }

          account.balance = Number(account.balance.toFixed(2))
          await this.accountRepository.save(account)
          return account
    }

}


export const accountService = new AccountService();
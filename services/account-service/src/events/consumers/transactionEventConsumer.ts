import { Consumer } from "kafkajs";
import { TRANSACTION_TOPICS, TRANSACTION_EVENT_TYPES, TransactionStatus } from '@bank/constants'
import logger from "../../config/logger";
import { kafkaClient } from "../kafka";
import { accountService } from "../../services/account.services";
import { TransactionType } from "../../types/transaction.types";
import {
    TransactionEVentProducer,
    publishTransactionEventToKafka
} from "../producers/transactionEvent.producer";
import { hasEventBeenProcessed,markEventAsProcessed } from "../../utils/consumer.utils";


export const startTransactionEventsConsumer = async (): Promise<Consumer> => {
    const consumer = kafkaClient.createConsumer('transaction-events-consumer')

    await consumer.connect()
    await consumer.subscribe({
        topic: TRANSACTION_TOPICS.TRANSACTION_EVENTS,
        fromBeginning: false,
    })

    await consumer.run({
        eachMessage: async (messagePayload) => {
            const { topic, partition, message } = messagePayload;
            const value = message.value?.toString();

            if (!value) {
                logger.warn(`[${topic}][${partition}] message value is empty`);
                return;
            }

            try {
                const eventData = JSON.parse(value) as TransactionEVentProducer;
                const { eventType, transactionId } = eventData;

                logger.info(
                    `[${topic}.${partition}]: processing ${eventType} event for transaction ${transactionId}`,
                );

                switch (eventType) {
                    case TRANSACTION_EVENT_TYPES.INITIATED: 
                        await handleTransactionInitiated(eventData);
                        break;
                    case TRANSACTION_EVENT_TYPES.ACCOUNT_DEBITED:
                        await handleAccountDebited(eventData);
                        break;
                    case TRANSACTION_EVENT_TYPES.ACCOUNT_CREDIT_FAILED:
                        await handleCreditFailed(eventData);
                        break;  
                    case TRANSACTION_EVENT_TYPES.ACCOUNT_CREDITED:
                        await handleAccountCredited(eventData);
                        break;       
                    case TRANSACTION_EVENT_TYPES.ACCOUNT_DEBIT_COMPENSATED:
                        logger.info(`Transaction ${transactionId} compensated`);
                        break;
                    case TRANSACTION_EVENT_TYPES.ACCOUNT_DEBIT_FAILED:
                        logger.warn(`Transaction ${transactionId} of type Debit failed completely`); 
                        break;
                    case TRANSACTION_EVENT_TYPES.COMPLETED:
                        logger.info(`Transaction ${transactionId} completed`);
                        break;
                    case TRANSACTION_EVENT_TYPES.FAILED:
                        logger.error(`Transaction ${transactionId} marked as Failed`);
                        break;
                    default:
                        logger.warn(`[${topic}][${partition}] Unknown event type: ${eventType}`);                   

                }
            } catch (error: any) {
                logger.error(`[${topic}][${partition}] ${error.message}`);
            }

        }
    })
    return consumer
}


async function handleTransactionInitiated(eventData:any):Promise<void>{
    const {transactionId,sourceAccountNumber,amount,transactionType} = eventData

    if(await hasEventBeenProcessed(transactionId,transactionType)){
        logger.info(`[DEDUP] Skipping already processed ${transactionType} for txn ${transactionId}`);
        return;
    }

    try {
        if(transactionType !== "transfer"){
            throw new Error(`Unsupported transaction tye: ${transactionType}`)
        }

        const sourceAccount = await accountService.updateBalance(
            {
                accountNumber:sourceAccountNumber,
                type:TransactionType.DEBIT,
                amount
            }
        )

        await publishTransactionEventToKafka({
            ...eventData,
            eventType:TRANSACTION_EVENT_TYPES.ACCOUNT_DEBITED,
            sourceAccountBalance:sourceAccount.balance,
            sourceDebitedAt:sourceAccount.updatedAt,
        })

        await markEventAsProcessed(transactionId,transactionType)
    } catch (error:any) {
         await publishTransactionEventToKafka({
            ...eventData,
            eventType:TRANSACTION_EVENT_TYPES.ACCOUNT_DEBIT_FAILED,
            error:error.message||error.toString(),
            errorCode:error.errorCode||null,
         })

         logger.error(
            `Failed to process transaction initiated event for transaction ${transactionId}: ${error.message}`
         )
    }
}

async function handleAccountDebited(eventData:any){
    const {transactionId,destinationAccountNumber,amount} = eventData
    try {
        const destinationAccount = await accountService.updateBalance({
            accountNumber:destinationAccountNumber,
            type:TransactionType.CREDIT,
            amount,

        })

        await publishTransactionEventToKafka({
            ...eventData,
            eventType:TRANSACTION_EVENT_TYPES.ACCOUNT_CREDITED,
            destinationAccountBalance:destinationAccount.balance,
            destinationCreditedAt:destinationAccount.updatedAt
        })
    } catch (error:any) {
        await publishTransactionEventToKafka({
            ...eventData,
            eventType:TRANSACTION_EVENT_TYPES.ACCOUNT_CREDIT_FAILED,
            error:error.message||error.toString(),
            errorCode:error.errorCode||null
        })
        logger.error(
            `Failed to process account debited event for transaction ${transactionId}: ${error.message}`
        )
    }
}

async function handleCreditFailed(eventData:any){
     const {transactionId,sourceAccountNumber,amount} = eventData
     try {
        const sourceAccount = await accountService.updateBalance({
            accountNumber:sourceAccountNumber,
            type:TransactionType.CREDIT,
            amount
        })

        await publishTransactionEventToKafka({
            ...eventData,
            eventType:TRANSACTION_EVENT_TYPES.ACCOUNT_DEBIT_COMPENSATED,
            sourceAccountBalance:sourceAccount.balance,
            compensatedAt:sourceAccount.updatedAt,
        })
     } catch (error:any) {
        // Here it is a critical failure as compensation failed
        // here we can noify the admin and as well as rollback the transaction
        await publishTransactionEventToKafka({
            ...eventData,
            eventType:TRANSACTION_EVENT_TYPES.ACCOUNT_DEBIT_FAILED,
            error:error.message||error.toString(),
            errorCode:error.errorCode||null,
        })
        logger.error(
            `CRITICAL!!! : Failed to process account debited event for transaction ${transactionId}: ${error.message}`
        )
     }
}


async function handleAccountCredited(eventData:any){
    const {transactionId} = eventData;
    try {
        await publishTransactionEventToKafka({
            ...eventData,
            eventType:TRANSACTION_EVENT_TYPES.COMPLETED,
            status:TransactionStatus.COMPLETED
        })

        logger.info(`Transaction ${transactionId} completed`)
    } catch (error:any) {
         logger.error(
            `Failed to process account credited event for transaction ${transactionId}: ${error.message}`
         )   
    }
}

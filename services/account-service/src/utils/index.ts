import { customAlphabet } from "nanoid";
import { AccountType } from "../entity/account.entity";
import { ERROR_CODES } from "@bank/constants";

export const createError = (
    message:string,
    statusCode:number,
    errorCode:(typeof ERROR_CODES)[keyof typeof ERROR_CODES]
):Error => {
   return Object.assign(new Error(message),{statusCode,errorCode});
}

const accountTypeList = {
    [AccountType.SAVINGS]: '15',
    [AccountType.CURRENT]: '18',
}

export const generateAccountNumber = (
    accountType:AccountType,
    idLength:number = 7
):string =>{
    const date = new Date().toISOString().slice(0,4).replace(/-/g,'');
    const uniqueId = customAlphabet('1234567890',idLength)();

    return `${accountTypeList[accountType]}${date}${accountTypeList[accountType]}${uniqueId}`
}


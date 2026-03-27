import { Request, Response } from 'express';

export interface IDecodeToken {
  id: string;
  roleId: string;
  companyId: string;
  role: string;
  usrename: string;
  language: any;
  whatsappId: string;
}

class classDecodeToken implements IDecodeToken {

  id!: string;
  roleId!: string;
  companyId!: string;
  usrename!: string;
  role!: string;
  language: any;
  whatsappId!: string;



}

const pick = (_bject: Record<string, any>, keys: string[]) => {

  return keys.reduce(function (obj: any, key: string) {
    if (_bject && Object.prototype.hasOwnProperty.call(_bject, key)) {


      if (isBase64(_bject[key])) {

        obj[key] = _bject[key];

      } else if (typeof _bject[key] === "string" && (_bject[key].includes("true") || _bject[key].includes("false"))) {


        obj[key] = JSON.parse(_bject[key])

      } else {

        // eslint-disable-next-line no-param-reassign
        obj[key] = _bject[key];
      }





    }
    return obj;
  }, {});

}


class ApiError extends Error {
  statusCode: number;

  isOperational: boolean;

  override stack?: string;

  constructor(statusCode: number, message: string, stack = '', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const base64RegExp = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{64})$/;




const isBase64 = (str) => base64RegExp.test(str);

export const apiUtils = {

  pick,
  ApiError,
  isBase64
}

export const catchAsync = (fn?: any) => (req?: Request, res?: Response, next?: any) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export const decodeToken = new classDecodeToken()
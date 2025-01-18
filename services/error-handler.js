import { writeFile } from "fs/promises";
import { jsErrorHandler, tsErrorHandler } from "../constants/constants.js";

const getErrorMiddlewareContentTs = (isPathAlias = true) => {
  const path = isPathAlias ? "@" : "..";

  return `
  import { NextFunction, Request, Response } from "express";
  import ErrorHandler from "${path}/utils/errorHandler.js";
  import { envMode } from "${path}/app.js";
  
  export const errorMiddleware = (
   err:ErrorHandler,
   req:Request,
   res:Response,
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   next:NextFunction
  )=> {
  
   err.message||= "Internal Server Error";
   err.statusCode = err.statusCode || 500;
    
   const response:{
    success: boolean,
    message: string,
    error?:ErrorHandler
   } = {
      success: false,
      message: err.message,
   };
  
   if (envMode === "DEVELOPMENT") {
     response.error = err;
   }
  
   return res.status(err.statusCode).json(response);
  
  };
  
  type ControllerType = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void | Response<unknown, Record<string, unknown>>>;
  
  export const TryCatch = (passedFunc:ControllerType) => async (req:Request, res:Response, next:NextFunction) => {
   try {
     await passedFunc(req, res, next);
   } catch (error) {
      next(error);
    }
  };
  
  `;
};

const getErrorMiddlewareContentJs = () => {
  return `
import { envMode } from "../app.js";
  
export const errorMiddleware = (
  err,
  req,
  res,
  // eslint-disable-next-line no-unused-vars
  next
)=> {
  
  err.message||= "Internal Server Error";
  err.statusCode = err.statusCode || 500;
    
  const response = {
    success: false,
    message: err.message,
  };
  
  if (envMode === "DEVELOPMENT") {
    response.error = err;
  }
  
  return res.status(err.statusCode).json(response);
  
};
  
export const TryCatch = (passedFunc) => async (req, res, next) => {
 try {
    await passedFunc(req, res, next);
 } catch (error) {
    next(error);
   }
};
  
  
  `;
};

export const createErrorHandler = async (answers, projectDir) => {
  if (!answers.useErrorHandler) return;
  const isTs = answers.framework === "TypeScript";
  if (isTs) {
    const content = getErrorMiddlewareContentTs(answers.usePathAlias);
    await writeFile(`${projectDir}/src/middlewares/error.ts`, content);
    await writeFile(`${projectDir}/src/utils/errorHandler.ts`, tsErrorHandler);
  } else {
    const content = getErrorMiddlewareContentJs();
    await writeFile(`${projectDir}/middlewares/error.js`, content);
    await writeFile(`${projectDir}/utils/errorHandler.js`, jsErrorHandler);
  }
};

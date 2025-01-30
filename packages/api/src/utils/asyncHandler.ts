import { NextFunction, RequestHandler, Request, Response } from "express"

const asyncHandler = (requestHandler: RequestHandler) => {
    return (req:Request, res:Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }
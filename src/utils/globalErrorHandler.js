import { logger } from 'utils/logger';

const globalErrorHandler = (err, req, res, next) => {
    if(err){
        logger.error(err.message);
        let error = {
          status : "failed",
          code : err.code || 500,
          error : {
            type : err.type || "ServerError",
            details : {
              message : err.message
            }
          }
        }

        return res.status(error.code).send(error);
    }
    
    return next();
}

module.exports = globalErrorHandler;
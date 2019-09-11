import { logger } from 'utils/logger';

const notFoundErrorHandler = (req, res, next) => {
    if (!req.resourcePath) {
        logger.error(`the path ${req.path} is not found`);
        return res.status(400).send({
            "status" : "failed",
            "code" : "400",
            "details" : {
                "message": `The path ${req.path} is not found`
            }
        });    
    }

    next();
}

module.exports = notFoundErrorHandler;
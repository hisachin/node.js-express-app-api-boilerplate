const apiRoute = require('./api');


import globalErrorHAndler from 'utils/globalErrorHandler';
import notFoundErrorHandler from 'utils/notFoundErrorHandler';

const init = (server) => {
    //route all the request to /api 
    server.get('*', (req, res, next) => {
        return next();
    });

    //router all the request
    server.use('/api',apiRoute);

    //manage global error handling
    server.use(globalErrorHAndler);

    //manage global not found error handling
    server.use(notFoundErrorHandler);

}
module.exports = {
    init: init
};
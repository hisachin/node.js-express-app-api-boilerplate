import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

module.exports = function () {
    
    let server = express(),
        create,
        start;

    create = (config,db) => {
        let routes = require('routes');
        
        // set all the server things
        server.set('env', config.config_id);
        server.set('port', config.node_port);
        server.set('hostname', config.API_URL);
        
        // add middleware to parse the json
        server.use(bodyParser.json());
        server.use(bodyParser.urlencoded({
            extended: false
        }));

        //connect the database
        mongoose.connect(
            db.database,
            { 
                useNewUrlParser: true,
                useCreateIndex: true
            }
        );

        // Set up routes
        routes.init(server);
    };

    
    start = () => {
        let hostname = server.get('hostname'),
            port = server.get('port');
        server.listen(port, function () {
            console.log('Express server listening on - http://' + hostname + ':' + port);
        });
    };
    return {
        create: create,
        start: start
    };
};
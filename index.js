// environment variables
process.env.NODE_ENV = 'development';

const server = require('config/app')();
const db = require('config/db');

//create the basic server setup 
server.create(global.gConfig, db);

//start the server
server.start();
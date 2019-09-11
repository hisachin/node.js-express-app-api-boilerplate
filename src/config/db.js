const config = require('./config');

module.exports = {
    "database" : `mongodb://127.0.0.1:27017/${config.database}`
}
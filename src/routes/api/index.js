import express from 'express';

const v1 = require('./v1');

let router = express.Router();

router.use('/v1', v1);

module.exports = router;
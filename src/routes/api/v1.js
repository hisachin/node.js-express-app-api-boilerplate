import express from 'express';

import { authController } from 'controllers/index';

let router = express.Router();

router.use('/account', authController);

module.exports = router;
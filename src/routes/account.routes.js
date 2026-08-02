const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const accountController = require('../controllers/account.controller');

const router = express.Router();


/**
 * - POST /api/account
 * - Creates a new account.
 * - Protected route, requires authentication.
 */
router.post('/', authMiddleware.authMiddleware, accountController.createAccountController);


module.exports = router;
const {Router} = require('express');
const autMiddleware = require('../middleware/auth.middleware');
const transactionController = require('../controllers/transaction.controller');

const transactionRouter = Router();

/**
 * - POST /api/transactions
 * - Create a new transaction
 */

transactionRouter.post('/', autMiddleware.authMiddleware, transactionController.createTransaction);


module.exports = transactionRouter;
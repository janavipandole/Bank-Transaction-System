const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require('mongoose');



/**
 * - Create a new transaction
* THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entries
 * 7. Create CREDIT ledger entries
 * 8. Mark transaction as COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification 
 */

async function createTransaction(req, res) {

    /**
     * Step 1: Validate request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const fromAccountData = await accountModel.findOne({
        _id: fromAccount
    })

    const toAccountData = await accountModel.findOne({
        _id: toAccount
    })

    if (!fromAccountData || !toAccountData) {
        return res.status(404).json({
            message: 'One or both accounts not found'
        });
    }


    /**
     * Step 2: Validate idempotency key
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    });

    if (isTransactionAlreadyExists) {

        if (isTransactionAlreadyExists.status === 'COMPLETED') {
            return res.status(400).json({
                message: 'Transaction already processed',
                transaction: isTransactionAlreadyExists
            });
        }

        if (isTransactionAlreadyExists.status === 'PENDING') {
            return res.status(200).json({
                message: 'Transaction is still pending'
            });
        }

        if (isTransactionAlreadyExists.status === 'FAILED') {
            return res.status(500).json({
                message: 'Transaction processing failed, please try again'
            });
        }

        if (isTransactionAlreadyExists.status === 'REVERSED') {
            return res.status(400).json({
                message: 'Transaction has been reversed, please try again'
            });
        }

    }

    /**
     * Step 3: Check account status
     */

    if (fromAccountData.status !== 'ACTIVE' || toAccountData.status !== 'ACTIVE') {
        return res.status(400).json({
            message: 'One or both accounts are not active'
        });
    }

    /**
     * Step 4: Derive sender balance from ledger
     */

    const balance = await fromAccountData.getBalance();

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Required balance is ${amount}`
        });
    }

    /**
     * Step 5: Create transaction (PENDING)
     */

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: 'PENDING'
    }, { session });

    const debitLedgerEntry = new ledgerModel({
        account: fromAccount,
        type: 'DEBIT',
        amount: amount,
        transaction: transaction._id
    }, { session });


    const creditLedgerEntry = new ledgerModel({
        account: toAccount,
        type: 'CREDIT',
        amount: amount,
        transaction: transaction._id
    }, { session });

    transaction.status = 'COMPLETED';
    await transaction.save({ session });

    await section.commitTransaction();
    session.endSession();

    /**
     * Step 10: Send email notification
     */

    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccountData.user, transaction._id);

    return res.status(201).json({
        message: 'Transaction completed successfully',
        transaction: transaction
    });

}

module.exports = {
    createTransaction
};
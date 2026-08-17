import mongoose from "mongoose";
import { transactionModel } from "../models/transaction.model.js";
import { userModel } from "../models/user.model.js";
import { ledgerModel } from "../models/ledger.model.js";
import { sendTransactionEmail } from "../services/email.service.js";
import { accountModel } from "../models/account.model.js";

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */
const createTransaction = async (req, res) => {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "FromAccount, toAccount, amount, and idempotencyKey are required",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });
  if (!fromUserAccount) {
    return res.status(404).json({
      message: `Invalid from account`,
    });
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });
  if (!toUserAccount) {
    return res.status(404).json({
      message: "Invalid to account",
    });
  }

  // validate idempotency key
  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
      });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still processing",
        status: "pending",
      });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(400).json({
        message: "Transaction has been failed, please try again",
        status: "failed",
      });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(400).json({
        message: "Transaction has been reversed, please retry",
        status: "reversed",
      });
    }
  }

  //check account status
  if (fromUserAccount.status !== "ACTIVE") {
    return res.status(400).json({
      message: "From account is not active",
    });
  }

  if (toUserAccount.status !== "ACTIVE") {
    return res.status(400).json({
      message: "To account is not active",
    });
  }

  //Derive sender balance from ledger
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Available balance: ${balance}, Amount to be transferred: ${amount}`,
      status: "failed",
    });
  }

  let transaction;
  try {
    //Create transaction (PENDING)
    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
          },
        ],
        { session },
      )
    )[0];

    // Create DEBIT ledger entry
    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    // await (() => {
    //   return new Promise((resolve) => setTimeout(resolve, 10 * 1000));
    // })();

    // Create CREDIT ledger entry
    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    // Mark transaction COMPLETED
    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { $set: { status: "COMPLETED" } },
      { session },
    );

    //   Commit MongoDB session
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    return res.status(400).json({
      message:
        "Transaction is Pending due to some issues, please retry after some time",
    });
  }
  //   Send email notification
  await sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

  return res.status(201).json({
    message: "Transaction completed successfully",
    status: "success",
    transaction,
  });
};

const createInitialFundsTransaction = async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount, and idempotencyKey are required",
    });
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(404).json({
      message: "Invalid to account",
    });
  }

  if (toUserAccount.status !== "ACTIVE") {
    return res.status(400).json({
      message: "To account is not active",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user account not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    status: "success",
    transaction,
  });
};

export { createTransaction, createInitialFundsTransaction };

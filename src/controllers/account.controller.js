import { accountModel } from "../models/account.model.js";

const createAccountController = async (req, res) => {
  const user = req.user;

  // step 1: check if user already has an account
  const existingAccount = await accountModel.findOne({ user: user._id });
  if (existingAccount) {
    return res.status(400).json({
      message: "User already has an account",
    });
  }

  // step 2: create a new account
  const account = await accountModel.create({
    user: user._id,
  });

  // step 3: return the created account
  return res.status(201).json({
    message: "Account created successfully",
    status: "success",
    account,
  });
};

const getUserAccountsController = async (req, res) => {
  const accounts = await accountModel.find({
    user: req.user._id,
  });

  if (!accounts || accounts.length === 0) {
    return res.status(404).json({
      message: "No accounts found for the user",
    });
  }

  return res.status(200).json({
    message: "Accounts fetched successfully",
    status: "success",
    accounts,
  });
};

const getAccountBalanceController = async (req, res) => {
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id,
  });

  if (!account) {
    return res.status(404).json({
      message: "Account not found or you can't access different account",
    });
  }

  const balance = await account.getBalance();

  return res.status(200).json({
    message: "Account balance fetched successfully",
    status: "success",
    balance,
  });
};

export {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController,
};

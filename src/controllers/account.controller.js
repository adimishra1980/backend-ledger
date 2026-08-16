import { accountModel } from "../models/account.mode.js";

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

export { createAccountController };

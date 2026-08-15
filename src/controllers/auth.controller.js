import { userModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";

/**
 * - user register controller
 * - POST /api/v1/auth/register
 */
const userRegisterController = async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const isExists = await userModel.findOne({ email });
  if (isExists) {
    return res.status(422).json({
      message: "User already exists with this email.",
      status: "failed",
    });
  }

  const user = await userModel.create({
    email,
    password,
    name,
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    message: "User registered successfully",
    status: "success",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
};

/** *
 * - user login controller
 * - POST /api/v1/auth/login
 */

const userLoginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const user = await userModel.findOne({ email }).select("+password")
  if (!user) {
    return res.status(401).json({
      message: "User not found",
    });
  }

  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid password",
      status: "failed",
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "User logged in successfully",
    status: "success",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
};

export { userRegisterController, userLoginController };

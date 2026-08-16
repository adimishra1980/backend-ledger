import { userModel } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decodedToken.userId);
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access, user not found",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Error in auth middleware: ", error);
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
};

const authSystemUserMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token not found",
    });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel
      .findById(decodedToken.userId)
      .select("+systemUser");

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized access, user not found",
      });
    }

    if (!user.systemUser) {
      return res.status(403).json({
        message: "Unauthorized access, user is not a system user",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }
};

export { authMiddleware, authSystemUserMiddleware };

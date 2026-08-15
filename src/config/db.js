import mongoose from "mongoose";

const connectToDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("server is conntect to DB");
    })
    .catch((err) => {
      console.log("Database connection error:", err);
      process.exit(1);
    });
};

export { connectToDB };

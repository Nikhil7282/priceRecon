import mongoose from "mongoose";

let isConnected = false;

export const connectToDb = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MongoDb_Uri) return console.log("MongoDbUri Not defined");
  if (isConnected) return console.log("Existing Database connection");

  try {
    await mongoose.connect(process.env.MongoDb_Uri);
    isConnected = true;
    console.log("DB CONNECTED");
  } catch (error) {
    console.log(error);
  }
};

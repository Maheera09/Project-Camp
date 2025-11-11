import mongoose from "mongoose";

// mongoose.connect(process.env.MONGO_URI);
//we can use this method but a lot

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDb connected");
  } catch (error) {
    console.error("MongoDb Connection Error", error);
    process.exit(1);
  }
};

export default connectDB;

import mongoose from "mongoose";

// mongoose.connect(process.env.MONGO_URI);
//we can use this method but a lot
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

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

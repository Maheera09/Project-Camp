import dotenv from "dotenv";
import express from "express";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  //.cofig takes options as object and here we provide the path where our .env file is.
  path: "./.env",
});

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Express server is listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error", error);
    process.exit(1);
  });

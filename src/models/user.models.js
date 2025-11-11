import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    avatar: {
      //each of the field requre some type
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: ``,
        localPath: "https://placehold.co/200x200",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordTokenExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true, //You can track when a user was created or last updat
  }
);

//Pre Hooks Of Mongoose

userSchema.pre("save", async function (next) {
  //make sure to use a proper function here instead of arrow function because you need the context
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10); //two arguements i.e what field you want to encrypt and how many rounds of encryption it must go through
  next();
});

//Methods of Mongoose

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//Generate Access Token and Refresh token i.e generating token with data

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      //this function encrypts the info and creates a token out of it.
      _id: this._id,
      email: this.email,
      username: this.username, //this whole information is knows as payload.
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// Generating token without data. Such type of tken can be used for resetting the password or verifying user.

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex"); //we use crypto module to create a random token of 20 bytes and convert it into hexadecimal string.

  //since we will also store this token on database for a while that's why we will perfer to hash it

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 20 * 60 * 1000; //20 mins

  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);

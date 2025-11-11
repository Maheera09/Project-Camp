import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", ""); //taking access to accessToken but if not just access the authorization header.

  if (!token) {
    throw new ApiError(401, "Unauthorizted Request.");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); //decodes the token
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next(); //hop on to next middleware if there's any or just proceed with the controller
  } catch (err) {
    throw new ApiError(401, "Invalid Access Token");
  }
});

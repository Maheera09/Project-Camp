import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateAccessandRefreshTokens = async (userID) => {
  try {
    const user = await User.findById(userID); //we created a user by using the uderid we got as arguement. Now we can access the methods to generate the access and refresh token.
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken; // saving the refresh token to database.
    await user.save({ validateBeforeSave: false }); //we don't want to validate all the fields in the databse because we are aware which one we touched. That's why we turned it off. we will use save method after we make some changing to tthe field in the database.
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the tokens."
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  /**Step 1: Acept data from front-end.
   Data can come from params, auth, headers and body. For now we are assuming that data is coming from the body**/
  const { email, username, password, role } = req.body;
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  }); //used the findOne method of User made using moongoose schema then searched in database for the provided email or username and stored it in existed user.

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists.", []);
  } // if user already in database, throw error.

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  }); //if user is not in database, then create it.
  // Now, we need to send some e-mail to the user. So, we need to generate tokens.

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false }); //now at this point we have covered most our fields in the user schema.

  // we also need to create to create access token. It is created on the server and sent to the client.
  // we also need to create refresh token that is saved in database.
  //so we created a method generateAccessandRefreshTokens() for that

  //now we need to send mail to verify the user
  await sendEmail({
    email: user?.email,
    subject: "Please verify your email.",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
      // //here we are generating a dynamic url. req.protocol gives us the protocol whatever it is e.g http ot https. our Api is /api/v1/users/verify-email and we will create this route later. This url has that unhashed token as well. The route we create will take this unhashed token and process this.
    ),
  });

  //Now we have to send the response back and we can send limited amount of data.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  ); //select takes a string and removes the field.

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user.");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User Registered successfully and verification email has been sent. Please Check your e-mail"
      )
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Email is required.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User doesn't exist.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid Credentials.");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    user._id
  );

  //Now we have to send the response back and we can send limited amount of data.
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  ); //select takes a string and removes the field.

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true, //once everything is done give us the most updated data
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched Successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params; //params gives the access of URL itself. If your route looks like /verify-email/:verificationToken, then req.params.verificationToken will contain whatever is in that part of the URL.

  if (!verificationToken) {
    throw new ApiError(400, "Email Verification Token is Missing!");
  }

  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex"); //The token that was sent to the user’s email is hashed before storing it in the database. So, to find it in the database, you also need to hash the one the user sends back — using the same algorithm (sha256).

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() }, //Find a user whose verification token has not expired yet — i.e., the expiry date is still greater than the current time."
  });

  if (!user) {
    throw new ApiError(400, "Token is Invalid or expired!");
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  //Once the user has verified their email, we clear these fields so they can’t be reused.

  user.isEmailVerified = true; //Mark email as verified
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isEmailVerified: true,
      },
      "Email is verified"
    )
  );
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified!");
  }
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false }); //now at this point we have covered most our fields in the user schema.

  //now we need to send mail to verify the user
  await sendEmail({
    email: user?.email,
    subject: "Please verify your email.",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
      // //here we are generating a dynamic url. req.protocol gives us the protocol whatever it is e.g http ot https. our Api is /api/v1/users/verify-email and we will create this route later. This url has that unhashed token as well. The route we create will take this unhashed token and process this.
    ),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mail sent to your email id"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //Access Token can only be refreshed using Refresh Token
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ); //decoded refresh token

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired!");
    }

    const options = {
      //used in Node.js while setting cookies in Node.js
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessandRefreshTokens(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (err) {
    throw new ApiError(401, "Invalid Refresh Token!");
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Reset Password Request",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
    ),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent to your mail id!"
      )
    );
});

const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(489, "Token is invalid or expired!");
  }

  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPassValid = await user.isPasswordCorrect(oldPassword);

  if (!isPassValid) {
    throw new ApiError(400, "Invalid Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully!"));
});

// const getCurrentUser = asyncHandler(async (req, res) => {});
export {
  registerUser,
  login,
  logOutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
  changePassword,
};

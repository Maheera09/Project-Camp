import { Router } from "express";
import {
  login,
  registerUser,
  logOutUser,
  verifyEmail,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
  getCurrentUser,
  resendEmailVerification,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  userRegisterValidator,
  userloginValidator,
  userChangeCurrentPassword,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

//unsecured routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);

router.route("/login").post(userloginValidator(), validate, login);

router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/refreshToken").post(refreshAccessToken);

router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);

router
  .route("/reset-password/:resetToken")
  .post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

//secured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/current-user").post(verifyJWT, getCurrentUser);

router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

/*When a POST request hits /register:
1. userRegisterValidator() runs first → attaches validation rules to the request.
2. validate runs next → checks for errors from step 1.
3. If all good → registerUser executes to actually create the user in DB.*/

export default router;

import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail() //checks the format of the emails
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lowercase.")
      .isLength({ min: 3 })
      .withMessage("Username must be at least three characters long."),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password shouldn't be empty"),
    body("fullname").optional().trim(),
  ];
};

const userloginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Invalid Email."),

    body("password").notEmpty().withMessage("Password is required"),
  ];
};

const userChangeCurrentPassword = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old Password is required"),
    body("newPassword").notEmpty().withMessage("New Password is required"),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is valid"),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [body("newPassword").notEmpty().withMessage("Password is required")];
};

export {
  userRegisterValidator,
  userloginValidator,
  userChangeCurrentPassword,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
};

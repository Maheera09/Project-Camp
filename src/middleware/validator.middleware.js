import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";
//This validator we are writing is reusable
export const validate = (req, res, next) => {
  //most of the middle we write required request, response and next.
  const errors = validationResult(req); //gathers validation erros.
  if (errors.isEmpty()) {
    return next(); // if there is no error we don't need to do anything
  }
  //otherwise if there is an error we throw the following error:
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));
  throw new ApiError(422, "Received Data is not Valid.", extractedErrors);
};

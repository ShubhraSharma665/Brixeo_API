import * as Joi from "joi";
import { NextFunction } from "express";
import { validate } from "../helpers/ValidationHelper";
import { ReqInterface, ResInterface } from "../interfaces/RequestInterface";
import { isRequiredError } from "../utils/string";

class AuthValidation {
  static async loginValidation(
    req: ReqInterface,
    res: ResInterface,
    next: NextFunction,
  ) {
    const schema = Joi.object().keys({
      emailId: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const isValid = await validate(req.body, res, schema);
    if (isValid) {
      next();
    }
  }

  static async signUpValidation(
    req: ReqInterface,
    res: ResInterface,
    next: NextFunction,
  ) {
    const schema = Joi.object().keys({
      firstName: Joi.string().required().messages({
        "any.required": isRequiredError("First name"),
      }),
      lastName: Joi.string().required().messages({
        "any.required": isRequiredError("Last name"),
      }),
      emailId: Joi.string().email().required().messages({
        "any.required": isRequiredError("Email Id"),
      }),
      type: Joi.string().required().messages({
        "any.required": isRequiredError("Type"),
      }),
      password: Joi.string().required().messages({
        "any.required": isRequiredError("Password"),
      }),
      confirmPassword:Joi.string().optional()
    });
    const isValid = await validate(req.body, res, schema);
    if (isValid) {
      next();
    }
  }

  static async forgotPasswordValidation(
    req: ReqInterface,
    res: ResInterface,
    next: NextFunction,
  ) {
    const schema = Joi.object().keys({
      emailId: Joi.string().email().required(),
    });
    const isValid = await validate(req.body, res, schema);
    if (isValid) {
      next();
    }
  }

  static async socialSignupValidation(
    req: ReqInterface,
    res: ResInterface,
    next: NextFunction,
  ) {
    const schema = Joi.object().keys({
      name: Joi.string().optional(),
      email: Joi.string().email().required(),
      device_token: Joi.string().optional(),
      country_code: Joi.string().optional(),
      mobile_number: Joi.string().optional(),
      device_type: Joi.string().optional(),
      login_type: Joi.string().required(),
      social_id: Joi.string().required(),
    });
    const isValid = await validate(req.body, res, schema);
    if (isValid) {
      next();
    }
  }

  static async verifyOTPValidation(
    req: ReqInterface,
    res: ResInterface,
    next: NextFunction,
  ) {
    const schema = Joi.object().keys({
      country_code: Joi.string().required(),
      mobile_number: Joi.string().required(),
      otp: Joi.number().required(),
    });
    const isValid = await validate(req.body, res, schema);
    if (isValid) {
      next();
    }
  }

  static async resetPasswordValidation(
    req: ReqInterface,
    res: ResInterface,
    next: NextFunction,
  ) {
    const schema = Joi.object().keys({
      password: Joi.string().required(),
    });
    const isValid = await validate(req.body, res, schema);
    if (isValid) {
      next();
    }
  }

  static async ChangePasswordValidation(
    req: ReqInterface,
    res: ResInterface,
    next: NextFunction,
  ) {
    const schema = Joi.object().keys({
      password: Joi.string()
        .pattern(
          new RegExp(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/,
          ),
        )
        .required()
        .messages({
          "string.pattern.base": `Password atleast contain 8 characters, atleast contain one captital letter, atleast contain one small letter, atleast contain one digit, atleast contain one special character`,
          "string.empty": `Password cannot be empty`,
          "any.required": `Password is required`,
        }),
      new_password: Joi.string()
        .pattern(
          new RegExp(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/,
          ),
        )
        .required()
        .messages({
          "string.pattern.base": `New password atleast contain 8 characters, atleast contain one captital letter, atleast contain one small letter, atleast contain one digit, atleast contain one special character`,
          "string.empty": `New password cannot be empty`,
          "any.required": `New password is required`,
        }),
    });
    const isValid = await validate(req.body, res, schema);
    if (isValid) {
      next();
    }
  }

}

export default AuthValidation;

import express from "express";
import bcrypt from "bcrypt";
import moment from "moment";

//import all middleware below this
import SchemaValidator from "middleware/schemaValidation/schemaValidation";
import {
  AuthenticateApiAccess,
  GenerateToken,
  GenerateAccountVerificationToken
} from "middleware/authHandler/authHandler";

//import all middleware above this

//import all services below this

import { AuthService } from "services/";

//import all services above this

//import all the utils below this
import { logger } from 'utils/logger';
//import all the utils above this

// We are using the formatted Joi Validation error
// Pass false as argument to use a generic error
const validateRequest = SchemaValidator(true);

let router = express.Router();

router.post(
  "/login/:userType",
  [validateRequest, AuthenticateApiAccess],
  async (req, res, next) => {
    //get the user type
    const userType = req.params.userType;

    //get the login details
    const loginData = req.body;

    //initiate the auth service
    const authService = new AuthService(userType);

    try {
      //get user details
      const user = await authService.login(loginData);

      if (!user) {
        let err = new Error("No User Found");
        err.code = "404";
        err.type = "UserNotFound";
        return next(err);
      }

      const isPasswordCorrect = await bcrypt.compare(
        loginData.password,
        user.password
      );

      if (!isPasswordCorrect) {
        let err = new Error("Password is invalid");
        err.code = "403";
        err.type = "UnauthorizedRequest";
        return next(err);
      }

      if (!user.isVerified) {
        let err = new Error("Account Is Not Verified");
        err.code = "403";
        err.type = "UnauthorizedRequest";
        return next(err);
      }

      try {
        const token = await GenerateToken(user);

        res.status(200).json({
          success: true,
          token
        });
      } catch (err) {
        return next(err);
      }
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/register/:userType",
  [validateRequest, AuthenticateApiAccess],
  async (req, res, next) => {
    //get the user type
    const userType = req.params.userType;

    //get the login details
    const signUpData = req.body;

    //initiate the auth service
    const authService = new AuthService(userType);

    //get user details
    const user = await authService.getUserByUserName(signUpData.username);

    if (user) {
      let err = new Error("User already exists");
      err.code = "409";
      err.type = "UserAlreadyExists";
      return next(err);
    }

    let { password, ...newTempUser } = signUpData;

    //generate hashed passowrd
    newTempUser.password = await bcrypt.hash(password, 12);

    //geneare account verification token and expiry date
    newTempUser.accountVerificationToken = await GenerateAccountVerificationToken();
    newTempUser.accountVerificationTokenExpired = moment(new Date()).add(
      15,
      "m"
    );

    //create new user
    const newUser = await authService.register(newTempUser);

    if (!newUser) {
      let err = new Error("Error in creating user.");
      err.code = "422";
      err.type = "UserCanNotBeCreated";
      return next(err);
    }

    return res.status(201).json(newUser);
  }
);

router.get(
  "/verify/:userType/:token",
  AuthenticateApiAccess,
  async (req, res, next) => {
    const { userType, token } = req.params;

    //initiate the auth service
    const authService = new AuthService(userType);

    const user = await authService.getUserByToken(token);

    if (!user) {
      let err = new Error("Invalid Token");
      err.code = "422";
      err.type = "InvalidVerificationToken";
      return next(err);
    }

    if (user.isVerified) {
      return res.status(200).json({
        status: "success",
        message: "Account Already Verified."
      });
    }

    if (moment(new Date()) <= moment(user.accountVerificationTokenExpired)) {
      let updateUser = await authService.updateUser(
        { _id: user.id },
        {
          isVerified: true,
          accountVerificationToken: null,
          accountVerificationTokenExpired: null
        }
      );

      if (updateUser.nModified) {
        return res.status(200).json({
          status: "success",
          message: "Account Verify Successfully."
        });
      }

      return next(new Error("Something Went wrong. Account not verified"));
    } else {
      let err = new Error("Token Expired");
      err.code = "422";
      err.type = "TokenExpired";
      return next(err);
    }
  }
);

router.post(
  "/forgot-password/:userType",
  AuthenticateApiAccess,
  async (req, res, next) => {
    let { userType } = req.params;

    let { username } = req.body;

    const authService = new AuthService(userType);

    const user = await authService.getUserByUserName(username);

    if (!user) {
      let err = new Error("No User Found");
      err.code = "404";
      err.type = "UserNotFound";
      return next(err);
    }

    const resetToken = await GenerateAccountVerificationToken();

    const tempData = {
      userId: user._id,
      resetToken: resetToken,
      linkExpired: moment(new Date()).add(15, "m")
    };

    const resetTokenEntry = await authService.resetPassword(tempData);

    if (!resetTokenEntry) {
      return next(new Error("Something went wrong while restting password."));
    }

    return res.status(200).json({
      status: "success",
      message: "Password Reset Email Send Successfully"
    });
  }
);

router.post(
  "/reset-password/:userType/:resetToken",
  [validateRequest, AuthenticateApiAccess],
  async (req, res, next) => {
    let { userType, resetToken } = req.params;

    const { oldPassword , newPassword } = req.body;

    const authService = new AuthService(userType);

    const resetTokenData = await authService.getResetToken(resetToken);

    if (!resetTokenData) {
      let err = new Error("Invalid Token");
      err.code = "422";
      err.type = "InvalidResetToken";
      return next(err);
    }

    if (moment(new Date()) <= moment(resetTokenData.linkExpired)) {

      const user = await authService.getUserById(resetTokenData.userId);

      const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (!isPasswordCorrect) {
        let err = new Error("Old Password Is Invalid");
        err.code = "422";
        err.type = "OldPasswordDidNotMatch";
        return next(err);
      }

      let newPasswordHash = await bcrypt.hash(newPassword, 12);

      const updateUser = await authService.updateUser(
        { _id: resetTokenData.userId },
        { password: newPasswordHash }
      );

      if (updateUser.nModified > 0) {
        let updateToken = await authService.removeResetToken(
          resetTokenData.userId
        );

        if (updateToken.deletedCount) {
          return res.status(200).json({
            status: "success",
            message: "Password Reset Successfully."
          });
        } else {
          return next(new Error("Something went wrong while resenting token."));
        }
      } else {
        return next(new Error("Something went wrong while updating password"));
      }
    } else {
      let err = new Error("Reset Token Expired");
      err.code = "422";
      err.type = "ResetTokenExpired";
      return next(err);
    }
  }
);

module.exports = router;

import userModels from "../models/user.models";
import _RS from "../helpers/ResponseHelper";
const express = require("express");

const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
export class CommanController {
  static async profile(req, res, next) {
    const startTime = new Date().getTime();
    const { id } = req.user;
    try {
      let isUserExist = await userModels.findOne({
        _id: id,
      }).populate({path: "categories"})

      if (!isUserExist) {
        return _RS.notFound(
          res,
          "NOTFOUND",
          "User doesn't exists with us",
          {},
          startTime
        );
      }
      if (!isUserExist.isActive) {
        return _RS.badRequest(res, "", "User is not active!!", {}, startTime);
      }

      return _RS.ok(
        res,
        "SUCCESS",
        "User found successfully",
        isUserExist,
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
}

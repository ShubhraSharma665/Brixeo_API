import userModels from "../models/user.models";
import _RS from "../helpers/ResponseHelper";
import newsletterModel from "../models/newsletter.model";
import mongoose from "mongoose";
import firebaseModel from "../models/firebase.model";
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
        return _RS.badRequest(res, "", "This account is deactivated. Please contact to admin!!", {}, startTime);
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

  static async newsLetterAdd(req, res, next) {
    const startTime = new Date().getTime();
    const { emailId } = req.body
    try {
      let isExist = await newsletterModel.findOne({ emailId: emailId.toLowerCase() });
      if(isExist){
        return _RS.badRequest(
          res,
          "ERROR",
          "Email address already exists!",
          {},
          startTime
        );
      }
      await newsletterModel.create(req.body)
      
      return _RS.ok(
        res,
        "SUCCESS",
        "Email address added successfully",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async newsLetterUpdate(req, res, next) {
    const startTime = new Date().getTime();
    const { _id, emailId } = req.body
    try {
      let isExist = await newsletterModel.findOne({ emailId: emailId.toLowerCase() });
      if(isExist){
        return _RS.badRequest(
          res,
          "ERROR",
          "Email address already exists!",
          {},
          startTime
        );
      }
      const newId = new mongoose.Types.ObjectId(_id)
      await newsletterModel.updateOne({_id:newId},{$set:{emailId:emailId.toLowerCase()}})
      
      return _RS.ok(
        res,
        "SUCCESS",
        "Email address added successfully",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async newsLetterStatusChange(req, res, next) {
    const startTime = new Date().getTime();
    const { _id } = req.body
    try {
      let isExist = await newsletterModel.findOne({ _id: new mongoose.Types.ObjectId(_id) });
      isExist.status = !isExist.status 
      await isExist.save()

      return _RS.ok(
        res,
        "SUCCESS",
        "Status changed successfully",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }



  static async newsLetterGet(req, res, next) {
    const startTime = new Date().getTime();
    let { page, limit, search } = req.query;
    try {
      const matchStage: any = {};

      const orConditions: any = [];

      if (search) {
        orConditions.push(
          {emailId: { $regex: search, $options: "i" }},
        );
      }

      let offset = (Number(page) - 1) * Number(limit) || 0;
      if (orConditions.length > 0) {
        matchStage.$or = orConditions;
      }
      console.log(offset, req.query);

      const list = await newsletterModel
        .aggregate([
          {
            $match: matchStage,
          },
        ])
        .skip(offset)
        .limit(parseInt(limit));

      const totalCount = await newsletterModel.countDocuments(matchStage);

      return _RS.ok(
        res,
        "SUCCESS",
        "Newsletter found successfully",
        { list, totalCount: totalCount, page: page },
        startTime
      );
    } catch (err) {
      next(err);
    }
  }


  static async forgotPassword(req, res, next) {
    const startTime = new Date().getTime();
    const { emailId } = req.body
    try {
      let isUserExist = await userModels.findOne({ emailId: emailId.toLowerCase() });
      if(!isUserExist){
        return _RS.badRequest(
          res,
          "ERROR",
          "Email not found with us!",
          {},
          startTime
        );
      }
      return _RS.ok(
        res,
        "SUCCESS",
        "Password reset link send successfully, Please check your email",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async saveFCMToken(req, res, next) {
    const startTime = new Date().getTime();
    const { receiverId, fcmToken } = req.body
    try {
      let isExist = await firebaseModel.findOne({ fcmToken: fcmToken });
      if(isExist){
        return _RS.ok(
          res,
          "SUCCESS",
          "FCM token already saved!!",
          {},
          startTime
        );
      }
      await new firebaseModel({
        userId:receiverId,
        fcmToken:fcmToken
      }).save()
      return _RS.ok(
        res,
        "SUCCESS",
        "FCM token saved successfully!!",
        {},
        startTime
      );
      
    } catch (err) {
      next(err);
    }
  }
}

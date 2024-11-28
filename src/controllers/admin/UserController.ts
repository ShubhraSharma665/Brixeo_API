import express from "express";
import _RS from "../../helpers/ResponseHelper";
import userModels from "../../models/user.models";
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
export class UserController {
  static async GetUsersList(req, res, next) {
    const startTime = new Date().getTime();
    let { page, limit, search } = req.query;
    try {
      const matchStage: any = { type: { $ne: "admin" } };

      const orConditions: any = [];

      if (search) {
        orConditions.push(
          {
            emailId: { $regex: search, $options: "i" },
          },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } }
        );
      }

      let offset = (Number(page) - 1) * Number(limit) || 0;
      // Combine match conditions with $or conditions
      if (orConditions.length > 0) {
        matchStage.$or = orConditions;
      }
      console.log(offset, req.query);

      const list = await userModels
        .aggregate([
          {
            $match: matchStage,
          },
        ])
        .skip(offset)
        .limit(parseInt(limit));

      const totalCount = await userModels.countDocuments(matchStage);

      return _RS.ok(
        res,
        "SUCCESS",
        "Users found successfully!!",
        { list, totalCount: totalCount, page: page },
        startTime
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    const startTime = new Date().getTime();

    try {
      let usersList = await userModels.find({});
      return _RS.ok(
        res,
        "SUCCESS",
        "Users found successfully!!",
        usersList,
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const {
        firstName,
        lastName,
        emailId,
        mobileNumber,
        gender,
        dob,
        primaryAddress,
        secondaryAddress,
        rate,
        aboutMe,
        myServices,
        preferredLocation,
        categories,
      } = req.body;
      const { profileImage, document, projectImages } = req.files;
      const { id } = req.user;
      let user = await userModels.findOne({ _id: id });
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.emailId = emailId || user.emailId;
      user.mobileNumber = mobileNumber || user.mobileNumber;
      user.gender = gender || user.gender;
      user.dob = dob || user.dob;
      user.primaryAddress = primaryAddress || user.primaryAddress;
      user.secondaryAddress = secondaryAddress || user.secondaryAddress;
      user.rate = rate || user.rate;
      user.aboutMe = aboutMe || user.aboutMe;
      user.myServices = myServices || user.myServices;
      user.preferredLocation =
        JSON.parse(preferredLocation) || user.preferredLocation;
      user.categories = JSON.parse(categories) || user.categories;
      user.profileImage = profileImage[0].originalname || user.profileImage;
      user.document = document || user.document;
      user.projectImages =
        projectImages.map((item) => item.originalname) || user.projectImages;
      await user.save();
      return _RS.ok(
        res,
        "SUCCESS",
        "Profile updated successfully!!",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
}

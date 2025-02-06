import express from "express";
import _RS from "../../helpers/ResponseHelper";
import userModels from "../../models/user.models";
import bussinessproofModel from "../../models/bussinessproof.model";
const cookieParser = require("cookie-parser");
import Auth from "../../utils/Auth";
import { USER_TYPE } from "../../constants";
import mongoose from "mongoose";

const app = express();

app.use(cookieParser());
export class UserController {
  static async GetUsersList(req, res, next) {
    const startTime = new Date().getTime();
    let { page, limit, search } = req.query;
    const { id, type } = req.user;
    const newId = new mongoose.Types.ObjectId(id);
    try {
      const orConditions: any = [];
      const orTypeCondition = [];
      const matchStage: any = {};
      if (type === USER_TYPE.contractor) {
        matchStage.$or = [
          {
            $and: [
              { type: { $ne: "admin" } },
              { type: USER_TYPE.contractor },
              { _id: newId },
            ],
          },
          // {
          //   $and: [
          //     { type: { $ne: "admin" } },
          //     { type: USER_TYPE.subContractor }, // Get child profiles with subadmin type
          //     { parentId: newId }, // Match subadmin's parentId with the contractor's ID
          //   ],
          // },
        ];
      }

      if (type === USER_TYPE.viewingAgent) {
        matchStage.$or = [
          {
            $and: [
              { type: { $ne: "admin" } },
              { type: USER_TYPE.viewingAgent },
              { _id: newId },
            ],
          },
          // {
          //   $and: [
          //     { type: { $ne: "admin" } },
          //     { type: USER_TYPE.subViewingAgent },
          //     { parentId: newId },
          //   ],
          // },
        ];
      }
      if (type === USER_TYPE.admin) {
        matchStage.$and = [
          { type: { $ne: "admin" } },
          { type: { $ne: USER_TYPE.subAdmin } },
          { type: { $ne: USER_TYPE.subContractor } },
          { type: { $ne: USER_TYPE.subViewingAgent } },
        ];
      }

      if (type === USER_TYPE.subAdmin) {
        matchStage.$and = [{ _id: { $ne: newId }}];
      }
      if (type === USER_TYPE.subViewingAgent) {
        matchStage.$or = [{ _id: newId }];
      }
      if (type === USER_TYPE.subContractor) {
        matchStage.$or = [{ _id: newId }];
      }

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

  static async GetSubUsersList(req, res, next) {
    const startTime = new Date().getTime();
    let { page, limit, search } = req.query;
    const { id, type } = req.user;
    const newId = new mongoose.Types.ObjectId(id);
    try {
      const orConditions: any = [];
      const orTypeCondition = [];
      const matchStage: any = {};
      if (type === USER_TYPE.contractor) {
        matchStage.$or = [
          // {
          //   $and: [
          //     { type: { $ne: "admin" } },
          //     { type: USER_TYPE.contractor },
          //     { _id: newId },
          //   ],
          // },
          {
            $and: [
              { type: { $ne: "admin" } },
              { type: USER_TYPE.subContractor }, // Get child profiles with subadmin type
              { parentId: newId }, // Match subadmin's parentId with the contractor's ID
            ],
          },
        ];
      }

      if (type === USER_TYPE.viewingAgent) {
        // If the user type is viewing agents
        matchStage.$or = [
          // {
          //   $and: [
          //     { type: { $ne: "admin" } },
          //     { type: USER_TYPE.viewingAgent },
          //     { _id: newId },
          //   ],
          // },
          {
            $and: [
              { type: { $ne: "admin" } },
              { type: USER_TYPE.subViewingAgent },
              { parentId: newId },
            ],
          },
        ];
      }
      if (type === USER_TYPE.admin) {
        matchStage.$and = [
          { type: { $ne: "admin" } },
          { type: { $ne: USER_TYPE.contractor } },
          { type: { $ne: USER_TYPE.viewingAgent } },
        ];
      }

      if (type === USER_TYPE.subAdmin) {
        matchStage.$and = [{ _id: { $ne: newId } },{ _id: { $eq: newId }}];
      }
      if (type === USER_TYPE.subViewingAgent) {
        matchStage.$and = [{ _id: newId },{type:"admin"}];
      }
      if (type === USER_TYPE.subContractor) {
        matchStage.$or = [{ _id: newId },{type:"admin"}];
      }

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
    const { id } = req.body;

    try {
      let usersList = await userModels
        .findOne({ _id: id })
        .populate({ path: "categories" });
      return _RS.ok(
        res,
        "SUCCESS",
        "User found successfully!!",
        usersList,
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
  static async addSubUser(req, res, next) {
    const startTime = new Date().getTime();
    const { firstName, lastName, email, password, permissions } = req.body;
    const { id, type } = req.user;
    try {
      let users = await userModels.findOne({ emailId: email.toLowerCase() });
      console.log("check", users);
      if (users) {
        return _RS.notAcceptable(
          res,
          "Error",
          "Email already exists!!",
          {},
          startTime
        );
      }
      const userpassword = await Auth.encryptPassword(password);
      const user: any = {
        firstName: firstName,
        lastName: lastName,
        emailId: email.toLowerCase(),
        password: userpassword,
        parentId: id,
        isShow:false
      };
      if (type === USER_TYPE.admin) {
        (user.permissions = permissions), (user.type = USER_TYPE.subAdmin);
      } else {
        if (type === USER_TYPE.contractor) {
          user.type = USER_TYPE.subContractor;
        }
        if (type === USER_TYPE.viewingAgent) {
          user.type = USER_TYPE.subViewingAgent;
        }
        user.permissions = [
          { key: "Dashboard", view: true, add: true, edit: true },
          { key: "Profile", view: true, add: true, edit: true },
          { key: "Users", view: true, add: true, edit: true },
          { key: "Category", view: false, add: false, edit: false },
          { key: "Newsletters", view: false, add: false, edit: false },
          { key: "Blogs", view: false, add: false, edit: false },
          { key: "Chats", view: false, add: false, edit: false },
          { key: "Change Password", view: true, add: true, edit: true },
        ];
      }

      await userModels.create(user);
      return _RS.ok(res, "SUCCESS", "User saved successfully!!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }
  static async activeUnactive(req, res, next) {
    const startTime = new Date().getTime();
    const { id, showActive } = req.body;

    try {
      let user = await userModels.findOne({ _id: id });
      if(showActive){
        user.isAvailable = !user.isAvailable;
      }else{
        user.isActive = !user.isActive;
      }
      await user.save();
      return _RS.ok(
        res,
        "SUCCESS",
        "User Status changed successfully!!",
        {},
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
        title,
        bussinessName,
        aboutMe,
        categories,
        licenseName,
        licenseID,
        cities,
        state,
      } = req.body;
      // const { profileImage, document, projectImages } = req.files;
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
      user.title = title || user.title;
      user.bussinessName = bussinessName || user.bussinessName;
      // user.actualRate = actualRate || user.actualRate;
      user.aboutMe = aboutMe || user.aboutMe;
      // user.myServices = JSON.parse(myServices) || user.myServices;
      user.licenseID = licenseID || user.licenseID;
      user.licenseName = licenseName || user.licenseName;
      user.state = state || user.state;
      user.cities = JSON.parse(cities) || user.cities;
      user.isShow = true;
      user.categories = JSON.parse(categories) || user.categories;
      user.profileImage =
        typeof req?.body?.profileImage == "string"
          ? req?.body?.profileImage
          : req?.files?.profileImage[0].originalname;
      user.document =
        typeof req?.body?.document === "string"
          ? req?.body?.document
          : req?.files?.document[0].originalname;
      user.licenseImage =
        typeof req?.body?.licenseImage === "string"
          ? req?.body?.licenseImage
          : req?.files?.licenseImage[0].originalname;
      user.projectImages =
        req?.body?.projectImages ||
        req?.files?.projectImages?.map((item) => item.originalname);
      console.log(
        "projectImages",
        user.projectImages,
        req?.files?.projectImages
      );
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

  static async updateBussinessProfile(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const { name, type, SOI, EIN, DUNS } = req.body;
      // const { profileImage, document, projectImages } = req.files;
      const { id } = req.user;

      let BussinessProof = await bussinessproofModel.findOne({ _id: id });
      if (BussinessProof) {
        BussinessProof.name = name || BussinessProof.name;
        BussinessProof.type = type || BussinessProof.type;
        BussinessProof.SOI = SOI || BussinessProof.SOI;
        BussinessProof.EIN = EIN || BussinessProof.EIN;
        BussinessProof.DUNS = DUNS || BussinessProof.DUNS;
        BussinessProof.COGS =
          typeof req?.body?.COGS == "string"
            ? req?.body?.COGS
            : req?.files?.COGS[0].originalname;
        BussinessProof.AOI =
          typeof req?.body?.AOI === "string"
            ? req?.body?.AOI
            : req?.files?.AOI[0].originalname;
        BussinessProof.OA =
          typeof req?.body?.OA === "string"
            ? req?.body?.OA
            : req?.files?.OA[0].originalname;
        BussinessProof.stateIDFront =
          typeof req?.body?.stateIDFront === "string"
            ? req?.body?.stateIDFront
            : req?.files?.stateIDFront[0].originalname;
        BussinessProof.stateIDBack =
          typeof req?.body?.stateIDBack === "string"
            ? req?.body?.stateIDBack
            : req?.files?.stateIDBack[0].originalname;
        BussinessProof.COI =
          typeof req?.body?.COI === "string"
            ? req?.body?.COI
            : req?.files?.COI[0].originalname;
        await BussinessProof.save();
        return _RS.ok(
          res,
          "SUCCESS",
          "Bussiness profile updated successfully!!",
          {},
          startTime
        );
      } else {
        let saveTheBussiness: any = {};
        saveTheBussiness.userId = id;
        saveTheBussiness.name = name;
        saveTheBussiness.type = type;
        saveTheBussiness.SOI = SOI;
        saveTheBussiness.EIN = EIN;
        saveTheBussiness.DUNS = DUNS;
        saveTheBussiness.COGS =
          typeof req?.body?.COGS == "string"
            ? req?.body?.COGS
            : req?.files?.COGS[0].originalname;
        saveTheBussiness.AOI =
          typeof req?.body?.AOI === "string"
            ? req?.body?.AOI
            : req?.files?.AOI[0].originalname;
        saveTheBussiness.OA =
          typeof req?.body?.OA === "string"
            ? req?.body?.OA
            : req?.files?.OA[0].originalname;
        saveTheBussiness.stateIDFront =
          typeof req?.body?.stateIDFront === "string"
            ? req?.body?.stateIDFront
            : req?.files?.stateIDFront[0].originalname;
        saveTheBussiness.stateIDBack =
          typeof req?.body?.stateIDBack === "string"
            ? req?.body?.stateIDBack
            : req?.files?.stateIDBack[0].originalname;
        saveTheBussiness.COI =
          typeof req?.body?.COI === "string"
            ? req?.body?.COI
            : req?.files?.COI[0].originalname;
        const save = await bussinessproofModel.create(saveTheBussiness);
        return _RS.ok(
          res,
          "SUCCESS",
          "Bussiness profile created successfully!!",
          {},
          startTime
        );
      }
    } catch (err) {
      next(err);
    }
  }

  static async getBussinessProfile(req, res, next) {
    const startTime = new Date().getTime();
    const { id } = req.params;
    const newId = new mongoose.Types.ObjectId(id);
    try {
      let BussinessProof = await bussinessproofModel.findOne({ userId: newId });
      return _RS.ok(
        res,
        "SUCCESS",
        "Data found successfully!!",
        BussinessProof,
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async getUserProfileById(req, res, next) {
    const startTime = new Date().getTime();
    const { id } = req.params;
    const newId = new mongoose.Types.ObjectId(id);
    try {
      let isUserExist = await userModels
        .findOne({
          _id: newId,
        })
        .populate({ path: "categories" });

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
        return _RS.badRequest(
          res,
          "",
          "This account is deactivated. Please contact to admin!!",
          {},
          startTime
        );
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

  static async changePassword(req, res, next) {
    const startTime = new Date().getTime();
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const { id } = req.user;
    try {
      let isUserExist = await userModels.findOne({
        _id: id,
      });
      const isPasswordValid = await Auth.comparePassword(
        oldPassword,
        isUserExist.password
      );

      if (!isPasswordValid) {
        return _RS.conflict(
          res,
          "BAD REQUEST",
          "Old password Invalid",
          {},
          startTime
        );
      }
      const userpassword = await Auth.encryptPassword(newPassword);
      isUserExist.password = userpassword;
      isUserExist.save();
      return _RS.ok(
        res,
        "SUCCESS",
        "Password changed Successfully",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
}

import * as mongoose from "mongoose";
import { AggregatePaginateModel, model } from "mongoose";

import { USER_TYPE } from "../constants/user-type.enum";

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

export const LOGIN_TYPES = [
  "Mobile_Number",
  "Email",
  "Google",
  "Facebook",
  "Apple",
];

const User = new Schema(
  {
    firstName: {
      type: String,
      default: null,
    },
    lastName: {
      type: String,
      default: null,
    },
    emailId: {
      type: String,
      default: null,
    },
    mobileNumber: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      default: null,
    },
    dob: {
      type: String,
      default: null,
    },
    primaryAddress: {
      type: String,
      default: null,
    },
    secondaryAddress: {
      type: String,
      default: null,
    },
    actualRate: {
      type:Number,
      default:0
    },
    rate: {
      type: Number,
      default: 0,
    },
    preferredLocation: {
      type: Array,
      default: null,
    },
    categories: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "categories",
      },
    aboutMe: {
      type: String,
      default: null,
    },
    myServices: {
      type: [],
      default: null,
    },
    // countryCode: {
    //   type: String,
    //   default: "+91",
    // }, 
    location: {
      type: String,
      default: null,
    },
    password: {
      type: String,
    },
    otp: {
      type: Number,
      default: null,
    },

    language: {
      type: String,
      default: "en",
    },
    licenseName:{
      type: String,
      default: null,
    },
    licenseID:{
      type: String,
      default: null,
    },
    licenseImage:{
      type: String,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    document: {
      type: String,
      default: null,
    },
    projectImages: {
      type: Array,
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    BankInfo: {
      type: Object,
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isOtpVerify: {
      type: Boolean,
      default: false,
    },
    withdrawalStatus: {
      type: Boolean,
      enum: [true, false],
    },
    type: {
      type: String,
      enum: [
        USER_TYPE.admin,
        USER_TYPE.viewingAssistant,
        USER_TYPE.propertyOwner,
        USER_TYPE.contractor,
        USER_TYPE.subAdmin,
      ],
      // required:true
    },
    deviceToken: {
      type: String,
      default: null,
    },
    deviceType: {
      type: String,
      default: null,
    },
    socialId: {
      type: String,
      default: null,
    },
    loginType: { type: String, enum: LOGIN_TYPES, default: LOGIN_TYPES[0] },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mongoose.plugin(aggregatePaginate);

export default model<any, AggregatePaginateModel<any>>("User", User);

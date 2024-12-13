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
      required:true
    },
    lastName: {
      type: String,
      default: null,
      required:true
    },
    emailId: {
      type: String,
      default: null,
      required:true
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
    location: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required:true
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
    isEmailVerify: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"users",
      default: null,
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
    },
    deviceToken: {
      type: String,
      default: null,
    },
    deviceType: {
      type: String,
      default: null,
    },
    permissions: {
      dashboard: { view: Boolean, add: Boolean, edit: Boolean },
      users: { view: Boolean, add: Boolean, edit: Boolean },
      category: { view: Boolean, add: Boolean, edit: Boolean },
      newsletter: { view: Boolean, add: Boolean, edit: Boolean },
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

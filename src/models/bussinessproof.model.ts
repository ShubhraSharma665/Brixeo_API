import * as mongoose from "mongoose";
import { AggregatePaginateModel, model } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const BussinessProof = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    SOI: {
      // State of Incorporation
      type: String,
      required: true,
    },
    EIN: {
      type: String,
      required: true,
    },
    DUNS: {
      type: String,
      required: false,
    },
    COGS: {
      // Certificate of Good Standing
      type: String,
      required: true,
    },
    AOI: {
      // Articles of Incorporation
      type: String,
      required: true,
    },
    OA: {
      // Operating Agreement
      type: String,
      required: true,
    },
    stateIDFront: {
      // State ID or Legal Business Owner - Front
      type: String,
      required: true,
    },
    stateIDBack: {
      // State ID or Legal Business Owner - Back
      type: String,
      required: true,
    },
    COI: {
      // Certificate of Insurance (Optional)
      type: String,
      required: true,
    },
    // isActive: {
    //   type: Boolean,
    //   required: true,
    //   default: true,
    // },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mongoose.plugin(aggregatePaginate);

export default model<any, AggregatePaginateModel<any>>(
  "bussinessproofs",
  BussinessProof
);

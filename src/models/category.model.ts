import * as mongoose from "mongoose";
import { AggregatePaginateModel, model } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Category = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      default: null,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mongoose.plugin(aggregatePaginate);

export default model<any, AggregatePaginateModel<any>>("categories", Category);

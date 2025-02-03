import * as mongoose from "mongoose";
import { AggregatePaginateModel, model } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const BlogsSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    description:{
      type:String,
      required:true,
    },
    blogContent: {
      type: String,
      required: true,
    },
    blogTitle: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    tagsList: {
      type: Array,
      required: true,
    },
    isActive: {
      type: Boolean,
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

export default model<any, AggregatePaginateModel<any>>("blogs", BlogsSchema);

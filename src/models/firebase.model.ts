import * as mongoose from "mongoose";
import { AggregatePaginateModel, model } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const notificationsSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required:true },
    fcmToken: { type: String,  required:true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mongoose.plugin(aggregatePaginate);

export default model<any, AggregatePaginateModel<any>>("notifications", notificationsSchema);

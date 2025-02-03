import * as mongoose from "mongoose";
import { AggregatePaginateModel, model } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const MessageSchema = new mongoose.Schema(
    {
      chatId: { type: mongoose.Schema.Types.ObjectId, ref: "chats", required: true },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
      receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
      message: { type: String },
      file: { type: String }, // URL of uploaded file
      isRead: { type: Boolean, default: false },
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
  "messages",
  MessageSchema
);


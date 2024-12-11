const express = require("express");

import Auth from "../../utils/Auth";
import { USER_TYPE } from "../../constants/user-type.enum";
import _RS from "../../helpers/ResponseHelper";
import User from "../../models/user.models";
import categoryModel from "../../models/category.model";

const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
export class WebCategoryController {


  static async getNestedCategory(req, res, next) {
    const startTime = new Date().getTime();
    try {
      let isCategoriesExist = await categoryModel.aggregate([
        {
          $lookup: {
            from: "categories", // The collection name
            localField: "_id", // The parent's ID
            foreignField: "parentId", // Match it with the `parentId` in child categories
            as: "children", // Store matched children in this field
          },
        },
        {
          $match: {
            parentId: null, // Only fetch top-level categories
          },
        },
      ]);
  
      return _RS.ok(
        res,
        "SUCCESS",
        "Category found successfully",
        isCategoriesExist,
        startTime
      );
    } catch (err) {
      next(err);
    }
  }


}

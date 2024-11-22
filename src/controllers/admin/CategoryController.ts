const express = require("express");

import Auth from "../../utils/Auth";
import { USER_TYPE } from "../../constants/user-type.enum";
import _RS from "../../helpers/ResponseHelper";
import User from "../../models/user.models";
import categoryModel from "../../models/category.model";

const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
export class CategoryController {
  static async AddCategory(req, res, next) {
    const startTime = new Date().getTime();
    const { name, parentId } = req.body;
    try {
      let isCategoryExist: any = await categoryModel.findOne({
        name: name,
      });

      if (isCategoryExist) {
        return _RS.conflict(
          res,
          "CONFLICT",
          "Category already exists!!",
          {},
          startTime
        );
      }
      const data = {
        name: name,
        parentId: parentId !== "no-parent" ? parentId : null,
      };
      let addCategorry: any = await categoryModel.create(data);
      console.log("namenamenamenname", addCategorry);
      return _RS.ok(
        res,
        "SUCCESS",
        "Category successfully added",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async UpdateCategory(req, res, next) {
    const startTime = new Date().getTime();
    const { name, parentId, _id } = req.body;
    try {
      let isCategoryExist = await categoryModel.findOne({
        _id: _id,
      });

      if (!isCategoryExist) {
        return _RS.notFound(
          res,
          "NOTFOUND",
          "Category not found!!",
          {},
          startTime
        );
      }
      (isCategoryExist.name = name ? name : isCategoryExist.name),
        (isCategoryExist.parentId = parentId
          ? parentId
          : isCategoryExist.parentId);
      await isCategoryExist.save();
      return _RS.ok(
        res,
        "SUCCESS",
        "Category successfully updated",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
  static async getParentCategories(req, res, next) {
    const startTime = new Date().getTime();
    try {
      let isCategoriesExist = await categoryModel.find({ parentId: null });
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
  static async getChildCategories(req, res, next) {
    const startTime = new Date().getTime();
    try {
      let isCategoriesExist = await categoryModel.find({ parentId: { $ne: null } });
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
  static async GetCategory(req, res, next) {
    const startTime = new Date().getTime();
    let { page, limit, search } = req.query;
    try {
      const matchStage: any = {};

      const orConditions: any = [];

      if (search) {
        orConditions.push(
          {name: { $regex: search, $options: "i" }},
        );
      }

      let offset = (Number(page) - 1) * Number(limit) || 0;
      // Combine match conditions with $or conditions
      if (orConditions.length > 0) {
        matchStage.$or = orConditions;
      }
      console.log(offset, req.query);

      const list = await categoryModel
        .aggregate([
          {
            $match: matchStage, // Filter stage
          },
          {
            $lookup: {
              from: "categories",
              localField: "parentId",
              foreignField: "_id",
              as: "parentId",
            },
          },
          {
            $unwind: {
              path: "$parentId",
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .skip(offset)
        .limit(parseInt(limit));

      const totalCount = await categoryModel.countDocuments(matchStage);

      return _RS.ok(
        res,
        "SUCCESS",
        "Category found successfully",
        { list, totalCount: totalCount, page: page },
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async DeleteCategory(req, res, next) {
    const startTime = new Date().getTime();
    const { _id } = req.body;
    try {
      let isCategoriesExist = await categoryModel.findOne({ _id: _id });
      if (isCategoriesExist.parentId) {
        let removeCategory = await categoryModel.deleteOne({ _id: _id });
      } else {
        let removeCategory = await categoryModel.deleteMany({ _id: _id });
      }
      return _RS.ok(
        res,
        "SUCCESS",
        "Category removed successfully",
        isCategoriesExist,
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
}

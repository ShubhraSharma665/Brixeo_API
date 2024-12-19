const express = require("express");

import mongoose from "mongoose";
import { USER_TYPE } from "../../constants";
import _RS from "../../helpers/ResponseHelper";
import userModels from "../../models/user.models";

const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
export class SearchController {
  static async getSearchResults(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const { categoryIds, location } = req.body;
      console.log("categryIDS", categoryIds);
      const objectIdCategoryIds =
      categoryIds?.length > 0
        ? categoryIds.map((id) => new mongoose.Types.ObjectId(id))
        : [];

      const matchStage: any = {
        $or: [
          { type: USER_TYPE.viewingAssistant },
          { type: USER_TYPE.contractor },
        ],
      };
      if (categoryIds?.length > 0) {
        matchStage.categories = { $in: objectIdCategoryIds };
      }
      if (location) {
        matchStage.$or = [
          { state: { $regex: new RegExp(location, "i") } },
          { city: { $in: [new RegExp(location, "i")] }},
        ];
      }
      const searchResults = await userModels.aggregate([
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: "categories", // Name of the categories collection
            localField: "categories", // Field in user schema (array of categoryIds)
            foreignField: "_id", // Field in category schema (_id of categories)
            as: "categoryDetails", // Alias for the result (array of category objects)
          },
        },
        {
          $project: {
            firstName:1,
            rate: 1,
            projectImages: 1,
            categories: "$categoryDetails.name", // Include category names from the categoryDetails array
          },
        },
      ]);

      return _RS.ok(
        res,
        "SUCCESS",
        "Data found successfully",
        searchResults,
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async getProfileOfUser(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const { id } = req.params;
      const userId = new mongoose.Types.ObjectId(id)
      const searchResults = await userModels.aggregate([
        {
          $match: {_id:userId},
        },
        {
          $lookup: {
            from: "categories", // Name of the categories collection
            localField: "categories", // Field in user schema (array of categoryIds)
            foreignField: "_id", // Field in category schema (_id of categories)
            as: "categoryDetails", // Alias for the result (array of category objects)
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            primaryAddress: 1,
            secondaryAddress: 1,
            aboutMe: 1,
            myServices: 1,
            profileImage: 1,
            rate: 1,
            projectImages: 1,
            images: 1,
            categories: "$categoryDetails.name", // Include category names from the categoryDetails array
          },
        },{$sort:{rate:1}}
      ])

      return _RS.ok(
        res,
        "SUCCESS",
        "Data found successfully",
        searchResults,
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
}

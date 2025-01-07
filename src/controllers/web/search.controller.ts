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
      const { categoryIds, location, rateSort, min,max, search } = req.body;
      console.log("categryIDS", categoryIds);
      const objectIdCategoryIds =
        categoryIds?.length > 0
          ? categoryIds.map((id) => new mongoose.Types.ObjectId(id))
          : [];

      const matchStage: any = {
        $or: [{ type: USER_TYPE.viewingAgent }, { type: USER_TYPE.contractor }],
      };
      if (categoryIds?.length > 0) {
        matchStage.categories = { $in: objectIdCategoryIds };
      }
      if (location) {
        matchStage.$or = [
          { state: { $regex: new RegExp(location, "i") } },
          { cities: { $elemMatch: { $regex: new RegExp(location, "i") } } },
        ];
      }
      if(min && max){
        matchStage.$and = [
          { rate: { $gte: Number(min) } },
          { rate: { $lte: Number(max) } },
        ];
      }
    
      const pipeline: any[] = [
        {
          $match: matchStage,
        },
        {
          $lookup: {
            from: "categories",
            localField: "categories",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $project: {
            firstName: 1,
            rate: 1,
            title: 1,
            projectImages: 1,
            categories: "$categoryDetails.name",
          },
        },
      ];

      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { title: { $regex: new RegExp(search, "i") } }, // Match in `title` field
              { "categories": { $regex: new RegExp(search, "i") } }, // Match in category names
            ],
          },
        });
      }

      if (rateSort) {
        pipeline.push({
          $sort: {
            rate: rateSort === "highToLow" ? -1 : 1,
          },
        });
      }

      const searchResults = await userModels.aggregate(pipeline);

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

  static async searchLandingResults(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const result = await userModels.aggregate([
        {
          $facet: {
            contractors: [
              { $match: { type: USER_TYPE.contractor } }, // Filter for contractors
              // {
              //   $lookup: {
              //     from: "categories", // The name of the categories collection
              //     localField: "categories", // The field in the user model
              //     foreignField: "_id", // The field in the categories collection
              //     as: "categoryDetails", // Populated categories
              //   },
              // },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  rate: 1,
                  projectImages: 1,
                  // categories: "$categoryDetails.name",
                },
              },
            ],
            viewingAgents: [
              { $match: { type: USER_TYPE.viewingAgent } }, // Filter for viewing assistants
              // {
              //   $lookup: {
              //     from: "categories",
              //     localField: "categories",
              //     foreignField: "_id",
              //     as: "categoryDetails",
              //   },
              // },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  rate: 1,
                  projectImages: 1,
                  // categories: "$categoryDetails.name",
                },
              },
            ],
          },
        },
      ]);

      return _RS.ok(
        res,
        "SUCCESS",
        "Data found successfully",
        result,
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
      const userId = new mongoose.Types.ObjectId(id);
      const searchResults = await userModels.aggregate([
        {
          $match: { _id: userId },
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
            title:1,
            actualRate:1,
            myServices: 1,
            profileImage: 1,
            rate: 1,
            projectImages: 1,
            images: 1,
            categories: "$categoryDetails.name", // Include category names from the categoryDetails array
          },
        },
        { $sort: { rate: 1 } },
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
}

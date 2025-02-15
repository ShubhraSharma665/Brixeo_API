const express = require("express");

import mongoose from "mongoose";
import { USER_TYPE } from "../../constants";
import _RS from "../../helpers/ResponseHelper";
import userModels from "../../models/user.models";
import categoryModel from "../../models/category.model";

const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
export class SearchController {
  static async getSearchResults(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const { categoryIds, location, rateSort, min, max, search, verified } =
        req.body;
      const { page, limit = 2 } = req.query;
      const isVerified = verified === "yes" ? true : false;
      const objectIdCategoryIds =
        categoryIds?.length > 0
          ? categoryIds.map((id) => new mongoose.Types.ObjectId(id))
          : [];

      const matchStage: any = {
        $and: [
          { type: { $ne: USER_TYPE.admin } }, // Exclude 'admin'
          {
            $or: [
              { type: USER_TYPE.viewingAgent },
              { type: USER_TYPE.contractor },
            ],
          },
          { isShow: true },
          
        ],
      };

      if (categoryIds?.length > 0) {
        matchStage.categories = { $in: objectIdCategoryIds };
      }
      if (location) {
        matchStage.$and.push({
          $or: [
            { state: { $regex: new RegExp(location, "i") } },
            { cities: { $elemMatch: { $regex: new RegExp(location, "i") } } },
          ],
        });
      }
      if (min && max) {
        matchStage.$and.push(
          { rate: { $gte: Number(min) } },
          { rate: { $lte: Number(max) } }
        );
      }
      if (verified !== undefined) {
        matchStage.$and.push({ isBrixeoVerified: isVerified });
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
            type: 1,
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
              { categories: { $regex: new RegExp(search, "i") } }, // Match in category names
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
      pipeline.push({
        $facet: {
          totalRecords: [{ $count: "count" }], // Get total count
          results: [
            { $skip: (Number(page) - 1) * Number(limit) }, // Skip previous pages
            { $limit: Number(limit) }, // Limit results per page
          ],
        },
      });

      const searchResults = await userModels.aggregate(pipeline);

      const results = searchResults[0]?.results || [];
      const totalRecords = searchResults[0]?.totalRecords?.[0]?.count || 0;

      return _RS.ok(
        res,
        "SUCCESS",
        "Data found successfully",
        {
          data: results,
          totalRecords: totalRecords,
          page,
          totalPages: Math.ceil(totalRecords / limit),
        },
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async searchLandingResults(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const parentCategoryNames = [
        "Property Management Services",
        "Real Estate Agent and Brokerage Services",
      ];

      const categories = await categoryModel.aggregate([
        { $match: { name: { $in: parentCategoryNames } } },
        {
          $lookup: {
            from: "categories",
            let: { parentId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$parentId", "$$parentId"] } } },
            ],
            as: "childCategories",
          },
        },
      ]);

      const propertyManagementChildIds = [];
      const realEstateAgentChildIds = [];

      categories.forEach((category) => {
        if (category.name === "Property Management Services") {
          propertyManagementChildIds.push(
            ...category.childCategories.map(
              (c) => new mongoose.Types.ObjectId(c._id)
            )
          );
        }
        if (category.name === "Real Estate Agent and Brokerage Services") {
          realEstateAgentChildIds.push(
            ...category.childCategories.map(
              (c) => new mongoose.Types.ObjectId(c._id)
            )
          );
        }
      });

      const result = await userModels.aggregate([
        {
          $facet: {
            contractors: [
              { $match: { type: USER_TYPE.contractor, isShow: true } },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  rate: 1,
                  projectImages: 1,
                  isBrixeoVerified: 1,
                },
              },
            ],
            viewingAgents: [
              { $match: { type: USER_TYPE.viewingAgent, isShow: true } },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  rate: 1,
                  projectImages: 1,
                  isBrixeoVerified: 1,
                },
              },
            ],
            propertyManagementProfiles: [
              {
                $match: {
                  categories: { $in: propertyManagementChildIds },
                  isShow: true,
                },
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  rate: 1,
                  projectImages: 1,
                  isBrixeoVerified: 1,
                },
              },
            ],
            realEstateAgentProfiles: [
              {
                $match: {
                  categories: { $in: realEstateAgentChildIds },
                  isShow: true,
                },
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  rate: 1,
                  projectImages: 1,
                  isBrixeoVerified: 1,
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
            // primaryAddress: 1,
            // secondaryAddress: 1,
            cities: 1,
            state: 1,
            aboutMe: 1,
            title: 1,
            actualRate: 1,
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

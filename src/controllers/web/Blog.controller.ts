const express = require("express");

import _RS from "../../helpers/ResponseHelper";
import blogsModel from "../../models/blogs.model";

const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
export class BlogController {
  static async getBlogsList(req, res, next) {
    const startTime = new Date().getTime();
    let { page, limit, search } = req.query;

    try {
      const matchStage: { $or?: any[] } = {};
      const orConditions: any[] = [];

      if (search) {
        orConditions.push({ blogTitle: { $regex: search, $options: "i" } });
      }

      // Calculate offset for pagination
      let offset = (Number(page) - 1) * Number(limit) || 0;

      // Add $or conditions to the match stage if there are any
      if (orConditions.length > 0) {
        matchStage.$or = orConditions;
      }

      // Aggregation pipeline
      const list = await blogsModel
        .aggregate([
          {
            $match: matchStage, // Filtering blogs
          },
        ])
        .skip(offset)
        .limit(parseInt(limit || "3"));

      const totalCount = await blogsModel.countDocuments(matchStage);

      return _RS.ok(
        res,
        "SUCCESS",
        "Blogs found successfully",
        { list, totalCount: totalCount, page: page },
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async getBlogsById(req, res, next) {
    const startTime = new Date().getTime();
    const { _id } = req.params;
    try {
      let blogs = await blogsModel.findOne({ _id: _id });
      return _RS.ok(
        res,
        "SUCCESS",
        "Blog section found successfully",
        blogs,
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
  static async getLatestBlogs(req, res, next) {
    const startTime = new Date().getTime();

    try {
      const latestRecords = await blogsModel
        .find()
        .sort({ createdAt: -1 })
        .limit(4);
      return _RS.ok(
        res,
        "SUCCESS",
        "Latest Blog section found successfully",
        latestRecords,
        startTime
      );
    } catch (error) {
      next(error);
    }
  }
}

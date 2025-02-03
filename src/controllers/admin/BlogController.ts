const express = require("express");
import _RS from "../../helpers/ResponseHelper";
import blogsModel from "../../models/blogs.model";
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
export class BlogController {
  static async AddBlogs(req, res, next) {
    const startTime = new Date().getTime();
    const { authorName, blogTitle, blogContent, tagsList, description } = req.body;
    const { id } = req.user;
    try {
      const data = {
        userId: id,
        authorName,
        blogTitle,
        blogContent,
        tagsList:JSON.parse(tagsList),
        image: req?.files?.image[0].originalname,
        description:description
      }
      let addBlogs = await blogsModel.create(data);
      return _RS.ok(res, "SUCCESS", "Blogs added successfully", {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async UpdateBlogs(req, res, next) {
    const startTime = new Date().getTime();
    const { authorName, blogTitle, blogContent, tagsList, _id, description } = req.body;
    try {
      let isBlogExist = await blogsModel.findOne({
        _id: _id,
      });

      if (!isBlogExist) {
        return _RS.notFound(
          res,
          "NOTFOUND",
          "Blog section not found!!",
          {},
          startTime
        );
      }
      console.log("handle check image",typeof req?.body?.image === "string", req?.body?.image)
      isBlogExist.image =
        typeof req?.body?.image === "string"
          ? req?.body?.image
          : req?.files?.image[0].originalname;
      (isBlogExist.authorName = authorName
        ? authorName
        : isBlogExist.authorName),
        (isBlogExist.blogContent = blogContent
          ? blogContent
          : isBlogExist.blogContent),
        (isBlogExist.tagsList = JSON.parse(tagsList) ? JSON.parse(tagsList) : isBlogExist.tagsList),
        (isBlogExist.blogTitle = blogTitle ? blogTitle : isBlogExist.blogTitle);
        (isBlogExist.description = description ? description : isBlogExist.description);
      await isBlogExist.save();
      return _RS.ok(
        res,
        "SUCCESS",
        "Blogs successfully updated",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
  static async getBlogs(req, res, next) {
    const startTime = new Date().getTime();
    let { page, limit, search } = req.query;
  
    try {
      const matchStage: { $or?: any[] } = {}; // For filtering blogs
      const orConditions: any[] = []; // For search filters
  
      // Add search filters if a search query is provided
      if (search) {
        orConditions.push(
          { blogTitle: { $regex: search, $options: "i" } }, // Search by blog title
          // { description: { $regex: search, $options: "i" } } // Search by description
        );
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
        .limit(parseInt(limit));

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

  static async DeleteBlogs(req, res, next) {
    const startTime = new Date().getTime();
    const { _id } = req.body;
    try {
      let isBlogExist = await blogsModel.findOne({ _id: _id });
      if (isBlogExist) {
        let removeCategory = await blogsModel.deleteOne({ _id: _id });
      }
      return _RS.ok(
        res,
        "SUCCESS",
        "Blog section removed successfully",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }

  static async _ChangeStatusOfBlogs(req, res, next) {
    const startTime = new Date().getTime();
    const { id } = req.body;
    try {
      let isBlogExist = await blogsModel.findOne({ _id: id });
      isBlogExist.isActive = !isBlogExist.isActive;
      await isBlogExist.save();
      return _RS.ok(
        res,
        "SUCCESS",
        "Status changed successfully",
        {},
        startTime
      );
    } catch (err) {
      next(err);
    }
  }
}

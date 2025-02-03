import { Router } from "express";
import Authentication from "../../middlewares/Authentication";
import { BlogController } from "../../controllers/web/Blog.controller";
import { upload } from "../../middlewares/MulterMiddleware";

class BlogRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.delete();
    this.post();
    this.get();
  }

  public delete() {}

  public post() {}

  public get() {
    this.router.get("/get", Authentication.admin, BlogController.getBlogsList);
    this.router.get("/get/latest", Authentication.admin, BlogController.getLatestBlogs);
    this.router.get(
      '/get-by-id/:_id',
      Authentication.admin,
      BlogController.getBlogsById
    );
  }
}

export default new BlogRoutes().router;

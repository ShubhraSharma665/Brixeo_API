import { Router } from 'express';
import Authentication from '../../middlewares/Authentication';
import { BlogController } from '../../controllers/admin/BlogController';
import { upload } from '../../middlewares/MulterMiddleware';

class BlogRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.delete();
        this.post();
        this.get();
    }

    public delete() {
        // this.router.delete(
        //   "/delete/entire", Authentication.admin, AuthController.cleanupData
        // )
    }

    public post() {
        this.router.post(
            "/add",
            Authentication.admin,
            upload.fields([
              { name: "image", maxCount: 1 },
            ]),
            BlogController.AddBlogs
          );
          this.router.post(
            "/update",
            Authentication.admin,
            upload.fields([
              { name: "image", maxCount: 1 },
            ]),
            BlogController.UpdateBlogs
          );
          this.router.post(
            "/change-status",
            Authentication.admin,
            BlogController._ChangeStatusOfBlogs
          );
          this.router.post(
            "/remove",
            Authentication.admin,
            BlogController.DeleteBlogs
          );
    }

    public get() {
        this.router.get(
        	'/get',
        	Authentication.admin,
        	BlogController.getBlogs
        );
        this.router.get(
        	'/get-by-id/:_id',
        	Authentication.admin,
        	BlogController.getBlogsById
        );
    }
}

export default new BlogRouter().router;

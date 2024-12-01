import { Router } from "express";
import Authentication from "../../middlewares/Authentication";
import { UserController } from "../../controllers/admin/UserController";
import { upload } from "../../middlewares/MulterMiddleware";

class UserRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.delete();
    this.post();
    this.get();
  }

  public delete() {}

  public post() {
    this.router.post(
      "/update-profile",
      Authentication.admin,
      upload.fields([
        { name: "projectImages", maxCount: 5 },
        { name: "profileImage", maxCount: 1 },
        { name: "document", maxCount: 1 },
      ]),
      UserController.updateProfile
    );
    this.router.post(
      "/get-user",
      Authentication.admin,
      UserController.getProfile
    );
    this.router.post(
      "/active/toggle",
      Authentication.admin,
      UserController.activeUnactive
    );
  }

  public get() {
    this.router.get("/get", Authentication.admin, UserController.GetUsersList);
    // this.router.get(
    // 	'/get',
    // 	Authentication.admin,
    // 	UserController.getProfile
    // );
  }
}

export default new UserRouter().router;

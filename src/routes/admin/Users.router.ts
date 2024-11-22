import { Router } from "express";
import Authentication from "../../middlewares/Authentication";
import { UserController } from "../../controllers/admin/UserController";

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
    this.router.get(
      "/update-profile",
      Authentication.admin,
      UserController.updateProfile
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

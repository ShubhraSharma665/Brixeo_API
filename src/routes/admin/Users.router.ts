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
        { name: "licenseImage", maxCount: 1 },
      ]),
      UserController.updateProfile
    );
    this.router.post(
      "/update-bussiness-profile",
      Authentication.admin,
      upload.fields([
        { name: "COGS", maxCount: 1 },
        { name: "AOI", maxCount: 1 },
        { name: "OA", maxCount: 1 },
        { name: "stateIDFront", maxCount: 1 },
        { name: "stateIDBack", maxCount: 1 },
        { name: "COI", maxCount: 1 },
      ]),
      UserController.updateBussinessProfile
    );
    this.router.post(
      "/get-user",
      Authentication.admin,
      UserController.getProfile
    );
    this.router.post(
      "/add-sub-user",
      Authentication.admin,
      UserController.addSubUser
    );
    this.router.post(
      "/active/toggle",
      Authentication.admin,
      UserController.activeUnactive
    );
    this.router.post('/change-password',
      Authentication.admin,  UserController.changePassword);
  }

  public get() {
    this.router.get("/get", Authentication.admin, UserController.GetUsersList);
    this.router.get("/get/by-id/:id", Authentication.admin, UserController.getUserProfileById);
    this.router.get("/bussiness/get/:id", Authentication.admin, UserController.getBussinessProfile);
  }
}

export default new UserRouter().router;

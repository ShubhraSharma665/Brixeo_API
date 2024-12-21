import { Router } from "express";
import CommanRoutes from "./comman.routes";
import AuthRouter from "./admin/Auth.router";
import authRoutes from "./web/Auth.routes";
import CategoryRouter from "./admin/Category.router";
import UsersRouter from "./admin/Users.router";
import CategoryRoutes from "./web/Category.routes";
import searchRoutes from "./web/search.routes";

class Routes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.app();
    this.admin();
    this.common();
  }

  app() {
    this.router.use("/auth", authRoutes);
    this.router.use("/web/category", CategoryRoutes);
    this.router.use("/web/service", searchRoutes);
  }

  admin() {
    this.router.use("/admin/auth", AuthRouter);
    this.router.use("/admin/category", CategoryRouter);
    this.router.use("/admin/users", UsersRouter);
  }

  common() {
    this.router.use("/comman", CommanRoutes);
  }
}
export default new Routes().router;

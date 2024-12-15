import { Router } from 'express';
import { AuthController } from '../../controllers/admin/AuthController';
import Authentication from '../../middlewares/Authentication';

class AuthRouter {
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
		this.router.post('/login', AuthController.login);
	}

	public get() {
		// this.router.get(
		// 	'/get-profile',
		// 	Authentication.admin,
		// 	AuthController.getProfile
		// );
	}
}

export default new AuthRouter().router;

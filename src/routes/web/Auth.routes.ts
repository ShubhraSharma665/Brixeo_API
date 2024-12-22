import { Router } from 'express';
import { AuthController } from '../../controllers/web/Auth.controller';
import AuthValidation from '../../validators/auth.validator';

class AuthRouter {
	public router: Router;

	constructor() {
		this.router = Router();
		this.delete();
		this.post();
		this.get();
	}

	public delete() {
		 
	}

	public post() {
		this.router.post('/sign-up',AuthValidation.signUpValidation, AuthController.signUp);
	}

	public get() {
	}
}

export default new AuthRouter().router;

import { Router } from 'express';
import { CommanController } from '../controllers/comman.controller';
import Authentication from '../middlewares/Authentication';

class CommonRoutes {
	public router: Router;

	constructor() {
		this.router = Router();
		this.post();
		this.get();
	}

	public post() {
		
	}

	public get() {
		this.router.get('/profile', Authentication.admin, CommanController.profile);
	}
}

export default new CommonRoutes().router;

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
		this.router.post('/profile', CommanController.profile);
		this.router.post('/forgot-password', CommanController.forgotPassword);
		this.router.post('/newsletter/add-email', CommanController.newsLetterAdd);
		this.router.post('/newsletter/update', CommanController.newsLetterUpdate);
		this.router.post('/newsletter/change-status', CommanController.newsLetterStatusChange);	
		this.router.post('/notification/fcm/save', CommanController.saveFCMToken);		
	}

	public get() {
		this.router.get('/profile', Authentication.admin, CommanController.profile);
		this.router.get('/newsletter/get', CommanController.newsLetterGet);

	}
}

export default new CommonRoutes().router;

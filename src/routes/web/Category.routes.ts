import { Router } from 'express';
import Authentication from '../../middlewares/Authentication';
import { WebCategoryController } from '../../controllers/web/Category.controller';

class CategoryRoutes {
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

	}

	public get() {
		this.router.get(
			'/get',
			// Authentication.admin,
			WebCategoryController.getNestedCategory
		);
	}
}

export default new CategoryRoutes().router;

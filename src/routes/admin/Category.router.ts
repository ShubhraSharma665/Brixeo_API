import { Router } from 'express';
import Authentication from '../../middlewares/Authentication';
import { CategoryController } from '../../controllers/admin/CategoryController';

class CategoryRouter {
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
		this.router.post('/add',Authentication.admin, CategoryController.AddCategory);
        this.router.post('/update',Authentication.admin, CategoryController.UpdateCategory);
        this.router.post('/delete',Authentication.admin, CategoryController.DeleteCategory);

	}

	public get() {
		this.router.get(
			'/get',
			Authentication.admin,
			CategoryController.GetCategory
		);
		this.router.get(
			'/get/childs',
			Authentication.admin,
			CategoryController.getChildCategories
		);
		this.router.get(
			'/get/parents',
			Authentication.admin,
			CategoryController.getParentCategories
		);
	}
}

export default new CategoryRouter().router;

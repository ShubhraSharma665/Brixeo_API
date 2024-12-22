import { Router } from 'express';
import { AuthController } from '../../controllers/web/Auth.controller';
import AuthValidation from '../../validators/auth.validator';
import { SearchController } from '../../controllers/web/search.controller';

class SearchRoutes {
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
		this.router.post('/search', SearchController.getSearchResults);
	}

	public get() {
		this.router.get('/get-profile/:id', SearchController.getProfileOfUser);
		this.router.get('/search/landing', SearchController.searchLandingResults);

	}
}

export default new SearchRoutes().router;

import _RS from '../helpers/ResponseHelper';
import Auth from '../utils/Auth';
import User from '../models/user.models';
// import { getLanguageStrings } from '../locale';
import { USER_TYPE } from '../constants/user-type.enum';
import { decode } from 'punycode';

class Authentication {
	constructor() {}

	// static async userLanguage(req, res, next) {
	// 	const language = req.user.language ?? 'en';
	// 	const lang = getLanguageStrings(language);
	// 	req.lang = lang;
	// 	next();
	// }

	static async user(req, res, next) {
		const startTime = new Date().getTime();
		try {
			let token;

			if (
				req.headers.authorization &&
				req.headers.authorization.startsWith('Bearer')
			) {
				token = req.headers.authorization.split(' ')[1];
			}

			if (!token) {
				return _RS.api(res, false, 'Un-Authorized User', {}, startTime);
			}
			const decoded: any = await Auth.decodeJwt(token);
			const currentUser = await User.findOne({
				_id: decoded.id,
				type: USER_TYPE.propertyOwner,
			});

			if (!currentUser) {
				return _RS.api(
					res,
					false,
					"User doesn't exists with us",
					currentUser,
					startTime
				);
			}

			if (!currentUser.is_active) {
				return _RS.api(
					res,
					false,
					'Account deactivated, Please contact to admin',
					{},
					startTime
				);
			}

			if (currentUser.is_delete) {
				return _RS.api(
					res,
					false,
					'This Account has been deleted',
					{},
					startTime
				);
			}

			req.user = currentUser;
			req.user.id = decoded.id;
			req.user.type = decoded.type;
			next();
		} catch (err) {
			return next(err);
		}
	}
	// static async socketAuth(token) {
	// 	const startTime = new Date().getTime();
	// 	try {
	// 		const decoded: any = await Auth.decodeJwt(token);
	// 		const currentUser = await User.findOne({
	// 			_id: decoded._id,
	// 			type: USER_TYPE.propertyOwner,
	// 		});
	// 		if (!currentUser) {
	// 			return false
	// 		}

			
	// 		return decoded._id
	// 	} catch (err) {
	// 		// return next(err);
	// 	}
	// }

	static async admin(req, res, next) {
		const startTime = new Date().getTime();
		try {
			let token;

			if (
				req.headers.authorization &&
				req.headers.authorization.startsWith('Bearer')
			) {
				token = req.headers.authorization.split(' ')[1];
			}

			if (!token) {
				return _RS.unAuthenticated(
					res,
					'UNAUTHORIZED',
					'Un-Authorized',
					{},
					startTime,
					0
				);
			}
			const decoded: any = await Auth.decodeJwt(token);
			const currentUser = await User.findById(decoded.id).find({
				type: { $in: [USER_TYPE.admin] },
			});

			if (!currentUser) {
				return _RS.notFound(
					res,
					'NOTFOUND',
					"Admin doesn't exists with us",
					currentUser,
					startTime
				);
			}
			req.user = currentUser;
			req.user.id = decoded.id;
			req.user.type = decoded.type;
			next();
		} catch (err) {
			return next(err);
		}
	}
	static async propertyOwner(req, res, next) {
		const startTime = new Date().getTime();
		try {
			let token;

			if (
				req.headers.authorization &&
				req.headers.authorization.startsWith('Bearer')
			) {
				token = req.headers.authorization.split(' ')[1];
			}

			if (!token) {
				return _RS.unAuthenticated(
					res,
					'UNAUTHORIZED',
					'Un-Authorized',
					{},
					startTime,
					0
				);
			}

			const decoded: any = await Auth.decodeJwt(token);

			const currentUser = await User.findById(decoded.id).find({
				type: { $in: [USER_TYPE.propertyOwner] },
			});

			if (!currentUser) {
				return _RS.notFound(
					res,
					'NOTFOUND',
					"Admin doesn't exists with us",
					currentUser,
					startTime
				);
			}

			req.user = currentUser;
			req.user.id = decoded.id;
			req.user.type = decoded.type;
			next();
		} catch (err) {
			return next(err);
		}
	}

static async contractor(req, res, next) {
	const startTime = new Date().getTime();
	try {
		let token;

		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			token = req.headers.authorization.split(' ')[1];
		}

		if (!token) {
			return _RS.unAuthenticated(
				res,
				'UNAUTHORIZED',
				'Un-Authorized',
				{},
				startTime,
				0
			);
		}

		const decoded: any = await Auth.decodeJwt(token);

		const currentUser = await User.findById(decoded.id).find({
			type: { $in: [USER_TYPE.contractor] },
		});

		if (!currentUser) {
			return _RS.notFound(
				res,
				'NOTFOUND',
				"Admin doesn't exists with us",
				currentUser,
				startTime
			);
		}

		req.user = currentUser;
		req.user.id = decoded.id;
		req.user.type = decoded.type;
		next();
	} catch (err) {
		return next(err);
	}
}
}

export default Authentication;

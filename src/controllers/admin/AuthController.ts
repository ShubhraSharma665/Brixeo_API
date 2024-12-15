const express = require('express');

import Auth from '../../utils/Auth';
import { USER_TYPE } from '../../constants/user-type.enum';
import _RS from '../../helpers/ResponseHelper';
import User from '../../models/user.models';

const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
export class AuthController {
	static async login(req, res, next) {
		const startTime = new Date().getTime();
		const { email, password } = req.body;
		try {
			let isUserExist = await User.findOne({
				emailId: email,
				type: { $in: [USER_TYPE.admin,USER_TYPE.contractor,USER_TYPE.propertyOwner,USER_TYPE.viewingAssistant,USER_TYPE.subAdmin] },
			})

			if (!isUserExist) {
				return _RS.notFound(
					res,
					'NOTFOUND',
					"Email address doesn't exists with us",
					{},
					startTime
				);
			}
			if(!isUserExist.isActive){
				return _RS.badRequest(
					res,
					'',
					"This account is deactivated. Please contact to admin!!",
					{},
					startTime
				);
			}
			const isPasswordValid = await Auth.comparePassword(
				password,
				isUserExist.password
			);

			if (!isPasswordValid) {
				return _RS.badRequest(
					res,
					'BAD REQUEST',
					'Invalid password',
					{},
					startTime
				);
			}

			const payload = {
				id: isUserExist._id,
				emailId: isUserExist.emailId,
				type: isUserExist.type,
			};

			const token = await Auth.getToken(payload, '1d', next);
			return _RS.ok(
				res,
				'SUCCESS',
				'Welcome! Login Successfully',
				{ token },
				startTime
			);
		} catch (err) {
			next(err);
		}
	}



}

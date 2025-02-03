const express = require('express');

import Auth from '../../utils/Auth';
import { USER_TYPE } from '../../constants/user-type.enum';
import _RS from '../../helpers/ResponseHelper';
import User from '../../models/user.models';
import { permission } from 'process';

const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
export class AuthController {
	static async signUp(req, res, next) {
		console.log('user stay here', req.body);
		const startTime = new Date().getTime();
		const { firstName,lastName,emailId, password, type } = req.body;
		try {
			const getUser = await User.findOne({
				emailId:emailId.toLowerCase()
			});
            const isUserValid = Object.values(USER_TYPE).includes(type)
            if(!isUserValid){
				return _RS.badRequest(res, "", 'Type is invalid', {}, startTime);
            }
			if (getUser) {
				return _RS.badRequest(res, "", 'Email already exist!!', {}, startTime);
			} else {
				const userpassword = await Auth.encryptPassword(password);
				const payload:any = {
					type: type,
					password: userpassword,
					firstName:firstName,
					emailId:emailId.toLowerCase(),
                    lastName:lastName,
				};
				if(type === USER_TYPE.propertyOwner){
					payload.permissions = [
						{ key: "Dashboard", view: false, add: false, edit: false },
						{ key: "Profile", view: false, add: false, edit: false },
						{ key: "Users", view: false, add: false, edit: false },
						{ key: "Category", view: false, add: false, edit: false },
						{ key: "Newsletters", view: false, add: false, edit: false },
						{ key: "Chats", view: false, add: false, edit: false },
						{ key: "Blogs", view: false, add: false, edit: false },
						{ key: "SubUsers", view: false, add: false, edit: false },
						{ key: "Change Password", view: false, add: false, edit: false },
					  ]
				}if(type === USER_TYPE.contractor){
					payload.permissions = [
						{ key: "Dashboard", view: true, add: true, edit: true },
						{ key: "Profile", view: true, add: true, edit: true },
						{ key: "Users", view: true, add: true, edit: true },
						{ key: "Category", view: false, add: false, edit: false },
						{ key: "Newsletters", view: false, add: false, edit: false },
						{ key: "Blogs", view: false, add: false, edit: false },
						{ key: "Chats", view: true, add: true, edit: true },
						{ key: "SubUsers", view: true, add: true, edit: true },
						{ key: "Change Password", view: true, add: true, edit: true },
					  ]
				}
				if(type === USER_TYPE.viewingAgent){
					payload.permissions = [
						{ key: "Dashboard", view: true, add: true, edit: true },
						{ key: "Profile", view: true, add: true, edit: true },
						{ key: "Users", view: true, add: true, edit: true },
						{ key: "Category", view: false, add: false, edit: false },
						{ key: "Newsletters", view: false, add: false, edit: false },
						{ key: "Blogs", view: false, add: false, edit: false },
						{ key: "SubUsers", view: true, add: true, edit: true },
						{ key: "Chats", view: true, add: true, edit: true },
						{ key: "Change Password", view: true, add: true, edit: true },
					  ]
				}
				
				
				let user = await User.create(payload);
				
				return _RS.api(
					res,
					true,
					'User successfully register',
                    {},
					startTime
				);
			}
		} catch (error) {
			next(error);
		}
	}

}

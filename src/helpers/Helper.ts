import firebaseAdmin from '../config/firebase';
import _RS from '../helpers/ResponseHelper';
// import Notification from "../models/Notification";
import User from '../models/User';
import { USER_TYPE } from '../constants/user-type.enum';
// import NotificationUser from "../models/NotificationUser";

const twilio = require('twilio');

class Helper {
	public admin;

	constructor() {
		this.initializeAdmin();
	}

	async initializeAdmin() {
		this.admin = await User.findOne({ type: USER_TYPE.admin });
	}

	public generateAlphaString(length: any) {
		var result = [];
		var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		var charactersLength = characters.length;

		for (var i = 0; i < length; i++) {
			var randomIndex = Math.floor(Math.random() * charactersLength);
			result.push(characters[randomIndex]);
		}

		return result.join('');
	}

	async generatePassword(length, options) {
		const optionsChars = {
			digits: '1234567890',
			lowercase: 'abcdefghijklmnopqrstuvwxyz',
			uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			symbols: '@$!%&',
		};
		const chars = [];
		for (let key in options) {
			if (
				options.hasOwnProperty(key) &&
				options[key] &&
				optionsChars.hasOwnProperty(key)
			) {
				chars.push(optionsChars[key]);
			}
		}

		if (!chars.length) return '';

		let password = '';

		for (let j = 0; j < chars.length; j++) {
			password += chars[j].charAt(Math.floor(Math.random() * chars[j].length));
		}
		if (length > chars.length) {
			length = length - chars.length;
			for (let i = 0; i < length; i++) {
				const index = Math.floor(Math.random() * chars.length);
				password += chars[index].charAt(
					Math.floor(Math.random() * chars[index].length)
				);
			}
		}

		return password;
	}

	async generateRandomString(length, options) {
		const optionsChars = {
			digits: '1234567890',
			lowercase: 'abcdefghijklmnopqrstuvwxyz',
			uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		};
		const chars = [];
		for (let key in options) {
			if (
				options.hasOwnProperty(key) &&
				options[key] &&
				optionsChars.hasOwnProperty(key)
			) {
				chars.push(optionsChars[key]);
			}
		}

		if (!chars.length) return '';

		let randomString = '';

		for (let j = 0; j < chars.length; j++) {
			randomString += chars[j].charAt(
				Math.floor(Math.random() * chars[j].length)
			);
		}
		if (length > chars.length) {
			length = length - chars.length;
			for (let i = 0; i < length; i++) {
				const index = Math.floor(Math.random() * chars.length);
				randomString += chars[index].charAt(
					Math.floor(Math.random() * chars[index].length)
				);
			}
		}

		return randomString;
	}

	async sendSMS(to: any, body: any) {
		const accountSid = process.env.TWILIO_ACCOUNT_SID;
		const authToken = process.env.TWILIO_AUTH_TOKEN;
		const twilioNumber = process.env.TWILIO_NUMBER
			? process.env.TWILIO_NUMBER
			: '+18557611599';

		const client = new twilio(accountSid, authToken);

		try {
			const message = await client.messages.create({
				body: body,
				to: '+' + to,
				from: twilioNumber,
			});
			console.log('SMS has been sent successfully', message);
			return true;
		} catch (error) {
			console.error('Somthing went wrong, Error is', error);
			return false;
		}
	}

	async sendMultiCastNotification(
		from: any,
		to_id: any,
		title: any,
		description: any,
		notification_for: any,
		message: string,
		users: any
	) {
		try {
			// Get To User ID Token.
			const receiverToken = (await User.find({ _id: { $in: to_id } }))
				.filter((item: any) => item?.device_token)
				.map((item) => item.device_token);

			// await Notification.create({
			//   notification_for: notification_for,
			//   title: title,
			//   message,
			//   description,
			//   users,
			//   send_by: from,
			// });

			/* if (receiverToken && receiverToken.length) {

                const message = {
                    notification: {
                        title   : title,
                        body    : description,
                      },
                      token: receiverToken,
                    };
                    
                firebaseAdmin.messaging().sendMulticast(message).then((response) => {
                    console.log("Notification sent successfully : ", response);
                  });
                } */
		} catch (error) {
			return error;
		}
	}

	public async getFileExtension(url: any) {
		// Get the last part of the URL after the last '/'
		const filename = url.substring(url.lastIndexOf('/') + 1);

		// Get the file extension by getting the last part of the filename after the last '.'
		const extension = filename.substring(filename.lastIndexOf('.') + 1);

		return extension;
	}

	async sendNotification(
		from_id: any,
		to_id: any,
		title: any,
		description: any,
		data?: any
	) {
		try {
			// Get To User ID Token.
			const receiver = await User.findById(to_id);

			console.log(
				receiver,
				'----------------------------------------------------notification receiver'
			);

			// const t = await new NotificationUser({
			//   from_id: from_id,
			//   to_id: to_id,
			//   title: title,
			//   description: description,
			//   is_read: false,
			//   data: !!data ? data : null
			// }).save();

			if (receiver && receiver.device_token) {
				const message = {
					notification: {
						title: title,
						body: description,
					},
					token: receiver.device_token,
				};

				firebaseAdmin
					.messaging()
					.send(message)
					.then((response) => {
						console.log('Notification sent successfully : ', response);
					})
					.catch((error) => {
						return error;
					});
			}

			console.log('notifi sent successfully -----------------------');
			return true;
		} catch (error) {
			console.log('Error while sending notification : ', error);
			return error;
		}
	}

	async sendNotificationToAdmin(
		from_id: any,
		to_id: any,
		title: any,
		description: any
	) {
		try {
			// Get To User ID Token.
			const receiver = await User.findOne({ type: USER_TYPE.admin });

			// If user notification toggle is true then only send notification to receiver user.
			if (!!receiver && !!receiver?._id) {
				// await new NotificationUser({
				//   from_id: from_id,
				//   to_id: receiver._id,
				//   title: title,
				//   description: description,
				//   is_read: false,
				// }).save();

				if (receiver && receiver.device_token) {
					const message = {
						notification: {
							title: title,
							body: description,
						},
						token: receiver.device_token,
					};

					firebaseAdmin
						.messaging()
						.send(message)
						.then((response) => {
							console.log('Notification sent successfully : ', response);
						})
						.catch((err) => console.log(err, 'Firebase ERROR'));
				}
			}
		} catch (error) {
			console.log('Error while sending notification : ', error);
			// return error;
		}
	}

	async sendMultipleNotification(
		notifications: {
			to_id: string;
			from_id: string;
			title: string;
			description: string;
			is_read: string;
		}[]
	) {
		try {
			const startTime = new Date().getTime();

			await notifications.forEach(async (notification) => {
				const receiver = await User.findById(notification.to_id);
				if (receiver && receiver.device_token) {
					const message = {
						notification: {
							title: notification.title,
							body: notification?.description,
						},
						token: receiver.device_token,
					};

					firebaseAdmin
						.messaging()
						.send(message)
						.then((response) => {
							console.log('Notification sent successfully : ', response);
						})
						.catch((error) => {
							return error;
						});
				}
			});

			// await NotificationUser.insertMany(notifications);
		} catch (error) {
			console.log(error);
		}
	}
}

export default new Helper();

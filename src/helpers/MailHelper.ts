import AdminSetting from '../models/AdminSetting';
import User from '../models/User';
const nodemailer = require('nodemailer');

export class MailHelper {
	constructor() {}

	static async emailHtml(description: any) {
		const adminSettings = await AdminSetting.findOne();
		const email = adminSettings.email;
		const phone =
			'+ ' + adminSettings?.country_code + ' ' + adminSettings?.mobile_number;

		const html = `<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, shrink-to-fit=no" />
            <title>Game</title>
            <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">
        </head>
        <body style="font-family: 'Lato', 'Merriweather', 'Roboto', sans-serif;">
            <div class="mainEmailWraper" style="max-width: 680px; margin: 0 auto;">
                <div class="emailHeader" style=" padding: 16px; background-color: #0089B6; border-radius: 8px 8px 0 0;">
                    <div class="logoOuter" style="width:120px; margin:0 auto;">
                        <img src=${
													process.env.BASE_URL + `img/Logo.png`
												} alt="" style="filter:brightness(1000);width:100%;" />
                    </div>
                </div>
        
                <div class="emailTempBody" style="margin-top: 16px;">
                    <div style="padding: 16px; background-color: #eaeeef; gap: 16px;">
                        ${description}
                    </div>
                </div>
        
                <div class="emailFooter" style="padding: 16px; background-color: #0089B6; border-radius: 0 0 8px 8px; text-align: center;">
                    <div class="title" style="font-size: 16px; color: #fff; font-weight: 500;">Please Email us or Call us if you have any queries.</div>
                    <div class="contactDetail" style="display: inline-block; margin-top: 8px;">
                        <span class="email" style="display: inline-block; align-items: center; gap: 4px;">
                            <span class="icon" style="width: 24px; height: 24px; flex:0 0 auto;display: inline-block;">
                                <img style="width: 100%; margin-bottom:-7px;" src=${
																	process.env.BASE_URL +
																	`img/icon/emailIcon.png`
																} alt="">
                            </span>
                            <a href="mailto:${email}"  style="text-decoration: none; color: #fff; font-size: 16px;">${email}</a>
                        </div>
                        <span class="phone" style="display: inline-block; align-items: center; gap: 4px;">
                            <span class="icon" style="width: 24px; height: 24px; flex:0 0 auto;display: inline-block;">
                                <img style="width: 100%; margin-bottom:-7px;" src=${
																	process.env.BASE_URL + `img/icon/callIcon.png`
																} alt="">
                            </span>
                            <a href="tel:${phone} style="text-decoration: none; color: #fff; font-size: 16px;">${phone}</a>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    </html>`;
		return html;
	}

	static async sendMail(receiver_mail: any, subject: any, html: any) {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.MAIL_USERNAME,
				pass: process.env.MAIL_PASSWORD,
			},
		});

		let mailOptions = {
			from: 'Game <process.env.MAIL_USERNAME>',
			to: receiver_mail,
			subject: subject,
			html: await MailHelper.emailHtml(html),
		};

		// Send the email
		transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.error('Error while sending an email : ', error);
				return false;
			} else {
				console.log('An email has been sent successfully : ', info.response);
				return true;
			}
		});
	}
}

export default MailHelper;

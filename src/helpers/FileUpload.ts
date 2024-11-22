import { S3 } from 'aws-sdk';
import { env } from '../environments/Env';
import * as path from 'path';
import * as os from 'os';
import AWS = require('aws-sdk');
import * as fs from 'fs';
import Helper from './Helper';

AWS.config.update({
	accessKeyId: env().awsAccessKey,
	secretAccessKey: env().awsSecretKey,
	region: env().region,
});

export class FileUpload {
	constructor() {}

	static s3 = new AWS.S3();

	static uploadInS3(image, path) {
		let folderPath = path;
		let fileExtension = '.png';
		const imageRemoteName = `${folderPath}/image_${new Date().getTime()}${fileExtension}`;
		return FileUpload.s3
			.putObject({
				Bucket: env().s3Bucket,
				Body: fs.readFileSync(image.filepath),
				ContentType: image.mimetype,
				Key: imageRemoteName,
			})
			.promise()
			.then((response) => {
				return imageRemoteName;
			})
			.catch((err) => {
				return false;
			});
	}

	// static uploadPdfInS3(file, path) {

	//   let folderPath = path;
	//   let fileExtension = ".pdf";
	//   const fileRemoteName = `${folderPath}/document_${new Date().getTime()}${fileExtension}`;
	//   return FileUpload.s3
	//     .putObject({
	//       Bucket: env().s3Bucket,
	//       Body: fs.readFileSync(file.filepath),
	//       ContentType: file.mimetype,
	//       Key: fileRemoteName,
	//     })
	//     .promise()
	//     .then((response) => {
	//       return fileRemoteName;
	//     })
	//     .catch((err) => {
	//       return false;
	//     });
	// }

	// static async uploadPdfInS3(file, path) {
	//   let folderPath = path;
	//   const extension = await Helper.getFileExtension(".pdf");

	//   const imageRemoteName = `${folderPath}/file_${new Date().getTime()}.${extension}`;

	//   return FileUpload.s3
	//     .putObject({
	//       Bucket: env().s3Bucket,
	//       Body: fs.readFileSync(file.filepath),
	//       ContentType: file.mimetype,
	//       Key: imageRemoteName,
	//     })
	//     .promise()
	//     .then((response) => {
	//       return imageRemoteName;
	//     })
	//     .catch((err) => {
	//       return false;
	//     });
	// }

	static async uploadPdfInS3(file, path) {
		try {
			let folderPath = path;
			const extension = await Helper.getFileExtension('.pdf');
			const imageRemoteName = `${folderPath}/file_${new Date().getTime()}.${extension}`;

			if (!fs.existsSync(file.filepath)) {
				console.error('File does not exist:', file.filepath);
				return false;
			}

			const response = await FileUpload.s3
				.putObject({
					Bucket: env().s3Bucket,
					Body: fs.readFileSync(file.filepath),
					ContentType: file.mimetype,
					Key: imageRemoteName,
				})
				.promise();

			return imageRemoteName;
		} catch (err) {
			console.error('Error uploading to S3:', err);
			return false;
		}
	}

	static deleteFromS3(path) {
		const params = {
			Bucket: env().s3Bucket,
			Delete: {
				Objects: [
					{
						Key: path,
					},
				],
			},
		};
		return FileUpload.s3
			.deleteObjects(params)
			.promise()
			.then((response) => {
				return true;
			})
			.catch((error) => {
				return false;
			});
	}
}

export default FileUpload;

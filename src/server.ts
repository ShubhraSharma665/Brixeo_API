import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import express from 'express';
import * as mongoose from 'mongoose';
import cors from 'cors';
import { env } from './environments/env';
import Routes from './routes/routes';
import { NextFunction } from 'express';
import path = require('path');
import { ReqInterface, ResInterface } from './interfaces/RequestInterface';
import cookieParser from "cookie-parser"


const app = express();


export class Server {
	public app: express.Application = express();

	constructor() {
		this.setConfigurations();
		this.setRoutes();
		this.error404Handler();
		this.handleErrors();
	}

	setConfigurations() {
		this.setMongodb();
		this.enableCors();
		this.configBodyParser();
	}

	setMongodb() {
		console.log('db===>>>', env().DB_URL);
		mongoose
			.connect(env().DB_URL)
			.then(() => {
				console.log('Database connected');
			})
			.catch((e) => {
                console.error('Error connecting to MongoDB:', e.message);
                process.exit(1); // Exit process with failure
			});
	}
	enableCors() {
		this.app.use(
			cors({
				origin: true,
				credentials: true,
			})
		);
	}

	configBodyParser() {
		this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
		this.app.use(express.json({ limit: '10mb' }));
	}

	setRoutes() {
		this.app.use(
			(req: ReqInterface, res: ResInterface, next: express.NextFunction) => {
				res.startTime = new Date().getTime();
				next();
			}
		);
		this.app.use(
			'/api-doc',
			express.static(path.resolve(process.cwd() + '/apidoc'))
		);
		this.app.use(
			'/img',
			express.static(path.resolve(process.cwd() + '/assest/images'))
		);
		app.use('./uploads', express.static(path.join(__dirname, 'uploads')));
		this.app.use('/api', Routes);
	}

	error404Handler() {
		this.app.use((req, res) => {
			res.status(404).json({
				message: 'Route not found test',
				status: 404,
			});
		});
	}

	handleErrors() {
		this.app.use((error: any, req, res, next: NextFunction) => {
			const errorStatus = error.message === "invalid token"?401:req.errorStatus || "";
			res.status(errorStatus || 500).json({
				message: error.message || 'Something went wrong!!',
				statusText: error.statusText || 'ERROR',
				status: errorStatus || 500,
				data: {},
			});
		});
	}
}

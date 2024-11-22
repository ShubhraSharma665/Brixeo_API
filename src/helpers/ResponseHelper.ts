class ResponseHelper {
	public async ok(
		res: any,
		statusText: string,
		message: any,
		data: any,
		startTime: any
	) {
		let exeTime = await this.execTime(startTime);
		data = Array.isArray(data) ? { data } : data;
		res
			.status(200)
			.json({
				status: 200,
				statusText: statusText ? statusText : 'SUCCESS',
				message: message,
				data: data,
				exeTime,
				isSuccess:true
			});
	}

	public async api(
		res: any,
		status: boolean,
		message: any,
		data: any,
		startTime: any
	) {
		let exeTime = await this.execTime(startTime);
		data = Array.isArray(data) ? data : data;
		res.status(200).json({
			status: status,
			message: message,
			data: data,
			exeTime,
			isSuccess:true
		});
	}

	public async badRequest(
		res: any,
		statusText: string,
		message: any,
		data: any = {},
		startTime: any
	) {
		let exeTime = await this.execTime(startTime);
		res.status(400).json({
			status: 400,
			statusText: statusText ? statusText : 'BAD_REQUEST',
			message: message,
			data: data,
			exeTime,
			isSuccess:false
		});
	}

	public async notAcceptable(
		res: any,
		statusText: string,
		message: any,
		data: any = {},
		startTime: any
	) {
		let exeTime = await this.execTime(startTime);
		res.status(406).json({
			status: 406,
			statusText: statusText ? statusText : 'NOT_ACCEPTABLE',
			message: message,
			data: data,
			exeTime,
			isSuccess:false
		});
	}

	public async conflict(
		res: any,
		statusText: string,
		message: any,
		data: any = {},
		startTime: any
	) {
		let exeTime = await this.execTime(startTime);
		res.status(409).json({
			status: 409,
			statusText: statusText ? statusText : 'CONFLICT',
			message: message,
			data: data,
			exeTime,
			isSuccess:false
		});
	}

	public async noContent(
		res: any,
		statusText: string,
		message: any,
		data: any = {}
	) {
		res.status(200).json({
			status: 205,
			statusText: statusText ? statusText : '',
			message: message ? message : 'Un-authenticated Request!',
			data: data,
			isSuccess:true
		});
	}

	public async unAuthenticated(
		res: any,
		statusText: string,
		message: any = null,
		data: any = {},
		startTime: any,
		wrongAttempt: any
	) {
		let exeTime = await this.execTime(startTime);
		res.status(401).json({
			status: 401,
			statusText: statusText ? statusText : 'UNAUTHORIZE',
			message: message ? message : 'Un-authenticated Request!',
			data: data,
			exeTime,
			wrongAttempt,
			isSuccess:false
		});
	}

	public async notFound(
		res: any,
		statusText: string,
		message: any = null,
		data: any = {},
		startTime: any
	) {
		let exeTime = await this.execTime(startTime);
		res.status(404).json({
			status: 404,
			statusText: statusText ? statusText : 'NOTFOUND',
			message: message ? message : 'Not Found',
			data: data,
			exeTime,
			isSuccess:false
		});
	}

	public async unAuthorize(
		res: any,
		statusText: string,
		message: any = null,
		data: any = {},
		startTime: any
	) {
		let exeTime = await this.execTime(startTime);
		res.status(403).json({
			status: 403,
			statusText: statusText ? statusText : 'UNAUTHORIZE',
			message: message ? message : 'Un-authenticated Request!',
			data: data,
			exeTime,
			isSuccess:false
		});
	}

	public async serverError(res: any, message: string = null, data: any = {}) {
		let exeTime = await this.execTime(res);
		res.status(500).json({
			status: 500,
			message: message ? message : 'Internal Server Error!',
			data: data,
			exeTime,
			isSuccess:false
		});
	}

	public async created(
		res: any,
		statusText: string,
		message: any = null,
		data: any = {}
	) {
		res.status(201).json({
			status: 201,
			statusText: statusText ? statusText : 'CREATED',
			message: message ? message : 'created!',
			data: data,
			isSuccess:true
		});
	}

	public async acceptanceRequired(
		res: any,
		statusText: string,
		message: any = null,
		data: any = {}
	) {
		res.status(406).json({
			status: 406,
			statusText: statusText ? statusText : 'FAILED',
			message: message ? message : 'created!',
			data: data,
			isSuccess:false
		});
	}

	private async execTime(res: any): Promise<any> {
		// return new Date().getTime() - res.startTime;
		return new Date().getTime() - res;
	}
	private async tracking(tempt: number): Promise<any> {
		return +tempt;
	}
}

export default new ResponseHelper();

import { Router } from 'express';
import Authentication from '../../middlewares/Authentication';
import { ChatController } from '../../controllers/admin/ChatController';
import { upload } from '../../middlewares/MulterMiddleware';

class ChatRouter {
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
        this.router.post(
            "/upload-file",
            Authentication.admin,
            upload.fields([
              { name: "file", maxCount: 1 },
            ]),
            ChatController.uploadImage
          );

          this.router.post(
            "/create-chat",
            Authentication.admin,
            ChatController.createChat
          );
    }

    public get() {
        this.router.get(
        	'/get',
        	Authentication.admin,
        	ChatController.getChatList
        );
    }
}

export default new ChatRouter().router;

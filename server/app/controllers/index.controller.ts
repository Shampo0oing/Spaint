import { TYPES } from '@app/types';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { IndexService } from '../services/index.service';

const HTTP_STATUS_UNACCEPTABLE = 406;
const HTTP_IMGUR_ERROR = 503;

@injectable()
export class IndexController {
    router: Router;

    constructor(@inject(TYPES.IndexService) private indexService: IndexService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        /**
         * @swagger
         *
         * definitions:
         *   Message:
         *     type: object
         *     properties:
         *       title:
         *         type: string
         *       body:
         *         type: string
         */

        /**
         * @swagger
         * tags:
         *   - name: Index
         *     description: Default cadriciel endpoint
         *   - name: Message
         *     description: Messages functions
         */

        /**
         * @swagger
         *
         * /api/index/send:
         *   post:
         *     description: Send a message
         *     tags:
         *       - Index
         *       - Message
         *     requestBody:
         *         description: message object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/Message'
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
         */

        // Upload on imgur
        this.router.put('/canvas/imgur/upload', async (req: Request, res: Response, next: NextFunction) => {
            const { image, name, description } = req.body;
            if (this.indexService.validate(name, description)) {
                this.indexService.uploadOnImgur(image, name, description ? description.join() : '').then(
                    (imgurImage) => {
                        res.json(imgurImage);
                    },
                    (err) => {
                        console.log(err);
                        res.sendStatus(HTTP_IMGUR_ERROR);
                    },
                );
            } else {
                res.sendStatus(HTTP_STATUS_UNACCEPTABLE);
            }
        });

        this.router.post('/canvas/imgur/album/create', async (req: Request, res: Response, next: NextFunction) => {
            this.indexService.creatAlbumImgur().then(
                (imgurAlbum) => res.json(imgurAlbum),
                (err) => {
                    console.log(err);
                    res.sendStatus(HTTP_IMGUR_ERROR);
                },
            );
        });

        this.router.post('/canvas/imgur/album/add', async (req: Request, res: Response, next: NextFunction) => {
            const { imageIds, albumHash } = req.body;
            this.indexService.addImgurImageToAlbum(imageIds, albumHash).then(
                (albumId) => {
                    res.json(albumId);
                },
                (err) => {
                    console.log(err);
                    res.sendStatus(HTTP_IMGUR_ERROR);
                },
            );
        });

        this.router.get('/canvas/imgur/album/images', async (req: Request, res: Response, next: NextFunction) => {
            const { albumHash } = req.query;
            this.indexService.getAllImages(albumHash).then(
                (images) => res.json(images),
                (err) => {
                    console.log(err);
                    res.sendStatus(HTTP_IMGUR_ERROR);
                },
            );
        });

        this.router.delete('/canvas/imgur/image/delete', async (req: Request, res: Response, next: NextFunction) => {
            const { imageId } = req.query;
            this.indexService.deleteImgurImage(imageId).then(
                (id) => res.json(id),
                (err) => {
                    console.log(err);
                    res.sendStatus(HTTP_IMGUR_ERROR);
                },
            );
        });

        this.router.delete('/canvas/imgur/image/deleteAll', async (req: Request, res: Response, next: NextFunction) => {
            const { imageIds } = req.query;
            this.indexService.deleteAllImgurImages(imageIds).then(
                (id) => res.json(id),
                (err) => {
                    console.log(err);
                    res.sendStatus(HTTP_IMGUR_ERROR);
                },
            );
        });
    }
}

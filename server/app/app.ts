import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import * as logger from 'morgan';
import * as path from 'path';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { IndexController } from './controllers/index.controller';
import { TYPES } from './types';
// import { Request, Response } from 'express';

@injectable()
export class Application {
    private readonly internalError: number = 500;
    private readonly swaggerOptions: swaggerJSDoc.Options;
    app: express.Application;

    constructor(@inject(TYPES.IndexController) private indexController: IndexController) {
        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();

        this.bindRoutes();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json({ limit: '32mb' }));
        this.app.use(bodyParser.urlencoded({ limit: '32mb', extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    bindRoutes(): void {
        // Notre application utilise le routeur de notre API `Index`
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.app.use('/api/index', this.indexController.router);

        this.app.use(express.static(path.join(__dirname, 'client')));
        // @ts-ignore
        this.app.get(/^((?!\/api\/).)*$/, (req: Request, res: Response) => {
            // @ts-ignore
            res.sendFile(path.join(__dirname, 'client/index.html'));
        });
        /*this.app.use((req, res) => {
            res.sendFile(path.join(__dirname, 'client/index.html'));
        });*/
        this.errorHandling();
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: Error = new Error('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            // tslint:disable-next-line:no-any
            this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        // tslint:disable-next-line:no-any
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}

import { Application } from '@app/app';
import { IndexService } from '@app/services/index.service';
import { TYPES } from '@app/types';
import { describe } from 'mocha';
import * as supertest from 'supertest';
import { Stubbed, testingContainer } from '../../test/test-utils';

// tslint:disable:no-any
const HTTP_STATUS_OK = 200;

describe('IndexController', () => {
    let indexService: Stubbed<IndexService>;
    let app: Express.Application;

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.IndexService).toConstantValue({
            deleteCanvasImage: sandbox.stub().resolves(),
            getCanvasIds: sandbox.stub().resolves(),
            saveCanvasImage: sandbox.stub().resolves(),
            validate: sandbox.stub().resolves(),
        });
        indexService = container.get(TYPES.IndexService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('upload should not upload body if name or tag doesnt pass validator', async () => {
        indexService.validate.returns(false);
        return supertest(app).put('/api/index/canvas/upload').expect(HTTP_STATUS_OK);
    });
});

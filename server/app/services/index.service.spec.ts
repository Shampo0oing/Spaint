import { TYPES } from '@app/types';
import { expect } from 'chai';
import { testingContainer } from '../../test/test-utils';
import { IndexService } from './index.service';

describe('Index service', () => {
    let indexService: IndexService;

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DateService).toConstantValue({
            currentTime: sandbox.stub().resolves({
                title: 'Time',
                body: new Date(2020, 0, 10).toString(),
            }),
        });
        indexService = container.get<IndexService>(TYPES.IndexService);
    });

    it('validate should return false if name doesnt pass', (done: Mocha.Done) => {
        const test = indexService.validate('YOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO', ['wow']);
        expect(test).to.equals(false);
        done();
    });

    it('validate should return true if name pass', (done: Mocha.Done) => {
        const test = indexService.validate('YOOOOOOOOO', ['wow']);
        expect(test).to.equals(true);
        done();
    });
});

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';
import { DatabaseService } from './database.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('Database service', () => {
    it('init should connect with mongoose', (done: Mocha.Done) => {
        const connectSpy = sinon.stub(mongoose, 'connect').callsArgWith(2);
        const logSpy = sinon.spy(console, 'log');
        DatabaseService.init();
        chai.expect(connectSpy.called).to.equals(true);
        chai.expect(logSpy.called).to.equals(true);
        connectSpy.restore();
        done();
    });

    it('init should handle errors', (done: Mocha.Done) => {
        const errorSpy = sinon.stub(console, 'error');
        const connectSpy = sinon.stub(mongoose, 'connect').callsArgWith(2, new Error());
        DatabaseService.init();
        chai.expect(errorSpy.called).to.equals(true);
        connectSpy.restore();
        done();
    });
});

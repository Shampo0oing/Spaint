import { TestBed } from '@angular/core/testing';
import { ActionStub } from '@app/classes/Actions/action-stub';
import { DrawingService } from '@app/services/drawing/drawing.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionStub', () => {
    let actionStub: ActionStub;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        actionStub = new ActionStub(drawServiceSpy);
    });

    it('should be created', () => {
        expect(actionStub).toBeTruthy();
    });

    it('draw should do nothing', () => {
        actionStub.draw();
        expect(actionStub).toBeTruthy();
    });
});

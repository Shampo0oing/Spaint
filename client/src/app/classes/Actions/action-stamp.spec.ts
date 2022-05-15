import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { ActionStamp } from './action-stamp';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionPolygon', () => {
    let actionStamp: ActionStamp;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let stampServiceSpy: jasmine.SpyObj<StampService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        stampServiceSpy = jasmine.createSpyObj('TextService', ['rotateImage']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: StampService, useValue: stampServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable-next-line: prettier
        actionStamp = new ActionStamp(drawServiceSpy, { x: 10, y: 10 }, '', 100, 100, [''], stampServiceSpy);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionStamp['drawingService'].baseCtx = baseCtxStub;
    });

    it('should be created', () => {
        expect(actionStamp).toBeTruthy();
    });

    it('draw should call writeAllText', () => {
        actionStamp.draw();
        expect(stampServiceSpy.rotateImage).toHaveBeenCalled();
    });
});

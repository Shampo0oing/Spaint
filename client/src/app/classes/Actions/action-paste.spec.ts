import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ActionPaste } from './action-paste';

const POSITION_TEST = { x: 15, y: 15 };
const DIMENSION_TEST = { x: 100, y: 100 };
// tslint:disable:no-string-literal
// tslint:disable:no-any
describe('ActionPaste', () => {
    let actionPaste: ActionPaste;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['drawImageDataOnBaseCtx']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        actionPaste = new ActionPaste(drawingServiceSpy, {} as ImageData, POSITION_TEST, DIMENSION_TEST);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionPaste['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
    });

    it('should be created', () => {
        expect(actionPaste).toBeTruthy();
    });

    it('draw should call putImageData of the baseCtx of drawingService', () => {
        actionPaste.draw();
        expect(drawingServiceSpy.drawImageDataOnBaseCtx).toHaveBeenCalled();
    });
});

import { TestBed } from '@angular/core/testing';
import { ActionLine } from '@app/classes/Actions/action-line';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionLine', () => {
    let actionLine: ActionLine;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        actionLine = new ActionLine(
            drawServiceSpy,
            [
                { x: 0, y: 0 },
                { x: 10, y: 10 },
                { x: 10, y: 5 },
                { x: 5, y: 10 },
                { x: 5, y: 5 },
            ],
            '#555555',
            5,
            10,
            true,
        );
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionLine['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
    });

    it('should be created', () => {
        expect(actionLine).toBeTruthy();
    });

    it('draw should draw the right amout of line and the rigth amout of juncition', () => {
        const lineToSpy = spyOn<any>(actionLine['drawingService'].baseCtx, 'lineTo').and.callThrough();
        const arcSpy = spyOn<any>(actionLine['drawingService'].baseCtx, 'arc').and.callThrough();
        actionLine.draw();
        expect(lineToSpy).toHaveBeenCalledTimes(actionLine.pathData.length);
        expect(arcSpy).toHaveBeenCalledTimes(actionLine.pathData.length - 2);
    });
});

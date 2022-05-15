import { TestBed } from '@angular/core/testing';
import { ActionPencil } from '@app/classes/Actions/action-pencil';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionPencil', () => {
    let actionPencil: ActionPencil;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        actionPencil = new ActionPencil(
            drawServiceSpy,
            [
                { x: 0, y: 0 },
                { x: 10, y: 10 },
                { x: 10, y: 0 },
                { x: 0, y: 10 },
                { x: 5, y: 5 },
            ],
            '#000000',
            10,
        );
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionPencil['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
    });

    it('should be created', () => {
        expect(actionPencil).toBeTruthy();
    });

    it('draw should draw the same number of line as there is point in the pathData', () => {
        const moveToSpy = spyOn<any>(actionPencil['drawingService'].baseCtx, 'moveTo').and.callThrough();
        const lineToSpy = spyOn<any>(actionPencil['drawingService'].baseCtx, 'lineTo').and.callThrough();
        actionPencil.draw();
        expect(moveToSpy).toHaveBeenCalledTimes(1);
        expect(lineToSpy).toHaveBeenCalledTimes(actionPencil.pathData.length);
    });
});

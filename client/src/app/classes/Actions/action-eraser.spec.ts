import { TestBed } from '@angular/core/testing';
import { ActionEraser } from '@app/classes/Actions/action-eraser';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionEraser', () => {
    let actionEraser: ActionEraser;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let eraserServiceSpy: jasmine.SpyObj<EraserService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    const pathData: Vec2[] = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: 0, y: 9 },
    ];

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        eraserServiceSpy = jasmine.createSpyObj('EraserService', ['completeLine', 'distance']);
        // because we didnt find another way to call the true methode
        eraserServiceSpy.distance.and.callFake((pos1: Vec2, pos2: Vec2) => {
            return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
        });
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: EraserService, useValue: eraserServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        actionEraser = new ActionEraser(drawServiceSpy, pathData, 10, eraserServiceSpy);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionEraser['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
    });

    it('should be created', () => {
        expect(actionEraser).toBeTruthy();
    });

    it('draw should draw the same number of rectangle as there is point in the pathData', () => {
        const fillRectSpy = spyOn<any>(actionEraser['drawingService'].baseCtx, 'fillRect').and.callThrough();
        actionEraser.draw();
        expect(fillRectSpy).toHaveBeenCalledTimes(pathData.length);
    });
});

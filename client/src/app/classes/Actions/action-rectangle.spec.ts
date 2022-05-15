import { TestBed } from '@angular/core/testing';
import { ActionRectangle } from '@app/classes/Actions/action-rectangle';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionRectangle', () => {
    let actionRectangle: ActionRectangle;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let rectangleServiceSpy: jasmine.SpyObj<RectangleService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    const expectedStartingPoint: Vec2 = { x: 10, y: 10 };
    const expectedDimension: Vec2 = { x: 10, y: 10 };

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        rectangleServiceSpy = jasmine.createSpyObj('RectangleService', ['traceType']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: RectangleService, useValue: rectangleServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        actionRectangle = new ActionRectangle(
            drawServiceSpy,
            expectedStartingPoint,
            '#123456',
            '#654321',
            expectedDimension.x,
            expectedDimension.y,
            5,
            0,
            rectangleServiceSpy,
        );
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionRectangle['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
    });

    it('should be created', () => {
        expect(actionRectangle).toBeTruthy();
    });

    it('draw should call rect with expected values', () => {
        const rectSpy = spyOn<any>(actionRectangle['drawingService'].baseCtx, 'rect').and.callThrough();
        actionRectangle.draw();
        expect(rectSpy).toHaveBeenCalledWith(expectedStartingPoint.x, expectedStartingPoint.y, expectedDimension.x, expectedDimension.y);
    });
});

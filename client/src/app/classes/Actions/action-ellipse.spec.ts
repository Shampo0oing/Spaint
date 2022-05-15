import { TestBed } from '@angular/core/testing';
import { ActionEllipse } from '@app/classes/Actions/action-ellipse';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionEllipse', () => {
    let actionEllipse: ActionEllipse;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let ellipseServiceSpy: jasmine.SpyObj<EllipseService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    const startingPoint: Vec2 = { x: 10, y: 10 };
    const endingPoint: Vec2 = { x: 20, y: 20 };

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        ellipseServiceSpy = jasmine.createSpyObj('EllipseService', ['traceType']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: EllipseService, useValue: ellipseServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        actionEllipse = new ActionEllipse(drawServiceSpy, startingPoint, endingPoint, '#000000', '#FF20FF', 10, 0, ellipseServiceSpy);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionEllipse['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
    });

    it('should be created', () => {
        expect(actionEllipse).toBeTruthy();
    });

    it('draw should draw an ellipse', () => {
        const ellipseSpy = spyOn<any>(actionEllipse['drawingService'].baseCtx, 'ellipse').and.callThrough();
        actionEllipse.draw();
        expect(ellipseSpy).toHaveBeenCalledWith(startingPoint.x, startingPoint.y, endingPoint.x, endingPoint.y, 0, 0, 2 * Math.PI);
    });
});

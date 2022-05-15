import { TestBed } from '@angular/core/testing';
import { ActionPolygon } from '@app/classes/Actions/action-polygon';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionPolygon', () => {
    let actionPolygon: ActionPolygon;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let polygonServiceSpy: jasmine.SpyObj<PolygonService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        polygonServiceSpy = jasmine.createSpyObj('PolygonService', ['drawPolygon']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: PolygonService, useValue: polygonServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        actionPolygon = new ActionPolygon(drawServiceSpy, 10, { x: 10, y: 10 }, 10, '#000000', '#FF20FF', 0, 5, polygonServiceSpy);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionPolygon['drawingService'].baseCtx = baseCtxStub;
    });

    it('should be created', () => {
        expect(actionPolygon).toBeTruthy();
    });

    it('draw should call drawPolygon', () => {
        actionPolygon.draw();
        expect(polygonServiceSpy.drawPolygon).toHaveBeenCalled();
    });
});

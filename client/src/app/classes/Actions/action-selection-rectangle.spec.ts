import { TestBed } from '@angular/core/testing';
import { ActionSelectionRectangle } from '@app/classes/Actions/action-selection-rectangle';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';

const POSITION_DEPART = { x: 0, y: 0 };
const POSITION_FINAL = { x: 10, y: 10 };
const DIMENSIONS = { x: 10, y: 10 };
const DUMMY_ELEMENT = { getContext: {}, setAttribute: {}, remove: {} } as HTMLCanvasElement;

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionSelectionRectangle', () => {
    let actionSelectionRectangle: ActionSelectionRectangle;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let getImageDataSpy: jasmine.Spy;
    let putImageDataSpy: jasmine.Spy;
    let fillRectSpy: jasmine.Spy;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionSelectionRectangle = new ActionSelectionRectangle(
            drawingServiceSpy,
            POSITION_DEPART,
            POSITION_FINAL,
            DIMENSIONS,
            DIMENSIONS,
            true,
            true,
        );
        drawingServiceSpy.baseCtx = baseCtxStub;
        spyOn<any>(document, 'createElement').and.returnValue(DUMMY_ELEMENT);
        spyOn<any>(DUMMY_ELEMENT, 'getContext').and.returnValue(baseCtxStub);
        spyOn<any>(DUMMY_ELEMENT, 'setAttribute').and.stub();
        spyOn<any>(DUMMY_ELEMENT, 'remove').and.stub();
        getImageDataSpy = spyOn<any>(drawingServiceSpy.baseCtx, 'getImageData').and.stub();
        putImageDataSpy = spyOn<any>(drawingServiceSpy.baseCtx, 'putImageData').and.stub();
        fillRectSpy = spyOn<any>(drawingServiceSpy.baseCtx, 'fillRect').and.stub();
        spyOn<any>(baseCtxStub, 'drawImage').and.stub();
    });

    it('should be created', () => {
        expect(actionSelectionRectangle).toBeTruthy();
    });

    it('draw should call getImageData, putImageData and fillRect of the canvas of drawingService', () => {
        actionSelectionRectangle.draw();
        expect(getImageDataSpy).toHaveBeenCalledWith(POSITION_DEPART.x, POSITION_DEPART.y, DIMENSIONS.x, DIMENSIONS.y);
        expect(fillRectSpy).toHaveBeenCalledWith(POSITION_DEPART.x, POSITION_DEPART.y, DIMENSIONS.x, DIMENSIONS.y);
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('draw should call getImageData, putImageData and fillRect of the canvas of drawingService', () => {
        actionSelectionRectangle.flipX = actionSelectionRectangle.flipY = false;
        actionSelectionRectangle.draw();
        expect(getImageDataSpy).toHaveBeenCalledWith(POSITION_DEPART.x, POSITION_DEPART.y, DIMENSIONS.x, DIMENSIONS.y);
        expect(fillRectSpy).toHaveBeenCalledWith(POSITION_DEPART.x, POSITION_DEPART.y, DIMENSIONS.x, DIMENSIONS.y);
        expect(putImageDataSpy).toHaveBeenCalled();
    });
});

import { TestBed } from '@angular/core/testing';
import { ActionSelectionEllipse } from '@app/classes/Actions/action-selection-ellipse';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionEllipseService } from '@app/services/tools/selection/selection-ellipse.service';

const POSITION_DEPART = { x: 0, y: 0 };
const POSITION_FINAL = { x: 10, y: 10 };
const DIMENSIONS = { x: 10, y: 10 };
const DUMMY_ELEMENT = { getContext: {}, setAttribute: {}, remove: {} } as HTMLCanvasElement;

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionSelectionEllipse', () => {
    let actionSelectionEllipse: ActionSelectionEllipse;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionEllipseServiceSpy: jasmine.SpyObj<SelectionEllipseService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let getImageDataSpy: jasmine.Spy;
    let putImageDataSpy: jasmine.Spy;
    let ellipseSpy: jasmine.Spy;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'ignoreInvisiblePixels', 'autoSave']);
        selectionEllipseServiceSpy = jasmine.createSpyObj('SelectionEllipseService', ['makeInvisible', 'ignoreInvisiblePixels']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                {
                    provide: SelectionEllipseService,
                    useValue: selectionEllipseServiceSpy,
                },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionSelectionEllipse = new ActionSelectionEllipse(
            drawingServiceSpy,
            selectionEllipseServiceSpy,
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
        ellipseSpy = spyOn<any>(drawingServiceSpy.baseCtx, 'ellipse').and.stub();
        spyOn<any>(baseCtxStub, 'drawImage').and.stub();
    });

    it('should be created', () => {
        expect(actionSelectionEllipse).toBeTruthy();
    });

    it('draw should call getImageData, putImageData and ellipse of the canvas of drawingService', () => {
        actionSelectionEllipse.draw();
        expect(getImageDataSpy).toHaveBeenCalledWith(POSITION_DEPART.x, POSITION_DEPART.y, DIMENSIONS.x, DIMENSIONS.y);
        expect(ellipseSpy).toHaveBeenCalledWith(
            POSITION_DEPART.x + DIMENSIONS.x / 2,
            POSITION_DEPART.y + DIMENSIONS.y / 2,
            DIMENSIONS.x / 2,
            DIMENSIONS.y / 2,
            0,
            0,
            2 * Math.PI,
        );
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('draw should call getImageData, putImageData and ellipse of the canvas of drawingService', () => {
        actionSelectionEllipse.flipY = actionSelectionEllipse.flipX = false;
        actionSelectionEllipse.draw();
        expect(getImageDataSpy).toHaveBeenCalledWith(POSITION_DEPART.x, POSITION_DEPART.y, DIMENSIONS.x, DIMENSIONS.y);
        expect(ellipseSpy).toHaveBeenCalledWith(
            POSITION_DEPART.x + DIMENSIONS.x / 2,
            POSITION_DEPART.y + DIMENSIONS.y / 2,
            DIMENSIONS.x / 2,
            DIMENSIONS.y / 2,
            0,
            0,
            2 * Math.PI,
        );
        expect(putImageDataSpy).toHaveBeenCalled();
    });
});

import { TestBed } from '@angular/core/testing';
import { ActionSelectionLasso } from '@app/classes/Actions/action-selection-lasso';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionLassoService } from '@app/services/tools/selection/selection-lasso.service';

const POSITION_DEPART = { x: 0, y: 0 };
const POSITION_FINAL = { x: 10, y: 10 };
const DIMENSIONS = { x: 10, y: 10 };
const DUMMY_ELEMENT = { getContext: {}, setAttribute: {}, remove: {} } as HTMLCanvasElement;

// tslint:disable:no-string-literal
// tslint:disable:no-any

describe('ActionSelectionLasso', () => {
    let actionSelectionLasso: ActionSelectionLasso;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionLassoServiceSpy: jasmine.SpyObj<SelectionLassoService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let getImageDataSpy: jasmine.Spy;
    let putImageDataSpy: jasmine.Spy;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'ignoreInvisiblePixels', 'makeInvisible']);
        selectionLassoServiceSpy = jasmine.createSpyObj('SelectionLassoService', ['makeInvisible']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                {
                    provide: SelectionLassoService,
                    useValue: selectionLassoServiceSpy,
                },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        const pathData = [{ x: 0, y: 0 }];
        actionSelectionLasso = new ActionSelectionLasso(
            drawingServiceSpy,
            selectionLassoServiceSpy,
            POSITION_DEPART,
            POSITION_FINAL,
            DIMENSIONS,
            DIMENSIONS,
            pathData,
            true,
            true,
        );
        drawingServiceSpy.baseCtx = baseCtxStub;
        spyOn<any>(document, 'createElement').and.returnValue(DUMMY_ELEMENT);
        spyOn<any>(DUMMY_ELEMENT, 'getContext').and.returnValue(baseCtxStub);
        spyOn<any>(DUMMY_ELEMENT, 'setAttribute').and.stub();
        spyOn<any>(DUMMY_ELEMENT, 'remove').and.stub();
        spyOn<any>(baseCtxStub, 'drawImage').and.stub();
        getImageDataSpy = spyOn<any>(drawingServiceSpy.baseCtx, 'getImageData').and.stub();
        putImageDataSpy = spyOn<any>(drawingServiceSpy.baseCtx, 'putImageData').and.stub();
    });

    it('should be created', () => {
        expect(actionSelectionLasso).toBeTruthy();
    });

    it('draw should call getImageData, putImageData and fillRect of the canvas of drawingService', () => {
        actionSelectionLasso.draw();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('draw should call getImageData, putImageData and fillRect of the canvas of drawingService', () => {
        actionSelectionLasso.flipX = actionSelectionLasso.flipY = false;
        actionSelectionLasso.draw();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
    });
});

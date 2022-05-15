import { TestBed } from '@angular/core/testing';
import { ActionDelete } from '@app/classes/Actions/action-delete';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { WHITE } from '@app/classes/constantes';
import { DrawingService } from '@app/services/drawing/drawing.service';

const POSITION_TEST = { x: 10, y: 10 };
const DIMENSION_TEST = { x: 2, y: 2 };
// tslint:disable:no-string-literal
// tslint:disable:no-any
describe('ActionDelete', () => {
    let actionDelete: ActionDelete;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let createImageDataSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['drawImageDataOnBaseCtx']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        // tslint:disable-next-line:no-magic-numbers
        const data = new Uint8ClampedArray(16);
        // tslint:disable-next-line:no-magic-numbers
        data[4] = data[5] = data[6] = data[7] = WHITE;

        const imageData = new ImageData(data, DIMENSION_TEST.x);
        actionDelete = new ActionDelete(drawingServiceSpy, POSITION_TEST, DIMENSION_TEST, imageData);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionDelete['drawingService'].baseCtx = baseCtxStub;
    });

    it('should be created', () => {
        expect(actionDelete).toBeTruthy();
    });

    it('draw should call putImageData of the baseCtx of drawingService', () => {
        createImageDataSpy = spyOn<any>(baseCtxStub, 'createImageData').and.stub();
        const imageData = baseCtxStub.getImageData(POSITION_TEST.x, POSITION_TEST.y, DIMENSION_TEST.x, DIMENSION_TEST.y);
        createImageDataSpy.and.callFake(() => {
            return imageData;
        });
        actionDelete.draw();
        expect(drawingServiceSpy.drawImageDataOnBaseCtx).toHaveBeenCalled();
        expect(createImageDataSpy).toHaveBeenCalled();
    });
});

import { TestBed } from '@angular/core/testing';
import { ActionPaste } from '@app/classes/Actions/action-paste';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SelectionRectangleService } from '@app/services/tools/selection/selection-rectangle.service';
import { ClipboardService } from './clipboard.service';

// tslint:disable:no-string-literal
// tslint:disable:no-any
// tslint:disable:no-magic-numbers
describe('SelectionRectangleService', () => {
    let service: SelectionRectangleService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let annulerRefaireServiceSpy: jasmine.SpyObj<AnnulerRefaireService>;
    let clipboardServiceSpy: jasmine.SpyObj<ClipboardService>;
    let rectangleServiceSpy: jasmine.SpyObj<RectangleService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'drawImageDataOnBaseCtx'], { canvas: {} as HTMLCanvasElement });
        annulerRefaireServiceSpy = jasmine.createSpyObj('AnnulerRefaireService', ['addUndoAction']);
        clipboardServiceSpy = jasmine.createSpyObj('clipboardServiceSpy', ['copy']);
        rectangleServiceSpy = jasmine.createSpyObj('RectangleService', ['getSquarePos']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: AnnulerRefaireService, useValue: annulerRefaireServiceSpy },
                { provide: RectangleService, useValue: rectangleServiceSpy },
                { provide: ClipboardService, useValue: clipboardServiceSpy },
            ],
        });
        service = TestBed.inject(SelectionRectangleService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        // Configuration du spy du service
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        annulerRefaireServiceSpy.undoActions = [];
        annulerRefaireServiceSpy.redoActions = [];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('drawSelectedZone should change squarePos and call drawOutline, getSquarePos if shift is true', () => {
        const expectedResult = { x: 10, y: 10 } as Vec2;
        const drawOutlineSpy: jasmine.Spy<any> = spyOn<any>(service, 'drawOutline');
        const min = 10;
        service.shift = true;
        service.mouseDownCoord = { x: 10, y: 10 } as Vec2;
        service.lastMousePos = { x: 20, y: 20 } as Vec2;
        rectangleServiceSpy.min = min;
        rectangleServiceSpy.getSquarePos.and.callFake(() => {
            return { x: 10, y: 10 };
        });
        service.drawSelectedZone();
        expect(rectangleServiceSpy.getSquarePos).toHaveBeenCalledWith(service.lastMousePos, service.mouseDownCoord);
        expect(drawOutlineSpy).toHaveBeenCalledWith(expectedResult, expectedResult);
    });

    it('drawSelectedZone should call drawOutline if shift is false', () => {
        const expectedResult = { x: 10, y: 10 } as Vec2;

        const drawOutlineSpy: jasmine.Spy<any> = spyOn<any>(service, 'drawOutline');

        service.shift = false;
        service.mouseDownCoord = { x: 10, y: 10 } as Vec2;
        service.lastMousePos = { x: 20, y: 20 } as Vec2;
        service.drawSelectedZone();
        expect(drawOutlineSpy).toHaveBeenCalledWith(expectedResult, expectedResult);
    });

    it('drawOutline should call beginPath, stroke and rect', () => {
        const beginPathSpy = spyOn<any>(previewCtxStub, 'beginPath').and.stub();
        const strokeSpy = spyOn<any>(previewCtxStub, 'stroke').and.stub();
        const rectSpy = spyOn<any>(previewCtxStub, 'rect').and.stub();
        const position = { x: 10, y: 10 } as Vec2;
        const dimensions = { x: 100, y: 100 } as Vec2;
        service.drawOutline(position, dimensions);

        expect(beginPathSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
        expect(rectSpy).toHaveBeenCalledWith(position.x, position.y, dimensions.x, dimensions.y);
    });

    it('drawRectOrSquare should change imageDataInitialPosition and imageDataDimension if shift is true', () => {
        const min = 10;
        service.shift = true;
        service.squarePos = { x: 10, y: 10 };
        service['rectangleService'].min = min;
        rectangleServiceSpy.min = min;
        service.drawRectOrSquare();
        expect(service.imageDataInitialPosition).toEqual({ x: 10, y: 10 } as Vec2);
        expect(service.imageDataInitialDimension).toEqual({ x: 10, y: 10 } as Vec2);
    });

    it('drawRectOrSquare should change imageDataInitialPosition and imageDataDimension if shift is false', () => {
        const lastMousePos = { x: 20, y: 20 } as Vec2;
        const mouseDownCoord = { x: 5, y: 5 } as Vec2;
        const expectedResult = { x: 15, y: 15 } as Vec2;

        service.shift = false;
        service.lastMousePos = lastMousePos;
        service.mouseDownCoord = mouseDownCoord;
        service.drawRectOrSquare();

        expect(service.imageDataInitialPosition).toEqual(mouseDownCoord);
        expect(service.imageDataInitialDimension).toEqual(expectedResult);
    });

    it(' selectImage should call fillRect and putImageData', () => {
        const fullDimensions = 10;
        const halfDimensions = 5;
        spyOn(baseCtxStub, 'getImageData').and.returnValue({} as ImageData);
        spyOn<any>(service, 'drawRectOrSquare').and.stub();
        service.imageDataInitialPosition = { x: 0, y: 0 } as Vec2;
        service.imageDataDimension = { x: 10, y: 10 } as Vec2;
        baseCtxStub.fillStyle = '#ffffff';
        baseCtxStub.fillRect(0, 0, halfDimensions, fullDimensions);
        baseCtxStub.fillStyle = '#000000';
        baseCtxStub.fillRect(halfDimensions, 0, fullDimensions, fullDimensions);
        const fillRectSpy = spyOn<any>(baseCtxStub, 'fillRect').and.stub();
        const putImageDataSpy = spyOn<any>(previewCtxStub, 'putImageData').and.stub();
        service.selectImage();
        expect(fillRectSpy).toHaveBeenCalledWith(
            service.imageDataInitialPosition.x,
            service.imageDataInitialPosition.y,
            service.imageDataDimension.x,
            service.imageDataDimension.y,
        );
        expect(putImageDataSpy).toHaveBeenCalledWith(
            service.imageDataSelection,
            service.imageDataInitialPosition.x,
            service.imageDataInitialPosition.y,
        );
    });

    it(' isInside should return true if mouseDown is within the selected area', () => {
        service.mouseDownCoord = { x: 5, y: 5 } as Vec2;
        service.imageDataPosition = { x: 0, y: 0 } as Vec2;
        service.imageDataDimension = { x: 10, y: 10 } as Vec2;
        expect(service.isInside()).toEqual(true);
    });

    it(' isInside should return false if mouseDown is not within the selected area', () => {
        service.mouseDownCoord = { x: 50, y: 50 } as Vec2;
        service.imageDataPosition = { x: 0, y: 0 } as Vec2;
        service.imageDataDimension = { x: 10, y: 10 } as Vec2;
        expect(service.isInside()).toEqual(false);
    });

    it(' confirmation should call drawImageDataOnBaseCtx and addUndoAction', () => {
        service.confirmation();
        expect(drawingServiceSpy.drawImageDataOnBaseCtx).toHaveBeenCalled();
        expect(annulerRefaireServiceSpy.addUndoAction).toHaveBeenCalled();
    });

    it(' confirmation should change the last action done if it was an ActionPaste', () => {
        spyOn<any>(service, 'lastActionIsPaste').and.stub().and.returnValue(true);
        annulerRefaireServiceSpy.undoActions.push({ position: { x: 0, y: 0 } } as ActionPaste);
        service.imageDataPosition.x = service.imageDataPosition.y = 2;
        service.confirmation();
        expect((annulerRefaireServiceSpy.undoActions[0] as ActionPaste).position).toEqual({ x: 2, y: 2 } as Vec2);
    });

    // tslint:disable-next-line: max-line-length
    it(' confirmation should call drawImageDataOnBaseCtx and addUndoAction if paste is true or the initialPosition is the same as the current position', () => {
        spyOn<any>(service, 'lastActionIsPaste').and.returnValue(false);
        service.imageDataInitialPosition = service.imageDataPosition = { x: 0, y: 0 };
        service.confirmation(false);
        expect(drawingServiceSpy.drawImageDataOnBaseCtx).toHaveBeenCalled();
        expect(annulerRefaireServiceSpy.addUndoAction).not.toHaveBeenCalled();
    });

    it(' confirmation should change the last action done if it was an ActionPaste', () => {
        spyOn<any>(service, 'lastActionIsPaste').and.stub().and.returnValue(false);
        service.flipX = true;
        service.imageDataInitialPosition = { x: 10, y: 10 };
        service.imageDataPosition = { x: 10, y: 10 };
        annulerRefaireServiceSpy.undoActions.push({ position: { x: 0, y: 0 } } as ActionPaste);
        service.imageDataPosition.x = service.imageDataPosition.y = 2;
        service.confirmation(false);
        expect(service.flipX).toBeFalse();
    });

    it(' selectAll should change lastMousePos to the bottom right corner of the canvas, call selectImage and addUndoAction', () => {
        const TESTING_DIMENSION = 500;
        drawingServiceSpy.canvas.width = drawingServiceSpy.canvas.height = TESTING_DIMENSION;
        const selectImageSpy = spyOn<any>(service, 'selectImage').and.stub();
        service.selectAll();
        expect(service.lastMousePos).toEqual({ x: TESTING_DIMENSION, y: TESTING_DIMENSION } as Vec2);
        expect(selectImageSpy).toHaveBeenCalled();
    });

    it(' getCurrentToolString should return selectionRectangle', () => {
        expect(service.getCurrentToolString()).toEqual('selectionRectangle');
    });

    it(" copy should call clipboardService's copy", () => {
        clipboardServiceSpy.copy.and.stub();
        service.copy();
        expect(clipboardServiceSpy.copy).toHaveBeenCalled();
    });
});

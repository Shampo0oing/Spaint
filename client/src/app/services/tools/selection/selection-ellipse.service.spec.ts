import { TestBed } from '@angular/core/testing';
import { ActionPaste } from '@app/classes/Actions/action-paste';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BLUE, GREEN, OPACITY, PIXEL_SIZE, RED, WHITE } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { SelectionEllipseService } from '@app/services/tools/selection/selection-ellipse.service';
import { ClipboardService } from './clipboard.service';

// tslint:disable:no-string-literal
// tslint:disable:no-any
describe('SelectionEllipseService', () => {
    let service: SelectionEllipseService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let annulerRefaireServiceSpy: jasmine.SpyObj<AnnulerRefaireService>;
    let ellipseServiceSpy: jasmine.SpyObj<EllipseService>;
    let clipboardServiceSpy: jasmine.SpyObj<ClipboardService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave', 'drawImageDataOnBaseCtx', 'putImageData'], {
            canvas: {} as HTMLCanvasElement,
        });
        annulerRefaireServiceSpy = jasmine.createSpyObj('AnnulerRefaireService', ['addUndoAction']);
        clipboardServiceSpy = jasmine.createSpyObj('ClipboardService', ['copy']);
        ellipseServiceSpy = jasmine.createSpyObj('EllipseService', ['getCirclePos']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: AnnulerRefaireService, useValue: annulerRefaireServiceSpy },
                { provide: EllipseService, useValue: ellipseServiceSpy },
                { provide: ClipboardService, useValue: clipboardServiceSpy },
            ],
        });
        service = TestBed.inject(SelectionEllipseService);
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

    it('drawSelectedZone should change circlePos and call drawOutline, getCirclePos if shift is true', () => {
        const expectedResult = { x: 10, y: 10 } as Vec2;
        const drawOutlineSpy: jasmine.Spy<any> = spyOn<any>(service, 'drawOutline');
        const min = 10;

        service.shift = true;
        service.mouseDownCoord = { x: 10, y: 10 } as Vec2;
        service.lastMousePos = { x: 20, y: 20 } as Vec2;
        ellipseServiceSpy.min = min as number;
        ellipseServiceSpy.getCirclePos.and.callFake(() => {
            return { x: 10, y: 10 };
        });
        service.drawSelectedZone();
        expect(ellipseServiceSpy.getCirclePos).toHaveBeenCalledWith(service.lastMousePos, service.mouseDownCoord);
        expect(drawOutlineSpy).toHaveBeenCalledWith(expectedResult, expectedResult);
    });

    it('drawSelectedZone should call drawOutline if shift is false', () => {
        const expectedResultPosition = { x: 15, y: 15 } as Vec2;
        const expectedResultDimensions = { x: 5, y: 5 } as Vec2;
        const drawOutlineSpy: jasmine.Spy<any> = spyOn<any>(service, 'drawOutline');

        service.shift = false;
        service.mouseDownCoord = { x: 10, y: 10 } as Vec2;
        service.lastMousePos = { x: 20, y: 20 } as Vec2;

        service.drawSelectedZone();
        expect(drawOutlineSpy).toHaveBeenCalledWith(expectedResultPosition, expectedResultDimensions);
    });

    it('drawOutline should call beginPath, stroke and ellipse', () => {
        const beginPathSpy = spyOn<any>(previewCtxStub, 'beginPath').and.stub();
        const strokeSpy = spyOn<any>(previewCtxStub, 'stroke').and.stub();
        const ellipseSpy = spyOn<any>(previewCtxStub, 'ellipse').and.stub();
        const position = { x: 10, y: 10 } as Vec2;
        const dimensions = { x: 100, y: 100 } as Vec2;
        service.drawOutline(position, dimensions);

        expect(beginPathSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
        expect(ellipseSpy).toHaveBeenCalledWith(position.x, position.y, dimensions.x, dimensions.y, 0, 0, 2 * Math.PI);
    });

    it('drawEllipseOrCircle should change imageDataInitialPosition and imageDataDimension if shift is true', () => {
        const circlePos = { x: 10, y: 10 } as Vec2;
        const expectedResultPosition = { x: 5, y: 5 } as Vec2;
        const expectedResultDimensions = { x: 10, y: 10 } as Vec2;
        const min = 5;

        service.imageDataDimension = { x: 10, y: 10 };
        service.shift = true;
        service.circlePos = circlePos;
        ellipseServiceSpy.min = min;
        service.drawEllipseOrCircle();
        expect(service.imageDataInitialPosition).toEqual(expectedResultPosition);
        expect(service.imageDataInitialDimension).toEqual(expectedResultDimensions);
    });

    it('drawEllipseOrCircle should change imageDataInitialPosition and imageDataDimension if shift is false', () => {
        const lastMousePos = { x: 20, y: 20 } as Vec2;
        const mouseDownCoord = { x: 5, y: 5 } as Vec2;
        const expectedResultDimensions = { x: 15, y: 15 } as Vec2;

        service.shift = false;
        service.lastMousePos = lastMousePos;
        service.mouseDownCoord = mouseDownCoord;
        service.drawEllipseOrCircle();

        expect(service.imageDataInitialPosition).toEqual(mouseDownCoord);
        expect(service.imageDataInitialDimension).toEqual(expectedResultDimensions);
    });

    it('makeInvisible should change imageData.data to white or black', () => {
        const dimensions = { x: 10, y: 10 } as Vec2;
        const testingPositions = { x: 5, y: 5 } as Vec2;
        const fullDimensions = 10;

        baseCtxStub.fillStyle = '#ffffff';
        baseCtxStub.fillRect(1, 1, fullDimensions, fullDimensions);
        const imageData = baseCtxStub.getImageData(1, 1, fullDimensions, fullDimensions);
        const i = testingPositions.x * PIXEL_SIZE + testingPositions.y * PIXEL_SIZE * dimensions.x;
        imageData.data[i + RED] = imageData.data[i + GREEN] = imageData.data[i + BLUE] = imageData.data[i + OPACITY] = 0;

        expect(service.makeInvisible(imageData, dimensions).data[OPACITY]).toEqual(0);
        expect(service.makeInvisible(imageData, dimensions).data[i]).toEqual(WHITE);
    });

    it(' selectImage should call drawEllipseOrCircle, makeInvisible, and putImageData', () => {
        const drawEllipseOrCircleSpy = spyOn<any>(service, 'drawEllipseOrCircle').and.stub();
        const makeInvisibleSpy = spyOn<any>(service, 'makeInvisible').and.stub();
        const putImageDataSpy = spyOn<any>(previewCtxStub, 'putImageData').and.stub();
        spyOn<any>(baseCtxStub, 'getImageData').and.stub();
        spyOn<any>(baseCtxStub, 'ellipse').and.stub();
        service.selectImage();
        expect(drawEllipseOrCircleSpy).toHaveBeenCalled();
        expect(makeInvisibleSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it(' isInside should retrun true if the mouse is within the imagaData', () => {
        service.mouseDownCoord = { x: 5, y: 5 } as Vec2;
        service.imageDataPosition = { x: 0, y: 0 } as Vec2;
        service.imageDataDimension = { x: 10, y: 10 } as Vec2;
        expect(service.isInside()).toEqual(true);
    });

    it(' isInside should retrun false if the mouse is not within the imagaData', () => {
        service.mouseDownCoord = { x: 0, y: 0 } as Vec2;
        service.imageDataPosition = { x: 5, y: 5 } as Vec2;
        service.imageDataDimension = { x: 10, y: 10 } as Vec2;
        expect(service.isInside()).toEqual(false);
    });

    it(' confirmation should change the last action done if it wasnt an ActionPaste', () => {
        spyOn<any>(service, 'lastActionIsPaste').and.stub().and.returnValue(false);
        service.imageDataInitialPosition = { x: 10, y: 10 };
        service.flipX = true;
        annulerRefaireServiceSpy.undoActions.push({ position: { x: 0, y: 0 } } as ActionPaste);
        service.imageDataPosition.x = service.imageDataPosition.y = 2;
        service.confirmation(true);
        expect(service.flipX).toBeFalse();
    });

    it(' confirmation should change the last action done if it was an ActionPaste', () => {
        spyOn<any>(service, 'lastActionIsPaste').and.stub().and.returnValue(true);
        annulerRefaireServiceSpy.undoActions.push({ position: { x: 0, y: 0 } } as ActionPaste);
        service.imageDataPosition.x = service.imageDataPosition.y = 2;
        service.confirmation();
        expect((annulerRefaireServiceSpy.undoActions[0] as ActionPaste).position).toEqual({ x: 2, y: 2 } as Vec2);
    });

    it(' confirmation should call drawImageDataOnBaseCtx but not addUndoAction', () => {
        spyOn<any>(service, 'lastActionIsPaste').and.stub().and.returnValue(false);
        service.imageDataInitialPosition = { x: 10, y: 10 };
        service.imageDataPosition = { x: 10, y: 10 };
        service.confirmation(false);
        expect(drawingServiceSpy.drawImageDataOnBaseCtx).toHaveBeenCalled();
        expect(annulerRefaireServiceSpy.addUndoAction).not.toHaveBeenCalled();
    });

    it(' getCurrentToolString should return selectionEllipse', () => {
        expect(service.getCurrentToolString()).toEqual('selectionEllipse');
    });

    it(" copy should call clipboardService's copy", () => {
        clipboardServiceSpy.copy.and.stub();
        service.copy();
        expect(clipboardServiceSpy.copy).toHaveBeenCalled();
    });
});

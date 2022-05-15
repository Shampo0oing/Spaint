import { TestBed } from '@angular/core/testing';
import { ActionPaste } from '@app/classes/Actions/action-paste';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DISTANCE_20PX, SelectPos } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
// tslint:disable: no-relative-imports
import { LineService } from '../line/line.service';
import { MagnetismService } from '../magnetism/magnetism.service';
import { ClipboardService } from './clipboard.service';
import { SelectionLassoService } from './selection-lasso.service';

const expectedResult = 10;
// tslint:disable: no-empty
// tslint:disable: no-magic-numbers
// tslint:disable:no-string-literal
// tslint:disable:no-any
describe('SelectionLassoService', () => {
    let service: SelectionLassoService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let annulerRefaireServiceSpy: jasmine.SpyObj<AnnulerRefaireService>;
    let magnetismServiceSpy: jasmine.SpyObj<MagnetismService>;
    let lineServiceSpy: jasmine.SpyObj<LineService>;
    let clipboardServiceSpy: jasmine.SpyObj<ClipboardService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let confirmationSpy: jasmine.Spy<any>;
    let getPositionFromMouseSpy: jasmine.Spy<any>;
    let drawLinesSpy: jasmine.Spy<any>;
    let mouseEvent: MouseEvent;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'drawImageDataOnBaseCtx', 'makeInvisible'], {
            canvas: {} as HTMLCanvasElement,
        });
        annulerRefaireServiceSpy = jasmine.createSpyObj('AnnulerRefaireService', ['addUndoAction', 'removeActionsStubs']);
        clipboardServiceSpy = jasmine.createSpyObj('clipboardServiceSpy', ['copy', 'isEmpty']);
        lineServiceSpy = jasmine.createSpyObj('LineService', ['drawWithoutStroke', 'calculateDistance']);
        magnetismServiceSpy = jasmine.createSpyObj('magnetismServiceSpy', ['affectWithMagnestism']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: AnnulerRefaireService, useValue: annulerRefaireServiceSpy },
                { provide: LineService, useValue: lineServiceSpy },
                { provide: ClipboardService, useValue: clipboardServiceSpy },
                { provide: MagnetismService, useValue: magnetismServiceSpy },
            ],
        });
        service = TestBed.inject(SelectionLassoService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        // Configuration du spy du service
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        spyOn<any>(previewCtxStub, 'putImageData').and.stub();
        spyOn<any>(baseCtxStub, 'putImageData').and.stub();
        annulerRefaireServiceSpy.undoActions = [];
        annulerRefaireServiceSpy.redoActions = [];
        confirmationSpy = spyOn<any>(service, 'confirmation').and.stub();
        getPositionFromMouseSpy = spyOn<any>(service, 'getPositionFromMouse').and.callFake((event: MouseEvent) => {
            return { x: event.offsetX, y: event.offsetY };
        });
        mouseEvent = { offsetX: 0, offsetY: 0 } as MouseEvent;
        drawLinesSpy = spyOn<any>(service, 'drawLines').and.stub();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' paste should do noting if the clipboard is empty', () => {
        clipboardServiceSpy.isEmpty.and.returnValue(true);
        service.paste();

        expect(annulerRefaireServiceSpy.addUndoAction).not.toHaveBeenCalled();
    });

    it(' paste call addUndoAction if the clipboard is not empty', () => {
        clipboardServiceSpy.isEmpty.and.returnValue(false);
        const drawLineDashSpy = spyOn<any>(service, 'drawLineDash').and.stub();
        const changePathData2Spy = spyOn<any>(service, 'changePathData2').and.stub();
        service.paste();
        expect(annulerRefaireServiceSpy.addUndoAction).toHaveBeenCalled();
        expect(drawLineDashSpy).toHaveBeenCalled();
        expect(changePathData2Spy).toHaveBeenCalled();
    });

    it(' paste call confirmation if an image data was selected', () => {
        drawingServiceSpy.selected = true;
        clipboardServiceSpy.isEmpty.and.returnValue(false);
        const drawLineDashSpy = spyOn<any>(service, 'drawLineDash').and.stub();
        const changePathData2Spy = spyOn<any>(service, 'changePathData2').and.stub();
        service.paste();
        expect(confirmationSpy).toHaveBeenCalled();
        expect(drawLineDashSpy).toHaveBeenCalled();
        expect(changePathData2Spy).toHaveBeenCalled();
    });

    it(" confirmation should change the last action's position if it was an ActionPaste", () => {
        confirmationSpy.and.callThrough();
        service.imageDataPosition = { x: expectedResult, y: expectedResult } as Vec2;
        spyOn<any>(service, 'lastActionIsPaste').and.returnValue(true);
        annulerRefaireServiceSpy.undoActions = [{ position: { x: 0, y: 0 } as Vec2 } as ActionPaste];
        service.confirmation();
        expect((annulerRefaireServiceSpy.undoActions[0] as ActionPaste).position).toEqual({ x: expectedResult, y: expectedResult } as Vec2);
    });

    it(' confirmation should call addUndoAction if lastActionIsPaste is false', () => {
        confirmationSpy.and.callThrough();
        spyOn<any>(service, 'lastActionIsPaste').and.returnValue(false);
        service.confirmation();
        expect(annulerRefaireServiceSpy.addUndoAction).toHaveBeenCalled();
    });

    it(' confirmation should not call addUndoAction if lastActionIsPaste and paste are false and the initialPosition is the same as the current position', () => {
        service.imageDataInitialPosition = service.imageDataPosition = { x: 0, y: 0 };
        confirmationSpy.and.callThrough();
        spyOn<any>(service, 'lastActionIsPaste').and.returnValue(false);
        service.confirmation(false);
        expect(annulerRefaireServiceSpy.addUndoAction).not.toHaveBeenCalled();
    });

    it(" copy should call clipboardService's copy", () => {
        service.copy();
        expect(clipboardServiceSpy.copy).toHaveBeenCalled();
    });

    it(' drawLineDash should call moveTo and lineTo the right amount of times', () => {
        const moveToSpy = spyOn<any>(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn<any>(baseCtxStub, 'lineTo').and.stub();
        const changePathData2Spy = spyOn(service, 'changePathData2').and.stub();
        service['pathData'] = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service['pathDataPercent'] = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service.drawingLine = false;
        service.drawLineDash(baseCtxStub);
        expect(changePathData2Spy).toHaveBeenCalled();
        expect(moveToSpy).toHaveBeenCalledTimes(1);
        expect(lineToSpy).toHaveBeenCalledTimes(3);
    });

    it(' drawLineDash should call moveTo and lineTo the right amount of times and not call changePathData2 if drawingLine is true', () => {
        const moveToSpy = spyOn<any>(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn<any>(baseCtxStub, 'lineTo').and.stub();
        const changePathData2Spy = spyOn(service, 'changePathData2').and.stub();
        service['pathData'] = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service['pathDataPercent'] = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service.drawingLine = true;
        service.drawLineDash(baseCtxStub);
        expect(changePathData2Spy).not.toHaveBeenCalled();
        expect(moveToSpy).toHaveBeenCalledTimes(1);
        expect(lineToSpy).toHaveBeenCalledTimes(3);
    });

    it(' drawLineDash should not call moveTo and lineTo if the length of pathData is 0', () => {
        const moveToSpy = spyOn<any>(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn<any>(baseCtxStub, 'lineTo').and.stub();
        service['pathData'] = [];
        service.drawLineDash(baseCtxStub);
        expect(moveToSpy).not.toHaveBeenCalled();
        expect(lineToSpy).not.toHaveBeenCalled();
    });

    it(' drawingSetup should call clearCanvas', () => {
        service.drawingSetup(previewCtxStub);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' drawingSetup should change the strokeStyle if intersect is true', () => {
        service['intersect'] = true;
        service.drawingSetup(previewCtxStub);
        expect(previewCtxStub.strokeStyle).toEqual('#ff0000');
    });

    it(' drawLines should call drawingSetup and drawWithoutStroke if drawingLine is true', () => {
        drawLinesSpy.and.callThrough();
        service.drawingLine = true;
        const drawingSetupSpy = spyOn<any>(service, 'drawingSetup').and.stub();
        service.drawLines();
        expect(drawingSetupSpy).toHaveBeenCalled();
        expect(lineServiceSpy.drawWithoutStroke).toHaveBeenCalled();
    });

    it(' drawLines should not call drawingSetup and drawWithoutStroke if drawingLine is false', () => {
        drawLinesSpy.and.callThrough();
        service.drawingLine = false;
        const drawingSetupSpy = spyOn<any>(service, 'drawingSetup').and.stub();
        service.drawLines();
        expect(drawingSetupSpy).not.toHaveBeenCalled();
        expect(lineServiceSpy.drawWithoutStroke).not.toHaveBeenCalled();
    });

    it(' changePathData should substact the imageDataInitialPosition from each point in the pathData', () => {
        service['pathData'] = [
            { x: expectedResult * 2, y: expectedResult * 2 },
            { x: expectedResult, y: expectedResult },
        ];
        service.imageDataInitialPosition = { x: expectedResult, y: expectedResult };
        service.changePathData();
        expect(service['pathData'][0]).toEqual({ x: expectedResult, y: expectedResult });
        expect(service['pathData'][1]).toEqual({ x: 0, y: 0 });
    });

    it(' changePathData2 should update pathData', () => {
        service['pathData'] = [{ x: 0, y: 0 }];
        service.boxResizerPosition = { x: 1, y: 1 };
        service.boxResizerDimension = { x: 1, y: 1 };
        service['pathDataPercent'] = [{ x: 0, y: 0 }];
        service.flipX = true;
        service.flipY = true;
        service.changePathData2();
        expect(service['pathData']).toEqual([{ x: 2, y: 2 }]);
    });

    it(' changePathData2 should update pathData', () => {
        service['pathData'] = [{ x: 0, y: 0 }];
        service.boxResizerPosition = { x: 1, y: 1 };
        service.boxResizerDimension = { x: 1, y: 1 };
        service['pathDataPercent'] = [{ x: 0, y: 0 }];
        service.flipX = false;
        service.flipY = false;
        service.changePathData2();
        expect(service['pathData']).toEqual([{ x: 1, y: 1 }]);
    });

    it(' selectImage should call clearCanvas, changePathData and selectedImage', () => {
        service['pathData'] = [
            { x: 0, y: 0 },
            { x: expectedResult, y: expectedResult },
        ];
        const changePathDataSpy = spyOn<any>(service, 'changePathData').and.stub();
        const selectedImageSpy = spyOn<any>(service, 'selectedImage').and.stub();
        service.selectImage();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(changePathDataSpy).toHaveBeenCalled();
        expect(selectedImageSpy).toHaveBeenCalled();
    });

    it(' selectedImage should call drawLineDash', () => {
        const drawLineDashSpy = spyOn<any>(service, 'drawLineDash').and.stub();
        service['pathData'] = [{ x: 1, y: 1 }];
        service.selectedImage();
        expect(drawLineDashSpy).toHaveBeenCalled();
    });

    it('percentagePathData should push points of pathData into pathDataPercent', () => {
        service['pathData'] = [{ x: 1, y: 1 }];
        service.imageDataInitialDimension = { x: 1, y: 1 };
        service.percentagePathData();
        expect(service['pathDataPercent']).toEqual([{ x: 1, y: 1 }]);
    });

    it(' onClick should not call getPositionFromMouse if selected is true', () => {
        drawingServiceSpy.selected = true;
        service.onClick(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
    });

    it(' onClick should push a new point if selected is false and pathData.length === 0', () => {
        drawingServiceSpy.selected = false;
        service.onClick(mouseEvent);
        expect(service['pathData'].length).toEqual(1);
    });

    it(' onClick should call selectImage and addUndoAction if selected is false, pathData.length !== 0 and the new point can be the last', () => {
        drawingServiceSpy.selected = false;
        service['pathData'] = [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ];
        lineServiceSpy.calculateDistance.and.returnValue(0);
        service['intersect'] = false;
        service.drawingLine = true;
        const selectImageSpy = spyOn<any>(service, 'selectImage').and.stub();
        service.onClick(mouseEvent);
        expect(selectImageSpy).toHaveBeenCalled();
        expect(annulerRefaireServiceSpy.addUndoAction).toHaveBeenCalled();
    });

    it(' onClick should call drawLines and add the new point to pathData if selected is false, pathData.length !== 0 and the new point cannot be the last', () => {
        drawingServiceSpy.selected = false;
        service['pathData'] = [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ];
        lineServiceSpy.calculateDistance.and.returnValue(DISTANCE_20PX + 1);
        service['intersect'] = false;
        service.drawingLine = true;
        service.onClick(mouseEvent);
        expect(drawLinesSpy).toHaveBeenCalled();
        expect(service['pathData'].length).toEqual(4);
    });

    it(' onClick should call drawLines but not add the new point to pathData if selected is false, pathData.length !== 0 and the new point cannot be the last but it intersects', () => {
        drawingServiceSpy.selected = false;
        service['pathData'] = [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ];
        lineServiceSpy.calculateDistance.and.returnValue(DISTANCE_20PX + 1);
        service['intersect'] = true;
        service.drawingLine = true;
        service.onClick(mouseEvent);
        expect(drawLinesSpy).toHaveBeenCalled();
        expect(service['pathData'].length).toEqual(3);
    });

    it(' onMouseMove should not call drawLines or verificationOutside if mouseDown is false', () => {
        drawingServiceSpy.mouseDown = false;
        const verificationOutsideSpy = spyOn<any>(service, 'verificationOutside').and.stub();
        service.onMouseMove(mouseEvent);
        expect(drawLinesSpy).not.toHaveBeenCalled();
        expect(verificationOutsideSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLines or verificationOutside if mouseDown is true, drawingLine and insideSelected are false', () => {
        drawingServiceSpy.mouseDown = true;
        service.drawingLine = service.insideSelected = false;
        const verificationOutsideSpy = spyOn<any>(service, 'verificationOutside').and.stub();
        service.onMouseMove(mouseEvent);
        expect(drawLinesSpy).not.toHaveBeenCalled();
        expect(verificationOutsideSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLines and checkIfIntersect if mouseDown and drawingLine are true', () => {
        drawingServiceSpy.mouseDown = service.drawingLine = true;
        service.onMouseMove(mouseEvent);
        expect(drawLinesSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call verificationOutside if mouseDown and insideSelected are true and drawingLine is false', () => {
        drawingServiceSpy.mouseDown = true;
        service.drawingLine = false;
        service.insideSelected = true;
        service.imageDataPositionClicked = service.mouseDownCoord = { x: 0, y: 0 };
        const verificationOutsideSpy = spyOn<any>(service, 'verificationOutside').and.stub();
        service.onMouseMove(mouseEvent);
        expect(verificationOutsideSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call affectWithMagnestism if mouseDown, insideSelected and useMagnetism are true and drawingLine is false', () => {
        drawingServiceSpy.mouseDown = true;
        drawingServiceSpy.useMagnetism = true;
        service.drawingLine = false;
        service.insideSelected = true;
        magnetismServiceSpy.affectWithMagnestism.and.returnValue({ x: 0, y: 0 });
        service.imageDataPositionClicked = service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseMove(mouseEvent);
        expect(magnetismServiceSpy.affectWithMagnestism).toHaveBeenCalled();
    });

    it(' onMouseMove should call resizeDrawing if status isnt 0', () => {
        drawingServiceSpy.mouseDown = true;
        service.drawingLine = false;
        service.insideSelected = false;
        service.status = 1;
        const resizeDrawingSpy = spyOn(service, 'resizeDrawing').and.stub();
        service.onMouseMove(mouseEvent);
        expect(resizeDrawingSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLineDash if mouseDown is false or if drawingLine is true', () => {
        drawingServiceSpy.mouseDown = false;
        service.drawingLine = true;
        const drawLineDashSpy = spyOn<any>(service, 'drawLineDash').and.stub();
        service.onMouseUp();
        expect(drawLineDashSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should call drawLineDash if mouseDown is true, drawingLine is false and selected is true', () => {
        drawingServiceSpy.mouseDown = true;
        service.drawingLine = false;
        drawingServiceSpy.selected = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.lastMousePos = { x: 1, y: 1 };
        service.imageDataPosition = { x: 10, y: 10 };
        service.imageDataDimension = { x: 10, y: 10 };
        spyOn(baseCtxStub, 'getImageData').and.returnValue({} as ImageData);
        const drawLineDashSpy = spyOn<any>(service, 'drawLineDash').and.stub();
        service.onMouseUp();
        expect(drawLineDashSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLineDash if mouseDown is trueand drawingLine is false but selected is true', () => {
        drawingServiceSpy.mouseDown = true;
        service.drawingLine = false;
        drawingServiceSpy.selected = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.lastMousePos = { x: 1, y: 1 };
        const drawLineDashSpy = spyOn<any>(service, 'drawLineDash').and.stub();
        service.onMouseUp();
        expect(drawLineDashSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should set mouseDown as false', () => {
        drawingServiceSpy.mouseDown = true;
        service.drawingLine = false;
        service.mouseDownCoord = service.lastMousePos = { x: 0, y: 0 };
        service.onMouseUp();
        expect(drawingServiceSpy.mouseDown).toEqual(false);
    });

    it(' onMouse up should call drawLineDash if status isnt 0', () => {
        drawingServiceSpy.mouseDown = true;
        service.drawingLine = false;
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = { x: 10, y: 10 };
        service.imageDataPosition = { x: 10, y: 10 };
        service.imageDataDimension = { x: 10, y: 10 };
        service.status = 1;
        service.onMouseUp();
        expect(drawingServiceSpy.mouseDown).toBeFalse();
    });

    it(' onMouse up should call drawLineDash if status isnt 0 and invert flipX and flipY if imageDataDimension is negative', () => {
        drawingServiceSpy.mouseDown = true;
        service.drawingLine = false;
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = { x: 10, y: 10 };
        service.imageDataPosition = { x: 10, y: 10 };
        service.imageDataDimension = { x: -10, y: -10 };
        service.status = 1;
        service.onMouseUp();
        expect(drawingServiceSpy.mouseDown).toBeFalse();
    });

    it(' escapeDown should call clearCanvas and clearPath if selected is false', () => {
        drawingServiceSpy.selected = false;
        const clearPathSpy = spyOn<any>(service, 'clearPath').and.stub();
        service.escapeDown();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it(' escapeDown should call removeActionsStubs and confirmOnBase if selected is true, imageDataInitialPosition is equal to imageDataPosition and the inatialDimension is equal to the finalDimension', () => {
        service.status = SelectPos.NONE;
        drawingServiceSpy.selected = true;
        service.imageDataPosition = service.imageDataInitialPosition = service.imageDataDimension = { x: 0, y: 0 };
        service.escapeDown();
        expect(annulerRefaireServiceSpy.removeActionsStubs).toHaveBeenCalled();
        expect(drawingServiceSpy.drawImageDataOnBaseCtx).toHaveBeenCalled();
    });

    it(' escapeDown should call confirmation if selected is true and imageDataInitialPosition is not equal to imageDataPosition or the inatialDimension is not equal to the finalDimension', () => {
        service.status = SelectPos.NONE;
        drawingServiceSpy.selected = true;
        service.imageDataPosition = { x: 1, y: 1 };
        service.imageDataInitialPosition = { x: 0, y: 0 };
        service.escapeDown();
        expect(confirmationSpy).toHaveBeenCalled();
    });

    it(' escapeDown should do nothing', () => {
        service.status = SelectPos.MIDDLERIGHT;
        const clearPathSpy = spyOn<any>(service, 'clearPath').and.stub();
        drawingServiceSpy.selected = true;
        service.escapeDown();
        expect(confirmationSpy).not.toHaveBeenCalled();
        expect(clearPathSpy).not.toHaveBeenCalled();
        expect(annulerRefaireServiceSpy.removeActionsStubs).not.toHaveBeenCalled();
        expect(drawingServiceSpy.drawImageDataOnBaseCtx).not.toHaveBeenCalled();
    });

    it(' shiftDown should call drawLines if drawingLine is true and mouseDownCoord is different from the last point in pathData', () => {
        service.drawingLine = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['pathData'] = [{ x: 1, y: 1 }];
        service.shiftDown();
        expect(drawLinesSpy).toHaveBeenCalled();
    });

    it(' shiftDown should not call drawLines if drawingLine is false', () => {
        service.drawingLine = false;
        service.shiftDown();
        expect(drawLinesSpy).not.toHaveBeenCalled();
    });

    it(' shiftDown should not call drawLines if mouseDownCoord is the same as the last point in pathData', () => {
        service.drawingLine = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['pathData'] = [{ x: 0, y: 0 }];
        service.shiftDown();
        expect(drawLinesSpy).not.toHaveBeenCalled();
    });

    it(' shiftDown should call resizeDrawing if status isnt equal to 0 and selected is true', () => {
        service.drawingLine = false;
        drawingServiceSpy.selected = true;
        service.status = 1;
        const resizeDrawingSpy = spyOn(service, 'resizeDrawing').and.stub();
        service.shiftDown();
        expect(resizeDrawingSpy).toHaveBeenCalled();
    });

    it(' shiftUp should call drawLines', () => {
        service.drawingLine = true;
        drawingServiceSpy.selected = true;
        service.status = 1;
        const resizeDrawingSpy = spyOn(service, 'resizeDrawing').and.stub();
        service.shiftUp();
        expect(resizeDrawingSpy).not.toHaveBeenCalled();
        expect(drawLinesSpy).toHaveBeenCalled();
    });

    it(' shiftUp should call resizeDrawing', () => {
        service.drawingLine = false;
        drawingServiceSpy.selected = true;
        service.status = 1;
        const resizeDrawingSpy = spyOn(service, 'resizeDrawing').and.stub();
        service.shiftUp();
        expect(resizeDrawingSpy).toHaveBeenCalled();
        expect(drawLinesSpy).not.toHaveBeenCalled();
    });

    it(' shift up should do nothing if drawingLine and selected are false', () => {
        service.drawingLine = false;
        drawingServiceSpy.selected = false;
        const resizeDrawingSpy = spyOn(service, 'resizeDrawing').and.stub();
        service.shiftUp();
        expect(resizeDrawingSpy).not.toHaveBeenCalled();
        expect(drawLinesSpy).not.toHaveBeenCalled();
    });

    it(' backspaceDown should call drawLines and pop if the length of pathData is more than 1', () => {
        service['pathData'] = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service.backspaceDown();
        expect(drawLinesSpy).toHaveBeenCalled();
        expect(service['pathData'].length).toEqual(1);
    });

    it(' backspaceDown should not call drawLines and pop if the length of pathData is 1 or less', () => {
        service['pathData'] = [{ x: 0, y: 0 }];
        service.backspaceDown();
        expect(drawLinesSpy).not.toHaveBeenCalled();
        expect(service['pathData'].length).toEqual(1);
    });

    it(' clearPath should empty pathData', () => {
        service['pathData'] = [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
        ];
        service.clearPath();
        expect(service['pathData'].length).toEqual(0);
    });

    it(' onKeyDown should call clearCanvas, drawLineDash, moveWithArrows and manageClipBoard if selected if true', () => {
        const event = { preventDefault: () => {} } as KeyboardEvent;
        const drawLineDashSpy = spyOn<any>(service, 'drawLineDash').and.stub();
        const moveWithArrowsSpy = spyOn<any>(service, 'moveWithArrows').and.stub();
        const manageClipBoardSpy = spyOn<any>(service, 'manageClipBoard').and.stub();
        drawingServiceSpy.selected = true;
        service.onKeyDown(event);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawLineDashSpy).toHaveBeenCalled();
        expect(moveWithArrowsSpy).toHaveBeenCalled();
        expect(manageClipBoardSpy).toHaveBeenCalled();
    });

    it(' onKeyDown should not call clearCanvas, drawLineDash, moveWithArrows and manageClipBoard if selected if false', () => {
        const event = { preventDefault: () => {} } as KeyboardEvent;
        const drawLineDashSpy = spyOn<any>(service, 'drawLineDash').and.stub();
        const moveWithArrowsSpy = spyOn<any>(service, 'moveWithArrows').and.stub();
        const manageClipBoardSpy = spyOn<any>(service, 'manageClipBoard').and.stub();
        drawingServiceSpy.selected = false;
        service.onKeyDown(event);
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineDashSpy).not.toHaveBeenCalled();
        expect(moveWithArrowsSpy).not.toHaveBeenCalled();
        expect(manageClipBoardSpy).not.toHaveBeenCalled();
    });

    it(' onKeyDown should not call drawlineDash if event.key is shift', () => {
        const event = { key: 'Shift', preventDefault: () => {} } as KeyboardEvent;
        const drawLineDashSpy = spyOn<any>(service, 'drawLineDash').and.stub();
        drawingServiceSpy.selected = true;
        service.onKeyDown(event);
        expect(drawLineDashSpy).not.toHaveBeenCalled();
    });

    it(' getCurrentToolString should return selectionLasso', () => {
        expect(service.getCurrentToolString()).toEqual('selectionLasso');
    });

    it('delete should call clearCanvas', () => {
        service.delete();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });
    // tslint:disable-next-line: max-file-line-count
});

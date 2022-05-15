import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActionPaste } from '@app/classes/Actions/action-paste';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
// tslint:disable-next-line: no-relative-imports
import { MagnetismService } from '../magnetism/magnetism.service';
import { SelectionService } from './selection.service';

// tslint:disable:no-string-literal
// tslint:disable:no-any
// tslint:disable:no-empty
// tslint:disable:no-magic-numbers
const RIGHT_SIDE_POSITION = { x: 1000, y: 1000 };
const LEFT_SIDE_POSITION = { x: -1000, y: -1000 };
const TESTING_WIDTH = 800;
const TESTING_HEIGHT = 800;

@Injectable({
    providedIn: 'root',
})
export class SelectionMock extends SelectionService {
    drawOutline(postion: Vec2, dimensions: Vec2): void {}
    selectImage(): void {}
    confirmation(): void {}
    getCurrentToolString(): string {
        return '';
    }
    drawSelectedZone(): void {}
    confirmOnBase(): void {}
    copy(): void {}
}

describe('SelectionService', () => {
    let service: SelectionMock;
    let magnetismService: MagnetismService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let annulerRefaireServiceSpy: jasmine.SpyObj<AnnulerRefaireService>;
    let drawSelectedZoneSpy: jasmine.Spy<any>;
    let confirmationSpy: jasmine.Spy<any>;
    let gestionDeplacementSpy: jasmine.Spy<any>;
    let deplacementSpy: jasmine.Spy<any>;
    let updatePreviewCanvasSpy: jasmine.Spy<any>;
    let verificationOutsideSpy: jasmine.Spy<any>;
    let affectWithMagnestismSpy: jasmine.Spy;
    let mouseEvent: MouseEvent;
    let isInsideSpy: jasmine.Spy;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'drawImageDataOnBaseCtx', 'changePositionAndDimensions'], {
            canvas: {} as HTMLCanvasElement,
        });
        annulerRefaireServiceSpy = jasmine.createSpyObj('AnnulerRefaireService', ['removeActionsStubs', 'addUndoAction']);
        // eventSpy = jasmine.createSpyObj('KeyboardEvent', ['preventDefault']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: AnnulerRefaireService, useValue: annulerRefaireServiceSpy },
            ],
        });
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(SelectionMock);
        magnetismService = TestBed.inject(MagnetismService);
        // clipboardService = TestBed.inject(ClipboardService);

        affectWithMagnestismSpy = spyOn(magnetismService, 'affectWithMagnestism').and.stub();
        drawSelectedZoneSpy = spyOn<any>(service, 'drawSelectedZone');
        updatePreviewCanvasSpy = spyOn<any>(service, 'updatePreviewCanvas').and.stub();
        verificationOutsideSpy = spyOn<any>(service, 'verificationOutside').and.stub();
        spyOn<any>(previewCtxStub, 'putImageData').and.stub();
        confirmationSpy = spyOn<any>(service, 'confirmation');
        gestionDeplacementSpy = spyOn<any>(service, 'gestionDeplacement').and.stub();
        deplacementSpy = spyOn<any>(service, 'deplacement').and.stub();
        service['drawingService'].canvas = ({ width: 300, height: 150 } as unknown) as HTMLCanvasElement;
        spyOn<any>(service, 'getPositionFromMouse').and.callFake((event: MouseEvent) => {
            return { x: event.offsetX, y: event.offsetY };
        });
        // Configuration du spy du service
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service.fired = false;

        jasmine.clock().install();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isInside should return true if mouse is inside', () => {
        service.mouseDownCoord = { x: 10, y: 10 };
        service.imageDataPosition = { x: 0, y: 0 };
        service.imageDataDimension = { x: 20, y: 20 };
        expect(service.isInside()).toBeTrue();
    });

    it('isInside should return false if mouse is outside', () => {
        service.mouseDownCoord = { x: 30, y: 30 };
        service.imageDataPosition = { x: 0, y: 0 };
        service.imageDataDimension = { x: 20, y: 20 };
        expect(service.isInside()).toBeFalse();
    });

    it('when mouse is down, updatePreviewCanvas should call clearCanvas and drawSelectedZone', () => {
        drawingServiceSpy.mouseDown = true;
        updatePreviewCanvasSpy.and.callThrough();
        service.updatePreviewCanvas();
        expect(drawSelectedZoneSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('when mouse is not down, updatePreviewCanvas should not call clearCanvas and DrawSelectedZone', () => {
        drawingServiceSpy.mouseDown = false;
        updatePreviewCanvasSpy.and.callThrough();
        service.updatePreviewCanvas();
        expect(drawSelectedZoneSpy).not.toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('when selected is true, clickedElseWhere should call confirmation and put the fired and arrows booleans to false', () => {
        drawingServiceSpy.selected = true;
        service.clickedElseWhere();
        expect(confirmationSpy).toHaveBeenCalled();
        expect(service.fired).toEqual(false);
        expect(service.arrowLeft).toEqual(false);
    });

    it('when selected is false, clickedElseWhere should not call confirmation and the fired and arrows booleans must not change', () => {
        drawingServiceSpy.selected = false;
        service.arrowRight = true;
        service.fired = true;
        service.clickedElseWhere();
        expect(confirmationSpy).not.toHaveBeenCalled();
        expect(service.fired).toEqual(true);
        expect(service.arrowRight).toEqual(true);
    });

    it('verificationOutside should change the height and width of imageDataPosition if its higher then the canvas dimensions', () => {
        service.imageDataPosition = RIGHT_SIDE_POSITION;
        drawingServiceSpy.canvas.width = TESTING_WIDTH;
        drawingServiceSpy.canvas.height = TESTING_HEIGHT;
        verificationOutsideSpy.and.callThrough();
        service.verificationOutside();

        expect(service.imageDataPosition.x).toEqual(TESTING_WIDTH);
        expect(service.imageDataPosition.y).toEqual(TESTING_HEIGHT);
    });

    it('verificationOutside should change the height and width of imageDataPosition if its lower then minus the canvas dimensions', () => {
        service.imageDataPosition = LEFT_SIDE_POSITION;
        service.imageDataDimension = { x: TESTING_WIDTH, y: TESTING_WIDTH };
        verificationOutsideSpy.and.callThrough();
        service.verificationOutside();

        expect(service.imageDataPosition.x).toEqual(-TESTING_WIDTH);
        expect(service.imageDataPosition.y).toEqual(-TESTING_HEIGHT);
    });

    it('verificationLastMousePos should set lastMousePos', () => {
        service.lastMousePos = { x: 500, y: 500 };
        drawingServiceSpy.canvas.width = 300;
        drawingServiceSpy.canvas.height = 300;
        service.verificationLastMousePos();
        expect(service.lastMousePos).toEqual({ x: 300, y: 300 });
    });

    it('verificationLastMousePos should set lastMousePos to 0 if it was previously lower than 0', () => {
        service.lastMousePos = { x: -5, y: -5 };
        service.verificationLastMousePos();
        expect(service.lastMousePos).toEqual({ x: 0, y: 0 });
    });

    it('onMouseMove should do nothing if mouseDown is false', () => {
        mouseEvent = { button: 1 } as MouseEvent;
        const dragAndDropSpy = spyOn(service, 'dragAndDrop').and.stub();
        service.onMouseMove(mouseEvent);
        expect(dragAndDropSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should call resizeDrawing is status is not 0', () => {
        drawingServiceSpy.mouseDown = true;
        const dragAndDropSpy = spyOn(service, 'dragAndDrop').and.stub();
        const resizeDrawingSpy = spyOn(service, 'resizeDrawing').and.stub();
        service.status = 1;
        service.onMouseMove(mouseEvent);
        expect(dragAndDropSpy).toHaveBeenCalled();
        expect(resizeDrawingSpy).toHaveBeenCalled();
    });

    it('onMouseMove should not call resizeDrawing if status is equal to 0', () => {
        drawingServiceSpy.mouseDown = true;
        service.status = 0;
        const resizeDrawingSpy = spyOn(service, 'resizeDrawing').and.stub();
        service.onMouseMove(mouseEvent);
        expect(resizeDrawingSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should call drawImageDataOnBaseCtx and removeActionsStubs if position and dimensions of image change', () => {
        mouseEvent = { button: 0 } as MouseEvent;
        service.imageDataPosition = { x: 10, y: 10 };
        service.imageDataDimension = { x: 10, y: 10 };
        service.imageDataInitialPosition = { x: 10, y: 10 };
        service.imageDataInitialDimension = { x: 10, y: 10 };
        isInsideSpy = spyOn(service, 'isInside');
        isInsideSpy.and.returnValue(false);
        drawingServiceSpy.selected = true;
        service.onMouseDown(mouseEvent);
        expect(drawingServiceSpy.drawImageDataOnBaseCtx).toHaveBeenCalled();
    });

    it('onMouseDown should set insideSelected to true if isInside is true', () => {
        mouseEvent = { button: 0 } as MouseEvent;
        service.imageDataPosition = { x: 10, y: 10 };
        service.imageDataDimension = { x: 10, y: 10 };
        service.imageDataInitialPosition = { x: 10, y: 10 };
        service.imageDataInitialDimension = { x: 10, y: 10 };
        isInsideSpy = spyOn(service, 'isInside');
        isInsideSpy.and.returnValue(true);
        drawingServiceSpy.selected = true;
        service.onMouseDown(mouseEvent);
        expect(drawingServiceSpy.drawImageDataOnBaseCtx).not.toHaveBeenCalled();
    });

    it('onMouseDown should set insideSelected to true if isInside is true', () => {
        mouseEvent = { button: 0 } as MouseEvent;
        service.imageDataPosition = { x: 20, y: 20 };
        service.imageDataDimension = { x: 20, y: 20 };
        service.imageDataInitialPosition = { x: 10, y: 10 };
        service.imageDataInitialDimension = { x: 10, y: 10 };
        isInsideSpy = spyOn(service, 'isInside');
        isInsideSpy.and.returnValue(false);
        service.status = 0;
        drawingServiceSpy.selected = true;
        service.onMouseDown(mouseEvent);
        expect(confirmationSpy).toHaveBeenCalled();
    });

    it('onMouseDown should go into else if status = 0', () => {
        mouseEvent = { button: 0 } as MouseEvent;
        drawingServiceSpy.selected = true;
        isInsideSpy = spyOn(service, 'isInside');
        isInsideSpy.and.returnValue(false);
        service.status = 1;
        service.onMouseDown(mouseEvent);
        expect(isInsideSpy).toHaveBeenCalled();
    });

    it('onMouseDown should do nothing if mouseDown is false', () => {
        mouseEvent = { button: 1 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(confirmationSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should do nothing if selected is false', () => {
        mouseEvent = { button: 0 } as MouseEvent;
        drawingServiceSpy.selected = false;
        service.onMouseDown(mouseEvent);
        expect(confirmationSpy).not.toHaveBeenCalled();
    });

    it('setStatus should set status', () => {
        const status = 5;
        service.setStatus(status);
        expect(service.status).toEqual(status);
    });

    it('resizeDrawing should call restore', () => {
        service.imageDataPosition = { x: 100, y: 100 };
        service.imageDataDimension = { x: 100, y: 100 };
        service.lastMousePos = { x: 50, y: 50 };
        drawingServiceSpy.changePositionAndDimensions.and.returnValue({ x: 50, y: 50 });
        service.status = 2;
        service.shift = true;
        service.resizeDrawing();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' resizeDrawing shift = true and imageDataDimension not = 0', () => {
        service.imageDataPosition = { x: 100, y: 100 };
        service.imageDataDimension = { x: -100, y: -100 };
        service.lastMousePos = { x: 50, y: 50 };
        service.status = 9;
        service.shift = true;
        drawingServiceSpy.changePositionAndDimensions.and.returnValue({ x: 10, y: 10 });
        service.resizeDrawing();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' resizeDrawing shift = false and imageDataDimension = 0', () => {
        service.imageDataPosition = { x: 100, y: 100 };
        service.imageDataDimension = { x: -100, y: -100 };
        service.lastMousePos = { x: 50, y: 50 };
        service.status = 9;
        service.shift = false;
        drawingServiceSpy.changePositionAndDimensions.and.returnValue({ x: 10, y: 10 });
        service.resizeDrawing();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' resizeDrawing shift = false and imageDataDimension = 0', () => {
        service.imageDataPosition = { x: 100, y: 100 };
        service.imageDataDimension = { x: 0, y: 0 };
        service.lastMousePos = { x: 50, y: 50 };
        service.status = 0;
        service.shift = false;
        drawingServiceSpy.changePositionAndDimensions.and.returnValue({ x: 10, y: 10 });
        service.resizeDrawing();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('dragAndDrop should call verificationLastMousePos and updatePreviewCanvas if drawing.selected is false', () => {
        drawingServiceSpy.selected = false;
        const verificationLastMousePosSpy = spyOn(service, 'verificationLastMousePos').and.stub();
        service.dragAndDrop();
        expect(verificationLastMousePosSpy).toHaveBeenCalled();
        expect(updatePreviewCanvasSpy).toHaveBeenCalled();
    });

    it('dragAndDrop should call verificationOutside if insideSelected is true', () => {
        drawingServiceSpy.selected = true;
        affectWithMagnestismSpy.and.returnValue({ x: 100, y: 100 });
        service.insideSelected = true;
        drawingServiceSpy.useMagnetism = true;
        service.lastMousePos = { x: 100, y: 100 };
        service.mouseDownCoord = { x: 50, y: 50 };
        service.imageDataDimension = { x: 100, y: 100 };
        service.imageDataPosition = { x: 100, y: 100 };
        service.imageDataInitialDimension = { x: 100, y: 100 };
        service.imageDataPositionClicked = { x: 100, y: 100 };
        service.dragAndDrop();
        expect(verificationOutsideSpy).toHaveBeenCalled();
        expect(updatePreviewCanvasSpy).not.toHaveBeenCalled();
    });

    it('dragAndDrop should do nothing if selected is true and insideSelected is false', () => {
        drawingServiceSpy.selected = true;
        service.insideSelected = false;
        service.dragAndDrop();
        expect(verificationOutsideSpy).not.toHaveBeenCalled();
    });

    it('dragAndDrop should not update imageDataPosition if useMagnetism is false', () => {
        drawingServiceSpy.selected = true;
        affectWithMagnestismSpy.and.returnValue({ x: 100, y: 100 });
        service.insideSelected = true;
        drawingServiceSpy.useMagnetism = false;
        service.lastMousePos = { x: 100, y: 100 };
        service.mouseDownCoord = { x: 50, y: 50 };
        service.imageDataDimension = { x: 100, y: 100 };
        service.imageDataPosition = { x: 100, y: 100 };
        service.imageDataInitialDimension = { x: 100, y: 100 };
        service.imageDataPositionClicked = { x: 100, y: 100 };
        service.dragAndDrop();
        expect(verificationOutsideSpy).toHaveBeenCalled();
        expect(updatePreviewCanvasSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should do nothing if mouseDown is false', () => {
        drawingServiceSpy.mouseDown = false;
        const selectImageSpy = spyOn(service, 'selectImage').and.stub();
        service.onMouseUp();
        expect(selectImageSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should call selectImage if click not on same spot and status is equal to 0 and selected is false', () => {
        drawingServiceSpy.mouseDown = true;
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = { x: 20, y: 20 };
        service.status = 0;
        drawingServiceSpy.selected = false;
        const selectImageSpy = spyOn(service, 'selectImage').and.stub();
        service.onMouseUp();
        expect(selectImageSpy).toHaveBeenCalled();
    });

    it('onMouseUp should call selectImage if click not on same spot and status is equal to 0 and selected is true', () => {
        drawingServiceSpy.mouseDown = true;
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = { x: 20, y: 20 };
        service.imageDataDimension = { x: 100, y: 100 };
        service.imageDataPosition = { x: 100, y: 100 };
        service.status = 0;
        drawingServiceSpy.selected = true;
        const selectImageSpy = spyOn(service, 'selectImage').and.stub();
        service.onMouseUp();
        expect(selectImageSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should not call selectImage status is not 0 and set flip if imageDataDimension is negative', () => {
        drawingServiceSpy.mouseDown = true;
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = { x: 20, y: 20 };
        service.imageDataDimension = { x: -5, y: -5 };
        service.imageDataPosition = { x: 100, y: 100 };
        service.status = 1;
        drawingServiceSpy.selected = false;
        const selectImageSpy = spyOn(service, 'selectImage').and.stub();
        service.onMouseUp();
        expect(selectImageSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should not call selectImage status is not 0', () => {
        drawingServiceSpy.mouseDown = true;
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = { x: 20, y: 20 };
        service.imageDataDimension = { x: 100, y: 100 };
        service.imageDataPosition = { x: 100, y: 100 };
        service.status = 1;
        drawingServiceSpy.selected = false;
        const selectImageSpy = spyOn(service, 'selectImage').and.stub();
        service.onMouseUp();
        expect(selectImageSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should do nothing if clicking on the same spot', () => {
        drawingServiceSpy.mouseDown = true;
        service.mouseDownCoord = { x: 10, y: 10 };
        service.lastMousePos = { x: 10, y: 10 };
        const selectImageSpy = spyOn(service, 'selectImage').and.stub();
        service.onMouseUp();
        expect(selectImageSpy).not.toHaveBeenCalled();
    });

    it(' shiftUp should call updatePreviewCanvas only when selected is false', () => {
        drawingServiceSpy.changePositionAndDimensions.and.returnValue({ x: 10, y: 10 });
        drawingServiceSpy.selected = true;
        service.shiftUp();
        expect(updatePreviewCanvasSpy).not.toHaveBeenCalled();
        drawingServiceSpy.selected = false;
        service.shiftUp();
        expect(updatePreviewCanvasSpy).toHaveBeenCalled();
    });

    it(' shiftUp should call resizeDrawing if selected and mouseDown are true', () => {
        drawingServiceSpy.selected = true;
        drawingServiceSpy.mouseDown = true;
        const resizeDrawingSpy = spyOn(service, 'resizeDrawing').and.stub();
        service.shiftUp();
        expect(resizeDrawingSpy).toHaveBeenCalled();
        expect(updatePreviewCanvasSpy).not.toHaveBeenCalled();
    });

    it(' shiftDown should call updatePreviewCanvas only when selected is false', () => {
        drawingServiceSpy.changePositionAndDimensions.and.returnValue({ x: 10, y: 10 });
        drawingServiceSpy.selected = true;
        service.shiftDown();
        expect(updatePreviewCanvasSpy).not.toHaveBeenCalled();
        drawingServiceSpy.selected = false;
        service.shiftDown();
        expect(updatePreviewCanvasSpy).toHaveBeenCalled();
    });

    it(' shiftDown should call resizeDrawing if selected and mouseDown are true', () => {
        drawingServiceSpy.selected = true;
        drawingServiceSpy.mouseDown = true;
        const resizeDrawingSpy = spyOn(service, 'resizeDrawing').and.stub();
        service.shiftDown();
        expect(resizeDrawingSpy).toHaveBeenCalled();
        expect(updatePreviewCanvasSpy).not.toHaveBeenCalled();
    });

    it(' deplacement should move down and to the right if arrowDown and arrowRight are true and arrowUp and arrowLeft are false', () => {
        deplacementSpy.and.callThrough();
        const initialPosition = { x: 10, y: 10 } as Vec2;
        const translation = 3;
        service.imageDataPosition = { x: initialPosition.x, y: initialPosition.y };
        service.arrowDown = service.arrowRight = true;
        service.arrowUp = service.arrowLeft = false;
        service.deplacement();
        expect(service.imageDataPosition).toEqual({ x: initialPosition.x + translation, y: initialPosition.y + translation });
    });

    it(' deplacement should move up and to the left if arrowDown and arrowRight are false and arrowUp and arrowLeft are true', () => {
        deplacementSpy.and.callThrough();
        const initialPosition = { x: 10, y: 10 } as Vec2;
        const translation = 3;
        service.imageDataPosition = { x: initialPosition.x, y: initialPosition.y };
        service.arrowDown = service.arrowRight = false;
        service.arrowUp = service.arrowLeft = true;
        service.deplacement();
        expect(service.imageDataPosition).toEqual({ x: initialPosition.x - translation, y: initialPosition.y - translation });
    });

    it('deplacement should call affectWithMagnetism if useMagnetism is true', () => {
        deplacementSpy.and.callThrough();
        drawingServiceSpy.useMagnetism = true;
        service.arrowDown = false;
        service.arrowLeft = false;
        service.arrowRight = false;
        service.arrowUp = false;
        service.imageDataDimension = { x: 100, y: 100 };
        service.imageDataPosition = { x: 100, y: 100 };
        affectWithMagnestismSpy.and.returnValue({ x: 100, y: 100 });
        service.deplacement();
        expect(verificationOutsideSpy).toHaveBeenCalled();
        expect(affectWithMagnestismSpy).toHaveBeenCalled();
    });

    it('deplacement should call affectWithMagnetism if useMagnetism is true', () => {
        deplacementSpy.and.callThrough();
        drawingServiceSpy.useMagnetism = true;
        service.arrowDown = false;
        service.arrowLeft = false;
        service.arrowRight = true;
        service.arrowUp = true;
        service.imageDataDimension = { x: 100, y: 100 };
        service.imageDataPosition = { x: 100, y: 100 };
        affectWithMagnestismSpy.and.returnValue({ x: 100, y: 100 });
        service.deplacement();
        expect(verificationOutsideSpy).toHaveBeenCalled();
        expect(affectWithMagnestismSpy).toHaveBeenCalled();
    });

    it('deplacement should call affectWithMagnetism if useMagnetism is true', () => {
        deplacementSpy.and.callThrough();
        drawingServiceSpy.useMagnetism = true;
        service.arrowDown = true;
        service.arrowLeft = true;
        service.arrowRight = false;
        service.arrowUp = false;
        service.imageDataDimension = { x: 100, y: 100 };
        service.imageDataPosition = { x: 100, y: 100 };
        affectWithMagnestismSpy.and.returnValue({ x: 100, y: 100 });
        service.deplacement();
        expect(verificationOutsideSpy).toHaveBeenCalled();
        expect(affectWithMagnestismSpy).toHaveBeenCalled();
    });

    it(' gestionDeplacement should call itself and deplacement for as long as an arrow is maintained', () => {
        const expectedResult = 3;
        const TIMER_100 = 100;
        gestionDeplacementSpy.and.callThrough();
        service.arrowUp = true;
        service.gestionDeplacement();
        jasmine.clock().tick((expectedResult - 1) * TIMER_100 + 1);
        service.arrowUp = false;
        expect(gestionDeplacementSpy).toHaveBeenCalledTimes(expectedResult);
        expect(deplacementSpy).toHaveBeenCalledTimes(expectedResult);
        jasmine.clock().tick((expectedResult - 1) * TIMER_100 + 1);
        expect(gestionDeplacementSpy).toHaveBeenCalledTimes(expectedResult);
        expect(deplacementSpy).toHaveBeenCalledTimes(expectedResult);
    });

    it(' pressing the up arrow and then releasing it should make arrowUp true and then false', () => {
        drawingServiceSpy.selected = true;
        const event = { key: 'ArrowUp', preventDefault: () => {} } as KeyboardEvent;
        service.onKeyDown(event);
        expect(service.arrowUp).toEqual(true);
        service.onKeyUp(event);
        expect(service.arrowUp).toEqual(false);
    });

    it(' pressing the left arrow and then releasing it should make arrowLeft true and then false', () => {
        drawingServiceSpy.selected = true;
        const event = { key: 'ArrowLeft', preventDefault: () => {} } as KeyboardEvent;
        service.onKeyDown(event);
        expect(service.arrowLeft).toEqual(true);
        service.onKeyUp(event);
        expect(service.arrowLeft).toEqual(false);
    });

    it(' pressing the right arrow and then releasing it should make arrowRight true and then false', () => {
        drawingServiceSpy.selected = true;
        const event = { key: 'ArrowRight', preventDefault: () => {} } as KeyboardEvent;
        service.onKeyDown(event);
        expect(service.arrowRight).toEqual(true);
        service.onKeyUp(event);
        expect(service.arrowRight).toEqual(false);
    });

    it(' pressing the down arrow and then releasing it should make arrowDown true and then false', () => {
        drawingServiceSpy.selected = true;
        const event = { key: 'ArrowDown', preventDefault: () => {} } as KeyboardEvent;
        service.onKeyDown(event);
        expect(service.arrowDown).toEqual(true);
        service.onKeyUp(event);
        expect(service.arrowDown).toEqual(false);
    });

    it(' releasing any button other then the arrows should change fired to false', () => {
        service.fired = true;
        const event = { key: 'ArrowDown', preventDefault: () => {} } as KeyboardEvent;
        service.arrowLeft = true;
        service.onKeyUp(event);
        expect(service.fired).toEqual(true);
    });

    it(' pressing an arrow and keeping it down for at least 500ms should call gestionDeplacement', () => {
        drawingServiceSpy.selected = true;
        const TIMER_501 = 501;
        const event = { key: 'ArrowDown', preventDefault: () => {} } as KeyboardEvent;
        service.onKeyDown(event);
        expect(deplacementSpy).toHaveBeenCalled();
        jasmine.clock().tick(TIMER_501);
        expect(gestionDeplacementSpy).toHaveBeenCalled();
    });

    it(' pressing an arrow and releasing it before 500ms should not call gestionDeplacement', () => {
        drawingServiceSpy.selected = true;
        const TIMER_501 = 501;
        const event = { key: 'ArrowDown', preventDefault: () => {} } as KeyboardEvent;
        service.onKeyDown(event);
        service.arrowDown = false;
        expect(deplacementSpy).toHaveBeenCalled();
        jasmine.clock().tick(TIMER_501);
        expect(gestionDeplacementSpy).not.toHaveBeenCalled();
    });

    it(' pressing a key while the gestiondeplacement was already fired will not call gestiondeplacement again', () => {
        drawingServiceSpy.selected = true;
        service.fired = true;
        const event = { key: 'ArrowDown', preventDefault: () => {} } as KeyboardEvent;
        service.onKeyDown(event);
        expect(deplacementSpy).not.toHaveBeenCalled();
        expect(gestionDeplacementSpy).not.toHaveBeenCalled();
    });

    it(' pressing a key other than an arrow should not call deplacement or gestionDeplacement', () => {
        drawingServiceSpy.selected = true;
        service.fired = true;
        const event = { key: 'Space', preventDefault: () => {} } as KeyboardEvent;
        service.onKeyDown(event);
        expect(deplacementSpy).not.toHaveBeenCalled();
        expect(gestionDeplacementSpy).not.toHaveBeenCalled();
    });

    it(' pressing an arrow while nothing is selected should not call deplacement or gestionDeplacement', () => {
        drawingServiceSpy.selected = false;
        const event = { key: 'ArrowDown', preventDefault: () => {} } as KeyboardEvent;
        service.onKeyDown(event);
        expect(deplacementSpy).not.toHaveBeenCalled();
        expect(gestionDeplacementSpy).not.toHaveBeenCalled();
    });

    it('delete should call clearCanvas', () => {
        service.delete();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('cut should call copy and delete', () => {
        const copySpy = spyOn(service, 'copy').and.stub();
        const deleteSpy = spyOn(service, 'delete').and.stub();
        service.cut();
        expect(copySpy).toHaveBeenCalled();
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('paste should do nothing if clipboard is empty', () => {
        spyOn(service['clipboardService'], 'isEmpty').and.returnValue(true);
        service.paste();
        expect(drawingServiceSpy.previewCtx.putImageData).not.toHaveBeenCalled();
    });

    it('paste should call confirmation if selected is true', () => {
        drawingServiceSpy.selected = true;
        spyOn(service['clipboardService'], 'isEmpty').and.returnValue(false);
        service.paste();
        expect(confirmationSpy).toHaveBeenCalledWith(false);
    });

    it('paste should not call confirmation if selected is false', () => {
        drawingServiceSpy.selected = false;
        spyOn(service['clipboardService'], 'isEmpty').and.returnValue(false);
        service.paste();
        expect(confirmationSpy).not.toHaveBeenCalledWith(false);
    });

    it('manageClipBoard should copy if keyboardEvent is ctrl+c', () => {
        const test = { key: 'c', ctrlKey: true } as KeyboardEvent;
        const copySpy = spyOn(service, 'copy').and.stub();
        service.manageClipBoard(test);
        expect(copySpy).toHaveBeenCalled();
    });

    it('manageClipBoard should call cut if keyboardEvent is ctrl+x', () => {
        const test = { key: 'x', ctrlKey: true } as KeyboardEvent;
        const cutSpy = spyOn(service, 'cut').and.stub();
        service.manageClipBoard(test);
        expect(cutSpy).toHaveBeenCalled();
    });

    it('manageClipBoard should delete cut if keyboardEvent is Delete', () => {
        const test = { key: 'Delete' } as KeyboardEvent;
        const deleteSpy = spyOn(service, 'delete').and.stub();
        service.manageClipBoard(test);
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('moveWithArrows should call deplacement', () => {
        const event = { key: 'arrowUp', preventDefault: {} } as KeyboardEvent;
        spyOn<any>(event, 'preventDefault').and.stub();
        service.fired = false;
        service.moveWithArrows(event);
        expect(deplacementSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown should call manageClipBoard', () => {
        const event = { key: 'Delete', preventDefault: {} } as KeyboardEvent;
        drawingServiceSpy.selected = true;
        spyOn<any>(event, 'preventDefault').and.stub();
        const manageClipBoardSpy = spyOn(service, 'manageClipBoard').and.stub();
        service.onKeyDown(event);
        expect(manageClipBoardSpy).toHaveBeenCalled();
    });

    it('onKeyDown should do nothing if selected is false', () => {
        const event = { key: 'z', preventDefault: {} } as KeyboardEvent;
        drawingServiceSpy.selected = false;
        spyOn<any>(event, 'preventDefault').and.stub();
        const manageClipBoardSpy = spyOn(service, 'manageClipBoard').and.stub();
        service.onKeyDown(event);
        expect(manageClipBoardSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown should do nothing if selected is false', () => {
        const event = { key: 'Shift', preventDefault: {} } as KeyboardEvent;
        drawingServiceSpy.selected = true;
        spyOn<any>(event, 'preventDefault').and.stub();
        const manageClipBoardSpy = spyOn(service, 'manageClipBoard').and.stub();
        service.onKeyDown(event);
        expect(manageClipBoardSpy).not.toHaveBeenCalled();
    });

    it(' escape should call the confirmation function if selected is true', () => {
        drawingServiceSpy.selected = true;
        service.escapeDown();
        expect(confirmationSpy).toHaveBeenCalled();
    });

    it(' escape should not call the confirmation function if selected is false', () => {
        drawingServiceSpy.selected = false;
        service.escapeDown();
        expect(confirmationSpy).not.toHaveBeenCalled();
    });

    it('lastActionIsPaste should return an actionPaste', () => {
        annulerRefaireServiceSpy.undoActions = [];
        service.lastActionIsPaste();
        expect(service.lastActionIsPaste()).toEqual(
            annulerRefaireServiceSpy.undoActions[annulerRefaireServiceSpy.undoActions.length - 1] instanceof ActionPaste,
        );
    });
    // tslint:disable-next-line: max-file-line-count
});

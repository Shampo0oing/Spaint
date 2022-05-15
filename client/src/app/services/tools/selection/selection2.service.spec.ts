import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MouseButton } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/tools/magnetism/magnetism.service';
import { ClipboardService } from './clipboard.service';
import { SelectionMock } from './selection.service.spec';
// tslint:disable:no-string-literal
// tslint:disable:no-any
// tslint:disable:no-empty
const TESTING_WIDTH = 800;
const TESTING_HEIGHT = 800;
const TESTING_DATA1 = { x: 20, y: 20 };
const TESTING_DATA2 = { x: 30, y: 30 };
const TESTING_SQUARE_SIZE = 5;

describe('SelectionService', () => {
    let service: SelectionMock;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let magnetismServiceSpy: jasmine.SpyObj<MagnetismService>;
    let clipboardServiceSpy: jasmine.SpyObj<ClipboardService>;
    let annulerRefaireServiceSpy: jasmine.SpyObj<AnnulerRefaireService>;

    let mouseEvent: MouseEvent;
    let isInsideSpy: jasmine.Spy<any>;
    let selectImageSpy: jasmine.Spy<any>;
    let confirmationSpy: jasmine.Spy<any>;
    let confirmOnBaseSpy: jasmine.Spy<any>;

    let updatePreviewCanvasSpy: jasmine.Spy<any>;
    let verificationOutsideSpy: jasmine.Spy<any>;
    let putImageDataSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas'], { canvas: {} as HTMLCanvasElement });
        clipboardServiceSpy = jasmine.createSpyObj('ClipboardService', ['isEmpty']);
        annulerRefaireServiceSpy = jasmine.createSpyObj('AnnulerRefaireService', ['removeActionsStubs', 'addUndoAction']);
        magnetismServiceSpy = jasmine.createSpyObj('MagnetismService', ['affectWithMagnestism']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: AnnulerRefaireService, useValue: annulerRefaireServiceSpy },
                { provide: MagnetismService, useValue: magnetismServiceSpy },
                { provide: ClipboardService, useValue: clipboardServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(SelectionMock);

        isInsideSpy = spyOn<any>(service, 'isInside');
        selectImageSpy = spyOn<any>(service, 'selectImage');
        confirmationSpy = spyOn<any>(service, 'confirmation');
        confirmOnBaseSpy = spyOn<any>(service, 'confirmOnBase');
        updatePreviewCanvasSpy = spyOn<any>(service, 'updatePreviewCanvas').and.stub();
        verificationOutsideSpy = spyOn<any>(service, 'verificationOutside').and.stub();
        putImageDataSpy = spyOn<any>(previewCtxStub, 'putImageData').and.stub();

        spyOn<any>(service, 'getPositionFromMouse').and.callFake((event: MouseEvent) => {
            return { x: event.offsetX, y: event.offsetY };
        });
        // Configuration du spy du service
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service.fired = false;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;
        magnetismServiceSpy.affectWithMagnestism.and.returnValue({ x: 0, y: 0 } as Vec2);
        jasmine.clock().install();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseDown should change and call nothing if the mouseButton is not the left button', () => {
        mouseEvent = { button: MouseButton.Right } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(isInsideSpy).not.toHaveBeenCalled();
        expect(confirmOnBaseSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should change mouseDownCoord and not call isInside and confirmOnBase if mouse down is true and selected is false', () => {
        drawingServiceSpy.mouseDown = true;
        drawingServiceSpy.selected = false;
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        expect(isInsideSpy).not.toHaveBeenCalled();
        expect(confirmOnBaseSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown should change insideSelected and call isInside and not call confirmOnBase if mouse down and selected are true', () => {
        drawingServiceSpy.mouseDown = true;
        drawingServiceSpy.selected = true;
        service.insideSelected = false;
        isInsideSpy.and.callFake(() => {
            return true;
        });
        service.onMouseDown(mouseEvent);
        expect(service.insideSelected).toEqual(true);
        expect(isInsideSpy).toHaveBeenCalled();
        expect(confirmOnBaseSpy).not.toHaveBeenCalled();
    });

    it('onMouseDown must call confirmation, not call confirmOnBase if initialposition isnt equal to position and mouseDown, selected are true and isInside returns false', () => {
        drawingServiceSpy.mouseDown = true;
        drawingServiceSpy.selected = true;
        service.insideSelected = true;
        service.imageDataInitialPosition = TESTING_DATA1;
        service.imageDataPosition = TESTING_DATA2;
        service.imageDataDimension = TESTING_DATA1;
        isInsideSpy.and.callFake(() => {
            return false;
        });
        service.onMouseDown(mouseEvent);
        expect(annulerRefaireServiceSpy.removeActionsStubs).not.toHaveBeenCalled();
        expect(confirmOnBaseSpy).not.toHaveBeenCalled();
        expect(confirmationSpy).toHaveBeenCalled();
    });

    it('onMouseMove should only change lastMousePos and call nothing if mouse down is false', () => {
        drawingServiceSpy.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(service.lastMousePos).toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        expect(updatePreviewCanvasSpy).not.toHaveBeenCalled();
        expect(verificationOutsideSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should call updatePreviewCanvas and change lastMousePos to the testing dimensions if mouse down is true, selected false,', () => {
        mouseEvent = {
            offsetX: 900,
            offsetY: 900,
            button: 0,
        } as MouseEvent;
        drawingServiceSpy.mouseDown = true;
        drawingServiceSpy.selected = false;
        drawingServiceSpy.canvas.width = TESTING_WIDTH;
        drawingServiceSpy.canvas.height = TESTING_HEIGHT;
        service.onMouseMove(mouseEvent);
        expect(service.lastMousePos).toEqual({ x: TESTING_WIDTH, y: TESTING_HEIGHT });
        expect(updatePreviewCanvasSpy).toHaveBeenCalled();
        expect(verificationOutsideSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should call updatePreviewCanvas and change lastMousePos to 0 if mouse down is true, selected false', () => {
        mouseEvent = {
            offsetX: -100,
            offsetY: -100,
            button: 0,
        } as MouseEvent;
        drawingServiceSpy.mouseDown = true;
        drawingServiceSpy.selected = false;
        drawingServiceSpy.canvas.width = TESTING_WIDTH;
        drawingServiceSpy.canvas.height = TESTING_HEIGHT;
        service.onMouseMove(mouseEvent);
        expect(service.lastMousePos).toEqual({ x: 0, y: 0 });
        expect(updatePreviewCanvasSpy).toHaveBeenCalled();
        expect(verificationOutsideSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should call verificationOutside, clearCanvas but not updatePreviewCanvas and change imageDataPostion if mouse down, selected, insideSelected are true ', () => {
        drawingServiceSpy.mouseDown = true;
        drawingServiceSpy.selected = true;
        service.insideSelected = true;
        service.mouseDownCoord = { x: 10, y: 10 };
        service.imageDataPositionClicked = { x: 15, y: 15 };
        drawingServiceSpy.canvas.width = TESTING_WIDTH;
        drawingServiceSpy.canvas.height = TESTING_HEIGHT;
        service.onMouseMove(mouseEvent);
        expect(service.imageDataPosition).toEqual({ x: 30, y: 30 });
        expect(verificationOutsideSpy).toHaveBeenCalled();
        expect(updatePreviewCanvasSpy).not.toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
    });

    it(' onMouseMove should call affectWithMagnestism if useMagnetism is true', () => {
        service.imageDataPositionClicked = { x: 0, y: 0 } as Vec2;
        service.lastMousePos = { x: 0, y: 0 } as Vec2;
        service.mouseDownCoord = { x: 0, y: 0 } as Vec2;
        drawingServiceSpy.useMagnetism = true;
        drawingServiceSpy.mouseDown = true;
        drawingServiceSpy.selected = true;
        service.insideSelected = true;
        service.onMouseMove({ offsetX: 0, offsetY: 0 } as MouseEvent);
        expect(magnetismServiceSpy.affectWithMagnestism).toHaveBeenCalled();
    });

    it('onMouseMove should call nothing if mouse down, selected are true but insideSelected is false ', () => {
        drawingServiceSpy.mouseDown = true;
        drawingServiceSpy.selected = true;
        service.insideSelected = false;
        service.onMouseMove(mouseEvent);
        expect(verificationOutsideSpy).not.toHaveBeenCalled();
        expect(updatePreviewCanvasSpy).not.toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it(' onMouseUp should do nothing if the mouse was not already pressed', () => {
        drawingServiceSpy.mouseDown = false;
        service.onMouseUp();
        expect(selectImageSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should do nothing but make mouseDown as false if the width or the height of the selection is 0', () => {
        drawingServiceSpy.mouseDown = true;
        service.mouseDownCoord = service.lastMousePos = { x: 10, y: 10 };
        service.onMouseUp();
        expect(selectImageSpy).not.toHaveBeenCalled();
        expect(drawingServiceSpy.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call selectImage when the width and the height of the selection is not 0 and selected is false', () => {
        drawingServiceSpy.mouseDown = true;
        service.mouseDownCoord = { x: 5, y: 5 };
        service.lastMousePos = { x: 10, y: 10 };
        drawingServiceSpy.selected = false;
        service.onMouseUp();
        expect(selectImageSpy).toHaveBeenCalled();
    });

    it(' deplacement should call affectWithMagnestism when useMagnetism is true', () => {
        drawingServiceSpy.useMagnetism = true;
        service.deplacement();
        expect(magnetismServiceSpy.affectWithMagnestism).toHaveBeenCalled();
    });

    it(' delete should call clearCanvas and addUndoAction', () => {
        service.delete();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(annulerRefaireServiceSpy.addUndoAction).toHaveBeenCalled();
    });

    it(' cut should call copy and delete', () => {
        const copySpy = spyOn<any>(service, 'copy').and.stub();
        const deleteSpy = spyOn<any>(service, 'delete').and.stub();
        service.cut();
        expect(copySpy).toHaveBeenCalled();
        expect(deleteSpy).toHaveBeenCalled();
    });

    it(' paste should dot nothing if the clipboard is empty', () => {
        annulerRefaireServiceSpy.addUndoAction.and.stub();
        clipboardServiceSpy.isEmpty.and.returnValue(true);
        service.paste();
        expect(putImageDataSpy).not.toHaveBeenCalled();
        expect(annulerRefaireServiceSpy.addUndoAction).not.toHaveBeenCalled();
    });

    it(' paste should call putImageData and addUndoAction if the clipboard is not empty', () => {
        annulerRefaireServiceSpy.addUndoAction.and.stub();
        clipboardServiceSpy.isEmpty.and.returnValue(false);
        service.paste();
        expect(putImageDataSpy).toHaveBeenCalled();
        expect(annulerRefaireServiceSpy.addUndoAction).toHaveBeenCalled();
    });

    it(' manageClipBoard should call copy if ctrl + c was pressed', () => {
        const copySpy = spyOn<any>(service, 'copy').and.stub();
        service.manageClipBoard({ key: 'c', ctrlKey: true } as KeyboardEvent);
        expect(copySpy).toHaveBeenCalled();
    });

    it(' manageClipBoard should call cut if ctrl + x was pressed', () => {
        const cutSpy = spyOn<any>(service, 'cut').and.stub();
        service.manageClipBoard({ key: 'x', ctrlKey: true } as KeyboardEvent);
        expect(cutSpy).toHaveBeenCalled();
    });

    it(' manageClipBoard should call delete if Delete was pressed', () => {
        const deleteSpy = spyOn<any>(service, 'delete').and.stub();
        service.manageClipBoard({ key: 'Delete' } as KeyboardEvent);
        expect(deleteSpy).toHaveBeenCalled();
    });

    it(' deplacement should move follwing the grid if useMagnetism is true when going up and to the left', () => {
        magnetismServiceSpy.affectWithMagnestism.and.returnValue({ x: TESTING_SQUARE_SIZE, y: TESTING_SQUARE_SIZE } as Vec2);
        service.arrowLeft = service.arrowUp = true;
        drawingServiceSpy.useMagnetism = true;
        service.imageDataPosition.x = service.imageDataPosition.y = drawingServiceSpy.squareSize = TESTING_SQUARE_SIZE;
        service.deplacement();
        expect(service.imageDataPosition).toEqual({ x: 0, y: 0 } as Vec2);
    });

    it(' deplacement should move follwing the grid if useMagnetism is true when going up and to the left', () => {
        magnetismServiceSpy.affectWithMagnestism.and.returnValue({ x: 0, y: 0 } as Vec2);
        service.arrowRight = service.arrowDown = true;
        drawingServiceSpy.useMagnetism = true;
        service.imageDataPosition.x = service.imageDataPosition.y = drawingServiceSpy.squareSize = TESTING_SQUARE_SIZE;
        service.deplacement();
        expect(service.imageDataPosition).toEqual({ x: TESTING_SQUARE_SIZE, y: TESTING_SQUARE_SIZE } as Vec2);
    });
});

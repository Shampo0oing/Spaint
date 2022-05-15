import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_ERASER_WIDTH, DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from './eraser.service';

const PINK = '#ff22ff';

const getColor = (ctx: CanvasRenderingContext2D, pos: Vec2): string => {
    const imageData: ImageData = ctx.getImageData(pos.x, pos.y, 1, 1);
    const color: string = '#' + imageData.data[0].toString(16) + imageData.data[1].toString(16) + imageData.data[2].toString(16);
    return color;
};

const getOpacity = (ctx: CanvasRenderingContext2D, pos: Vec2): number => {
    const imageData: ImageData = ctx.getImageData(pos.x, pos.y, 1, 1);
    // tslint:disable-next-line:no-magic-numbers
    const opacity: number = imageData.data[3];
    return opacity;
};

const hasBeenErased = (ctx: CanvasRenderingContext2D, pos: Vec2): boolean => {
    return getColor(ctx, pos) === '#ffffff' || getOpacity(ctx, pos) === 0;
};

const drawRect = (ctx: CanvasRenderingContext2D, pos: Vec2, size: Vec2): void => {
    ctx.fillStyle = PINK;
    ctx.fillRect(pos.x - size.x / 2, pos.y - size.y / 2, size.x, size.y);
};

// tslint:disable:no-any
describe('EraserService', () => {
    let service: EraserService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EraserService);
        spyOn<any>(service, 'getPositionFromMouse').and.callFake((event: MouseEvent) => {
            return { x: event.offsetX, y: event.offsetY };
        });

        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        mouseEvent = {
            offsetX: 10,
            offsetY: 10,
            button: 0,
        } as MouseEvent;
        drawingServiceSpy.eraserWidth = DEFAULT_ERASER_WIDTH;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('the eraser should be able to erase on click', () => {
        drawRect(baseCtxStub, { x: 10, y: 10 } as Vec2, { x: 20, y: 20 } as Vec2);
        service.onMouseDown(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(hasBeenErased(baseCtxStub, { x: 10, y: 10 } as Vec2)).toEqual(true);
    });

    it('should be able to erase while maintaining the mouse clicked left to right with a big variation on x', () => {
        drawRect(baseCtxStub, { x: 10, y: 10 } as Vec2, { x: 20, y: 20 } as Vec2);
        mouseEvent = { offsetX: 5, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 20, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(hasBeenErased(baseCtxStub, { x: 5, y: 10 } as Vec2)).toEqual(true);
    });

    it('should be able to erase while maintaining the mouse clicked left to right with a small variation on y', () => {
        drawRect(baseCtxStub, { x: 10, y: 10 } as Vec2, { x: 20, y: 20 } as Vec2);
        mouseEvent = { offsetX: 5, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 6, offsetY: 20, button: 0 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(hasBeenErased(baseCtxStub, { x: 5, y: 10 } as Vec2)).toEqual(true);
    });

    it('should be able to erase while maintaining the mouse clicked right to left with a big variation on x', () => {
        drawRect(baseCtxStub, { x: 10, y: 10 } as Vec2, { x: 20, y: 20 } as Vec2);
        mouseEvent = { offsetX: 20, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 5, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(hasBeenErased(baseCtxStub, { x: 5, y: 10 } as Vec2)).toEqual(true);
    });

    it('should be able to erase while maintaining the mouse clicked right to left with a big variation on y', () => {
        drawRect(baseCtxStub, { x: 10, y: 10 } as Vec2, { x: 20, y: 20 } as Vec2);
        mouseEvent = { offsetX: 6, offsetY: 20, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 5, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(hasBeenErased(baseCtxStub, { x: 5, y: 10 } as Vec2)).toEqual(true);
    });

    it('cursorEraser should call fillRect and strokeRect', () => {
        const fillRectSpy = spyOn<any>(previewCtxStub, 'fillRect').and.stub();
        const strokeRectSpy = spyOn<any>(previewCtxStub, 'strokeRect').and.stub();
        const pos = { x: 10, y: 10 };
        const width = 10;
        drawingServiceSpy.eraserWidth = width;
        service.cursorEraser(pos);
        expect(fillRectSpy).toHaveBeenCalledWith(pos.x, pos.y, width, width);
        expect(strokeRectSpy).toHaveBeenCalledWith(pos.x, pos.y, width, width);
    });

    it('moving the mouse around should not erase anything if the mouse is not downed', () => {
        drawRect(baseCtxStub, { x: 10, y: 10 } as Vec2, { x: 20, y: 20 } as Vec2);
        mouseEvent = { offsetX: 5, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        mouseEvent = { offsetX: 20, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        expect(hasBeenErased(baseCtxStub, { x: 10, y: 10 } as Vec2)).toEqual(false);
    });

    it('clicking right mouse should not erase anything', () => {
        drawRect(baseCtxStub, { x: 10, y: 10 } as Vec2, { x: 20, y: 20 } as Vec2);
        mouseEvent = { offsetX: 5, offsetY: 10, button: 1 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 15, offsetY: 10, button: 1 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(hasBeenErased(baseCtxStub, { x: 5, y: 10 } as Vec2)).toEqual(false);
        expect(hasBeenErased(baseCtxStub, { x: 10, y: 10 } as Vec2)).toEqual(false);
        expect(hasBeenErased(baseCtxStub, { x: 15, y: 10 } as Vec2)).toEqual(false);
    });

    it('if the distance between two point is small enought, the function completeLine should not be called', () => {
        const completeLineSpy = spyOn<any>(service, 'completeLine').and.callThrough();
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 11, offsetY: 10 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(completeLineSpy).not.toHaveBeenCalled();
    });

    it(' getCurrentToolString should return eraser', () => {
        const expectedResult = 'eraser';
        expect(service.getCurrentToolString()).toEqual(expectedResult);
    });
});

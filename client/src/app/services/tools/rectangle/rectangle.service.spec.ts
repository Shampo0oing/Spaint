import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_RECTANGLE_WIDTH, DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService } from './rectangle.service';

const BLACK = '#111111';
const PINK = '#ff22ff';
// const WHITE: string = '#ffffff';

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

// tslint:disable:no-any
describe('RectangleService', () => {
    let service: RectangleService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawRectangleSpy: jasmine.Spy<any>;
    let drawSquareSpy: jasmine.Spy<any>;
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

        service = TestBed.inject(RectangleService);
        spyOn<any>(service, 'getPositionFromMouse').and.callFake((event: MouseEvent) => {
            return { x: event.offsetX, y: event.offsetY };
        });
        drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callThrough();
        drawSquareSpy = spyOn<any>(service, 'drawSquare').and.callThrough();

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        drawingServiceSpy.traceTypeRectangle = 0;
        drawingServiceSpy.rectangleWidth = DEFAULT_RECTANGLE_WIDTH;
        drawingServiceSpy.primaryColor = PINK;
        drawingServiceSpy.secondaryColor = BLACK;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(drawingServiceSpy.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1, // TODO: Avoir ceci dans un enum accessible
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(drawingServiceSpy.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawRectangle if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        drawingServiceSpy.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawSquare if mouse was already down and shift was held', () => {
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 26, offsetY: 26 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.shiftDown();
        service.onMouseMove(mouseEvent);
        expect(drawSquareSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should call drawSquare if mouse was already down and shift was held', () => {
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 26, offsetY: 26 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.shiftDown();
        service.onMouseMove(mouseEvent);
        service.onMouseUp(mouseEvent);
        service.shiftUp();
        expect(drawSquareSpy).toHaveBeenCalled();
    });

    it('should be capable of drawing rectangle outlines', () => {
        mouseEvent = { offsetX: 0, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 10, offsetY: 10 } as MouseEvent;
        service.onMouseUp(mouseEvent);
        // pixel en haut à gauche
        expect(getColor(baseCtxStub, { x: 0, y: 0 } as Vec2)).toEqual(BLACK);
        expect(getOpacity(baseCtxStub, { x: 0, y: 0 } as Vec2)).not.toEqual(0);
        // pixel du centre
        expect(getOpacity(baseCtxStub, { x: 5, y: 5 } as Vec2)).toEqual(0);
    });

    it('should be capable of drawing filled rectangles', () => {
        drawingServiceSpy.traceTypeRectangle = 1;
        mouseEvent = { offsetX: 0, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 10, offsetY: 10 } as MouseEvent;
        service.onMouseUp(mouseEvent);
        // pixel en haut à gauche
        expect(getColor(baseCtxStub, { x: 0, y: 0 } as Vec2)).toEqual(PINK);
        expect(getOpacity(baseCtxStub, { x: 0, y: 0 } as Vec2)).not.toEqual(0);
        // pixel du centre
        expect(getColor(baseCtxStub, { x: 5, y: 5 } as Vec2)).toEqual(PINK);
        expect(getOpacity(baseCtxStub, { x: 5, y: 5 } as Vec2)).not.toEqual(0);
    });

    it('should be capable of drawing filled and outlined rectangles', () => {
        drawingServiceSpy.traceTypeRectangle = 2;
        mouseEvent = { offsetX: 0, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 10, offsetY: 10 } as MouseEvent;
        service.onMouseUp(mouseEvent);
        // pixel en haut à gauche
        expect(getColor(baseCtxStub, { x: 0, y: 0 } as Vec2)).toEqual(BLACK);
        expect(getOpacity(baseCtxStub, { x: 0, y: 0 } as Vec2)).not.toEqual(0);
        // pixel du centre
        expect(getColor(baseCtxStub, { x: 5, y: 5 } as Vec2)).toEqual(PINK);
        expect(getOpacity(baseCtxStub, { x: 5, y: 5 } as Vec2)).not.toEqual(0);
    });

    it('should be capable of drawing a square down and to the right', () => {
        drawingServiceSpy.traceTypeRectangle = 1;
        mouseEvent = { offsetX: 0, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 20, offsetY: 10 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.shiftDown();
        service.onMouseUp(mouseEvent);
        expect(getColor(baseCtxStub, { x: 5, y: 5 } as Vec2)).toEqual(PINK);
        expect(getOpacity(baseCtxStub, { x: 5, y: 5 } as Vec2)).not.toEqual(0);
        expect(getOpacity(baseCtxStub, { x: 15, y: 5 } as Vec2)).toEqual(0);
    });

    it('should be capable of drawing a square up and to the left', () => {
        drawingServiceSpy.traceTypeRectangle = 1;
        mouseEvent = { offsetX: 20, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 0, offsetY: 0 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.shiftDown();
        service.onMouseUp(mouseEvent);
        // pixel du centre
        expect(getColor(baseCtxStub, { x: 15, y: 5 } as Vec2)).toEqual(PINK);
        expect(getOpacity(baseCtxStub, { x: 15, y: 5 } as Vec2)).not.toEqual(0);
        // pixel à l'exterieur
        expect(getOpacity(baseCtxStub, { x: 5, y: 5 } as Vec2)).toEqual(0);
    });

    it('should be capable of drawing a square up and to the right', () => {
        drawingServiceSpy.traceTypeRectangle = 1;
        mouseEvent = { offsetX: 0, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 20, offsetY: 0 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.shiftDown();
        service.onMouseUp(mouseEvent);
        // pixel du centre
        expect(getColor(baseCtxStub, { x: 5, y: 5 } as Vec2)).toEqual(PINK);
        expect(getOpacity(baseCtxStub, { x: 5, y: 5 } as Vec2)).not.toEqual(0);
        // pixel à l'exterieur
        expect(getOpacity(baseCtxStub, { x: 15, y: 5 } as Vec2)).toEqual(0);
    });

    it('should be capable of drawing a square down and to the left', () => {
        drawingServiceSpy.traceTypeRectangle = 1;
        mouseEvent = { offsetX: 20, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 0, offsetY: 10 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.shiftDown();
        service.onMouseUp(mouseEvent);
        // pixel du centre
        expect(getColor(baseCtxStub, { x: 15, y: 5 } as Vec2)).toEqual(PINK);
        expect(getOpacity(baseCtxStub, { x: 15, y: 5 } as Vec2)).not.toEqual(0);
        // pixel à l'exterieur
        expect(getOpacity(baseCtxStub, { x: 5, y: 5 } as Vec2)).toEqual(0);
    });

    // ce test est suposé fonctionner, mais non
    it('should update the preview canvas on shift down and shift up', () => {
        drawingServiceSpy.traceTypeRectangle = 1;
        mouseEvent = { offsetX: 0, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 20, offsetY: 10 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        expect(drawRectangleSpy).toHaveBeenCalledTimes(1);
        service.shiftDown();
        expect(drawSquareSpy).toHaveBeenCalledTimes(1);
        service.shiftUp();
        // tslint:disable-next-line:no-magic-numbers
        expect(drawRectangleSpy).toHaveBeenCalledTimes(2);
    });

    it('should not call drawSquare when shift is pressed but mouse was not downed', () => {
        service.shiftDown();
        expect(drawSquareSpy).not.toHaveBeenCalled();
    });

    it('should not call drawRectangle when shift is relessed but mouse was not downed', () => {
        service.shiftUp();
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it(' pressing rigth click should not draw anything', () => {
        mouseEvent = { button: 1 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
        expect(drawSquareSpy).not.toHaveBeenCalled();
    });

    it(' relessing rigth click should not draw anything', () => {
        mouseEvent = { button: 1 } as MouseEvent;
        service.onMouseUp(mouseEvent);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
        expect(drawSquareSpy).not.toHaveBeenCalled();
    });

    it(' moving the mouse on the canvas without pressing left click should not draw anything', () => {
        service.onMouseMove(mouseEvent);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
        expect(drawSquareSpy).not.toHaveBeenCalled();
    });

    it(' getCurrentToolString should return rectangle', () => {
        const expectedResult = 'rectangle';
        expect(service.getCurrentToolString()).toEqual(expectedResult);
    });
});

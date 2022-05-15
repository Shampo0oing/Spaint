import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from './ellipse.service';

const PINK = '#ff22ff';
const WIDTH = 10;
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
describe('EllipseService', () => {
    let service: EllipseService;
    let mouseEvent: MouseEvent;
    let drawEllipseSpy: jasmine.Spy<any>;
    let drawCircleSpy: jasmine.Spy<any>;
    let drawRectangleSpy: jasmine.Spy<any>;
    let drawSquareSpy: jasmine.Spy<any>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EllipseService);
        spyOn<any>(service, 'getPositionFromMouse').and.callFake((event: MouseEvent) => {
            return { x: event.offsetX, y: event.offsetY };
        });
        drawEllipseSpy = spyOn<any>(service, 'drawEllipse').and.callThrough();
        drawCircleSpy = spyOn<any>(service, 'drawCircle').and.callThrough();
        drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callThrough();
        drawSquareSpy = spyOn<any>(service, 'drawSquare').and.callThrough();

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' onMouseUp should not call drawEllipse if mouse was not already down', () => {
        drawingServiceSpy.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should call drawEllipse if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        drawingServiceSpy.mouseDown = true;

        service.onMouseUp(mouseEvent);
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawCircleSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should call drawCircle if mouse was already down and shift key is pressed', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        drawingServiceSpy.mouseDown = true;
        service.shift = true;
        spyOn<any>(service, 'getCirclePos').and.callFake(() => {
            return;
        });
        drawCircleSpy.and.callFake(() => {
            return;
        });
        service.onMouseUp(mouseEvent);
        expect(drawEllipseSpy).not.toHaveBeenCalled();
        expect(drawCircleSpy).toHaveBeenCalled();
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

    it(' onMouseMove should not call drawEllipse or drawRectangle if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        drawingServiceSpy.mouseDown = false;

        service.onMouseMove(mouseEvent);
        // expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawEllipseSpy).not.toHaveBeenCalled();
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawEllipse and drawRectangle if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        drawingServiceSpy.mouseDown = true;

        service.onMouseMove(mouseEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawCircle and drawSquare if mouse was already down and shift key is pressed', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        drawingServiceSpy.mouseDown = true;
        service.shift = true;
        service.onMouseMove(mouseEvent);

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawCircleSpy).toHaveBeenCalled();
        expect(drawSquareSpy).toHaveBeenCalled();
    });

    it(' keyDown should call drawCircle and drawSquare if mouse was already down and shift key is pressed', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        drawingServiceSpy.mouseDown = true;
        service.lastMousePos = { x: 0, y: 0 };
        service.shiftDown();

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawCircleSpy).toHaveBeenCalled();
        expect(drawSquareSpy).toHaveBeenCalled();
    });

    it(' keyDown should not call drawCircle and drawSquare if shift key is not being pressed', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.lastMousePos = { x: 0, y: 0 };
        service.shiftDown();

        expect(drawCircleSpy).not.toHaveBeenCalled();
        expect(drawSquareSpy).not.toHaveBeenCalled();
    });

    it(' keyDown should not call drawCircle and drawSquare if shift key is being pressed and mouse is not down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.lastMousePos = { x: 0, y: 0 };
        drawingServiceSpy.mouseDown = false;
        service.shiftDown();

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawCircleSpy).not.toHaveBeenCalled();
        expect(drawSquareSpy).not.toHaveBeenCalled();
    });

    it(' keyUp should call drawCircle and drawSquare if mouse was already down and shift key is pressed', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        drawingServiceSpy.mouseDown = true;
        service.lastMousePos = { x: 0, y: 0 };
        service.shiftUp();

        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawEllipseSpy).toHaveBeenCalled();
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it(' keyUp should not call drawCircle and drawSquare if shift key is not being pressed', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.lastMousePos = { x: 0, y: 0 };
        service.shiftUp();

        expect(drawEllipseSpy).not.toHaveBeenCalled();
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it(' drawEllipse should draw an ellipse on the canvas with outlines only', () => {
        drawingServiceSpy.traceTypeEllipse = 0;
        drawingServiceSpy.ellipseWidth = WIDTH;
        drawingServiceSpy.secondaryColor = PINK;

        mouseEvent = { offsetX: 1, offsetY: 1, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 10, offsetY: 100, button: 0 } as MouseEvent;
        service.onMouseUp(mouseEvent);

        expect(getColor(baseCtxStub, { x: 1, y: 50 } as Vec2)).toEqual(PINK);
        // tslint:disable-next-line:no-magic-numbers
        expect(getOpacity(baseCtxStub, { x: 1, y: 50 } as Vec2)).not.toEqual(0);
    });

    it('should be capable of drawing a circle up and to the left', () => {
        mouseEvent = { offsetX: 20, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 0, offsetY: 0 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.shiftDown();
        service.onMouseUp(mouseEvent);
        // pixel du centre
        expect(drawCircleSpy).toHaveBeenCalledTimes(2);
        expect(drawEllipseSpy).toHaveBeenCalledTimes(1);
    });

    it('should be capable of drawing a circle up and to the right', () => {
        mouseEvent = { offsetX: 0, offsetY: 10, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 20, offsetY: 0 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.shiftDown();
        service.onMouseUp(mouseEvent);
        // pixel du centre
        expect(drawCircleSpy).toHaveBeenCalledTimes(2);
        expect(drawEllipseSpy).toHaveBeenCalledTimes(1);
    });

    it('should be capable of drawing a circle down and to the left', () => {
        mouseEvent = { offsetX: 20, offsetY: 0, button: 0 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        mouseEvent = { offsetX: 0, offsetY: 10 } as MouseEvent;
        service.onMouseMove(mouseEvent);
        service.shiftDown();
        service.onMouseUp(mouseEvent);
        // pixel du centre
        expect(drawCircleSpy).toHaveBeenCalledTimes(2);
        expect(drawEllipseSpy).toHaveBeenCalledTimes(1);
    });

    it('right clicking should not draw anything', () => {
        mouseEvent = { button: 1 } as MouseEvent;
        service.onMouseDown(mouseEvent);
        expect(drawCircleSpy).not.toHaveBeenCalled();
        expect(drawEllipseSpy).not.toHaveBeenCalled();
    });

    it('should be able to draw filled ellipses', () => {
        drawingServiceSpy.traceTypeEllipse = 1;
        service.onMouseDown(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(drawEllipseSpy).toHaveBeenCalledTimes(1);
    });

    it('should be able to draw filled ellipses with outline', () => {
        drawingServiceSpy.traceTypeEllipse = 2;
        service.onMouseDown(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(drawEllipseSpy).toHaveBeenCalledTimes(1);
    });

    it(' getCurrentToolString should return ellipse', () => {
        const expectedResult = 'ellipse';
        expect(service.getCurrentToolString()).toEqual(expectedResult);
    });
});

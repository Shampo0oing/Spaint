import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ANGLE_180, ANGLE_270, ANGLE_360, ANGLE_90 } from '@app/classes/constantes';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService, Octan } from './line.service';
// tslint:disable:no-any
// tslint:disable:no-string-literal
// tslint:disable: no-magic-numbers
const P1 = { x: 0, y: 0 };
const P2 = { x: 5, y: 5 };
describe('LineService', () => {
    let service: LineService;
    let mouseEvent: MouseEvent;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let drawLineSpy: jasmine.Spy;
    let getPositionFromMouseSpy: jasmine.Spy;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });
        service = TestBed.inject(LineService);
        getPositionFromMouseSpy = spyOn<any>(service, 'getPositionFromMouse').and.returnValue((event: MouseEvent) => {
            return { x: event.offsetX, y: event.offsetY };
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawLineSpy = spyOn(service, 'drawLines').and.callThrough();
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = ({ width: 300, height: 150 } as unknown) as HTMLCanvasElement;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // tslint:disable-next-line: max-line-length
    it(' onMouseMove should update mouse location and forward call to getPositionFromMouse, drawline and createJunction if drawingLine is true', () => {
        service['drawingLine'] = true;
        service['pathData'].push(mouseEvent);
        service.mouseDownCoord = { x: 0, y: 0 };
        const createJunctionSpy = spyOn(service, 'createJunction').and.stub();
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(service.mouseDownCoord).toEqual(getPositionFromMouseSpy(mouseEvent));
        expect(createJunctionSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it(' onMouseMove do nothing if drawingLine is false', () => {
        service['drawingLine'] = false;
        const createJunctionSpy = spyOn(service, 'createJunction').and.stub();
        getPositionFromMouseSpy.and.stub();
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).not.toHaveBeenCalledWith(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalledWith(previewCtxStub);
        expect(createJunctionSpy).not.toHaveBeenCalledWith(previewCtxStub);
    });

    it(' onClick should update drawingLine and push mouse position into pathData if first click', () => {
        service.mouseDownCoord = { x: 5, y: 5 };
        service['drawingLine'] = false;
        service['pathData'].length = 0;
        service.onClick(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(service['drawingLine']).toBeTrue();
        expect(service['pathData'].length).toEqual(1);
    });

    it(' onClick should push mouseDownCoord into pathData, forward call drawLines and createJunction if not first click', () => {
        const createJunctionSpy = spyOn(service, 'createJunction').and.stub();
        service['pathData'].push(mouseEvent);
        service.onClick(mouseEvent);
        expect(service['pathData'].length).toEqual(2);
        expect(drawLineSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(createJunctionSpy).toHaveBeenCalledWith(baseCtxStub);
    });

    it(' onClick should do nothing if clicking on the same spot', () => {
        const createJunctionSpy = spyOn(service, 'createJunction').and.stub();
        service['pathData'].push({ x: 25, y: 25 });
        getPositionFromMouseSpy.and.returnValue({ x: 25, y: 25 });
        service.onClick(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalledWith(previewCtxStub);
        expect(createJunctionSpy).not.toHaveBeenCalledWith(baseCtxStub);
    });

    it(' onDoubleClick should update mouse state and forward call to drawline and clearpath', () => {
        service['drawingLine'] = true;
        service['pathData'].push(mouseEvent);
        service.mouseDownCoord = { x: 0, y: 0 };
        const clearPathSpy = spyOn(service, 'clearPath').and.stub();
        const createJunctionSpy = spyOn(service, 'createJunction').and.stub();
        const popSpy = spyOn(service['pathData'], 'pop').and.stub();
        const calculateDistanceSpy = spyOn(service, 'calculateDistance').and.returnValue(10);
        service.onDoubleClick();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(service['drawingLine']).toBeFalse();
        expect(popSpy).toHaveBeenCalled();
        expect(calculateDistanceSpy).toHaveBeenCalled();
        expect(service.mouseClick).toBeFalse();
        expect(drawLineSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(createJunctionSpy).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it(' onDoubleClick should not call pop if distance is greater than 20', () => {
        service['pathData'].push(mouseEvent);
        drawingServiceSpyObj.junctionType = 0;
        service.mouseDownCoord = { x: 50, y: 60 };
        const calculateDistanceSpy = spyOn(service, 'calculateDistance').and.returnValue(50);
        const popSpy = spyOn(service['pathData'], 'pop').and.stub();
        service.onDoubleClick();
        expect(calculateDistanceSpy).toHaveBeenCalled();
        expect(popSpy).not.toHaveBeenCalled();
    });

    it(' onDoubleClick should not call pop if distance is greater than 20', () => {
        service['pathData'].push(mouseEvent);
        drawingServiceSpyObj.junctionType = 1;
        service.mouseDownCoord = { x: 50, y: 60 };
        const calculateDistanceSpy = spyOn(service, 'calculateDistance').and.returnValue(50);
        const popSpy = spyOn(service['pathData'], 'pop').and.stub();
        service.onDoubleClick();
        expect(calculateDistanceSpy).toHaveBeenCalled();
        expect(popSpy).not.toHaveBeenCalled();
    });

    it(' escapeDown should call clearCanvas and clearPath if pathData lenght is not 0', () => {
        service['pathData'].push(mouseEvent);
        const clearPathSpy = spyOn(service, 'clearPath').and.stub();
        service.escapeDown();
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it(' escapeDown should do nothing if imageData length is equal to zero', () => {
        service['pathData'] = [];
        const clearPathSpy = spyOn(service, 'clearPath').and.stub();
        service.escapeDown();
        expect(drawingServiceSpyObj.clearCanvas).not.toHaveBeenCalledWith(previewCtxStub);
        expect(clearPathSpy).not.toHaveBeenCalled();
    });

    it(' shiftDown should update shift status and forward call to drawLines if drawingLine is true and mouseDownCoord isnt equal to last element of pathdata', () => {
        service['drawingLine'] = true;
        service['pathData'].push(mouseEvent);
        service.mouseDownCoord = { x: 0, y: 0 };
        service.shift = false;
        service.shiftDown();
        expect(service.shift).toBeTrue();
        expect(drawLineSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it(' shiftDown should do nothing if drawingLine is false', () => {
        service['drawingLine'] = false;
        service['pathData'].push(mouseEvent);
        service.mouseDownCoord = { x: 0, y: 0 };
        service.shift = false;
        service.shiftDown();
        expect(service.shift).toBeFalse();
        expect(drawLineSpy).not.toHaveBeenCalledWith(previewCtxStub);
    });

    it(' shiftDown should do nothing if mouseDownCoord is equal to last element of pathData', () => {
        service['drawingLine'] = true;
        service['pathData'].push(mouseEvent);
        service.mouseDownCoord = mouseEvent;
        service.shift = false;
        service.shiftDown();
        expect(service.shift).toBeFalse();
        expect(drawLineSpy).not.toHaveBeenCalledWith(previewCtxStub);
    });

    it(' shiftUp should update shift status and call drawLines if drawingLine and shift is true', () => {
        service['pathData'].push(mouseEvent);
        service.mouseDownCoord = mouseEvent;
        service.shift = true;
        service['drawingLine'] = true;
        service.shiftUp();
        expect(service.shift).toBeFalse();
        expect(drawLineSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it(' shiftUp should do nothing if drawingLines is false', () => {
        service['pathData'].push(mouseEvent);
        service.mouseDownCoord = mouseEvent;
        service.shift = true;
        service['drawingLine'] = false;
        service.shiftUp();
        expect(service.shift).toBeTrue();
        expect(drawLineSpy).not.toHaveBeenCalledWith(previewCtxStub);
    });

    it(' shiftUp should do nothing if shift is false', () => {
        service['pathData'].push(mouseEvent);
        service.mouseDownCoord = mouseEvent;
        service.shift = false;
        service['drawingLine'] = true;
        service.shiftUp();
        expect(drawLineSpy).not.toHaveBeenCalledWith(previewCtxStub);
    });

    it(' backspaceDown should call pop and drawlines if pathData lenght is greater than 1', () => {
        service['pathData'].push(mouseEvent);
        service['pathData'].push(mouseEvent);
        service.mouseDownCoord = { x: 5, y: 5 };
        const popSpy = spyOn(service['pathData'], 'pop').and.stub();
        service.backspaceDown();
        expect(popSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it(' backspaceDown should do nothing if pathData length is less than 1', () => {
        service['pathData'].push(mouseEvent);
        service.mouseDownCoord = { x: 5, y: 5 };
        const popSpy = spyOn(service['pathData'], 'pop').and.stub();
        service.backspaceDown();
        expect(popSpy).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalledWith(previewCtxStub);
    });
    it('drawline should call drawingSetup, moveTo, stroke and closePath if writing on base', () => {
        service['pathData'].push(mouseEvent);
        service.mouseDownCoord = { x: 10, y: 25 };
        const drawingSetupSpy = spyOn(service, 'drawingSetup').and.stub();
        const moveToSpy = spyOn(baseCtxStub, 'moveTo').and.stub();
        const strokeSpy = spyOn(baseCtxStub, 'stroke').and.stub();
        const calculateDistanceSpy = spyOn(service, 'calculateDistance').and.returnValue(10);
        service.drawLines(baseCtxStub);
        expect(drawingSetupSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(moveToSpy).toHaveBeenCalledWith(service['pathData'][length].x, service['pathData'][length].y);
        expect(calculateDistanceSpy).toHaveBeenCalled();
        expect(strokeSpy).toHaveBeenCalled();
    });
    it(' drawingSetup should update context and forward call clearCanvas and beginPath', () => {
        const beginPathSpy = spyOn(baseCtxStub, 'beginPath').and.stub();
        drawingServiceSpyObj.primaryColor = '#59d97b';
        drawingServiceSpyObj.lineWidth = 2;
        baseCtxStub.lineWidth = 10;
        baseCtxStub.lineCap = 'square';
        baseCtxStub.fillStyle = '#fff';
        baseCtxStub.strokeStyle = '#fff';
        baseCtxStub.lineJoin = 'bevel';
        service.drawingSetup(baseCtxStub);
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(baseCtxStub.lineWidth).toEqual(drawingServiceSpyObj.lineWidth);
        expect(baseCtxStub.lineCap).toEqual('round');
        expect(baseCtxStub.fillStyle).toEqual('#59d97b');
        expect(baseCtxStub.strokeStyle).toEqual('#59d97b');
        expect(baseCtxStub.lineJoin).toEqual('round');
    });
    it(' clearPath should clear pathData', () => {
        service['pathData'].push({} as MouseEvent);
        service.clearPath();
        expect(service['pathData'].length).toEqual(0);
    });
    it(' createJunction should forward call drawingSetup, ctx.arc() and ctx.fill()', () => {
        service['pathData'].push(mouseEvent);
        service['pathData'].push(mouseEvent);
        service['pathData'].push(mouseEvent);
        drawingServiceSpyObj.junctionType = 1;
        const beginPathSpy = spyOn(baseCtxStub, 'beginPath').and.stub();
        const arcSpy = spyOn(baseCtxStub, 'arc').and.stub();
        const fillSpy = spyOn(baseCtxStub, 'fill').and.stub();
        service.createJunction(baseCtxStub);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(arcSpy).toHaveBeenCalledWith(
            service['pathData'][service['pathData'].length - 1].x,
            service['pathData'][service['pathData'].length - 1].y,
            drawingServiceSpyObj.pointWidth,
            0,
            2 * Math.PI,
        );
        expect(fillSpy).toHaveBeenCalledTimes(3);
    });
    it(' createJunction should do nothing if junctionType is not equal to 1', () => {
        drawingServiceSpyObj.junctionType = 0;
        const beginPathSpy = spyOn(baseCtxStub, 'beginPath').and.stub();
        const arcSpy = spyOn(baseCtxStub, 'arc').and.stub();
        const fillSpy = spyOn(baseCtxStub, 'fill').and.stub();
        service.createJunction(baseCtxStub);
        expect(beginPathSpy).not.toHaveBeenCalled();
        expect(arcSpy).not.toHaveBeenCalledWith();
        expect(fillSpy).not.toHaveBeenCalled();
    });
    it('getCurrentToolString should return line', () => {
        service.getCurrentToolString();
        expect(service.getCurrentToolString()).toEqual('line');
    });
    it('calculateAngle should return 90 if difX and digY are 0', () => {
        expect(service.calculateAngle([{ x: 0, y: 0 }], { x: 0, y: 0 })).toEqual(ANGLE_90);
    });
    it('calculateAngle should return 270 if difX is 0 and digY is negative', () => {
        expect(service.calculateAngle([{ x: 0, y: 0 }], { x: 0, y: -1 })).toEqual(ANGLE_270);
    });
    it('calculateAngle should return 225 if difX is -1 and digY is 1', () => {
        expect(service.calculateAngle([{ x: 0, y: 0 }], { x: -1, y: 1 })).toEqual(ANGLE_180 + ANGLE_90 / 2);
    });
    it('calculateAngle should return 315 if difX and digY are 1', () => {
        expect(service.calculateAngle([{ x: 0, y: 0 }], { x: 1, y: 1 })).toEqual(ANGLE_360 - ANGLE_90 / 2);
    });
    it(' calcNewPoint should return the value of the newpoint which is in the 1st, 5th or 9th octan', () => {
        const roundSpy = spyOn<any>(Math, 'round').and.returnValue(Octan.Premier);
        expect(service.calcNewPoint([P1], P2)).toEqual({ x: P2.x, y: P1.y });
        roundSpy.and.returnValue(Octan.Cinquieme);
        expect(service.calcNewPoint([P1], P2)).toEqual({ x: P2.x, y: P1.y });
        roundSpy.and.returnValue(Octan.Neuvieme);
        expect(service.calcNewPoint([P1], P2)).toEqual({ x: P2.x, y: P1.y });
    });
    it(' calcNewPoint should return the value of the newpoint which is in the 2nd octan', () => {
        spyOn<any>(Math, 'round').and.returnValue(Octan.Deuxieme);
        expect(service.calcNewPoint([P1], P2)).toEqual({ x: P2.x, y: P1.y - Math.tan(Math.PI / 4) * (P2.x - P1.x) });
    });
    it(' calcNewPoint should return the value of the newpoint which is in the 3rd or 7th octan', () => {
        const roundSpy = spyOn<any>(Math, 'round').and.returnValue(Octan.Troisieme);
        expect(service.calcNewPoint([P1], P2)).toEqual({ x: P1.x, y: P2.y });
        roundSpy.and.returnValue(Octan.Septieme);
        expect(service.calcNewPoint([P1], P2)).toEqual({ x: P1.x, y: P2.y });
    });
    it(' calcNewPoint should return the value of the newpoint which is in the 4th octan', () => {
        spyOn<any>(Math, 'round').and.returnValue(Octan.Quatrieme);
        expect(service.calcNewPoint([P1], P2)).toEqual({ x: P2.x, y: P1.y - Math.tan((3 * Math.PI) / 4) * (P2.x - P1.x) });
    });
    it(' calcNewPoint should return the value of the newpoint which is in the 6th octan', () => {
        spyOn<any>(Math, 'round').and.returnValue(Octan.Sixieme);
        expect(service.calcNewPoint([P1], P2)).toEqual({ x: P2.x, y: P1.y - Math.tan((5 * Math.PI) / 4) * (P2.x - P1.x) });
    });
    it(' calcNewPoint should return the value of the newpoint which is in the 8th octan', () => {
        spyOn<any>(Math, 'round').and.returnValue(Octan.Huitieme);
        expect(service.calcNewPoint([P1], P2)).toEqual({ x: P2.x, y: P1.y - Math.tan((7 * Math.PI) / 4) * (P2.x - P1.x) });
    });
});

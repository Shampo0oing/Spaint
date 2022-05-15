import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PolygonService } from './polygon.service';

// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers
// tslint:disable: variable-name
// tslint:disable: max-file-line-count
describe('PolygonService', () => {
    let service: PolygonService;
    let mouseEvent: MouseEvent;

    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(PolygonService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
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

    it(' onMouseMove should update mouse location', () => {
        drawingServiceSpy.mouseDown = false;
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        const updateAndDrawSpy = spyOn(service, 'updateAndDraw').and.stub();
        const placeCircleSpy = spyOn(service, 'placeCircle').and.stub();
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(service['lastMousePos']).toEqual(getPositionFromMouseSpy(mouseEvent));
        expect(updateAndDrawSpy).not.toHaveBeenCalled();
        expect(placeCircleSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should update mouse location and call drawPolygon and placeCircle if mouseDown is true', () => {
        drawingServiceSpy.mouseDown = true;
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        const updateAndDrawSpy = spyOn(service, 'updateAndDraw').and.stub();
        const placeCircleSpy = spyOn(service, 'placeCircle').and.stub();
        service.onMouseMove(mouseEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(service['lastMousePos']).toEqual(getPositionFromMouseSpy(mouseEvent));
        expect(updateAndDrawSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(placeCircleSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it(' onMouseDown should call clearCanvas and update mouseDownCoord', () => {
        drawingServiceSpy.mouseDown = false;
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        service.onMouseDown(mouseEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(service.mouseDownCoord).toEqual(getPositionFromMouseSpy(mouseEvent));
    });

    it(' onMouseDown should do nothing if mouseDown is true', () => {
        drawingServiceSpy.mouseDown = true;
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        service.onMouseDown(mouseEvent);
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(getPositionFromMouseSpy).not.toHaveBeenCalled();
    });

    it(' onMouseUp should call clearCanvas and drawPolygon and update mouseDown', () => {
        drawingServiceSpy.mouseDown = true;
        const updateAndDrawSpy = spyOn(service, 'updateAndDraw').and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(updateAndDrawSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(drawingServiceSpy.mouseDown).toEqual(false);
    });

    it(' onMouseUp should do nothing if mouseDown is false', () => {
        drawingServiceSpy.mouseDown = false;
        const updateAndDrawSpy = spyOn(service, 'updateAndDraw').and.stub();
        service.onMouseUp(mouseEvent);
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(updateAndDrawSpy).not.toHaveBeenCalled();
    });

    it(' drawPolygon should call drawingSetup, updateMin, traceType and drawPolygon_3Edges if the number of edges is 3', () => {
        drawingServiceSpy.numberOfEdges = 3;
        const drawingSetupSpy = spyOn(service, 'drawingSetup').and.stub();
        const updateMinSpy = spyOn(service, 'updateMin').and.stub();

        const traceTypeSpy = spyOn(service, 'traceType').and.stub();
        const drawPolygon_3EdgesSpy = spyOn(service, 'drawPolygon_3Edges').and.stub();
        service.updateAndDraw(baseCtxStub);
        expect(drawingSetupSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(updateMinSpy).toHaveBeenCalled();
        expect(drawPolygon_3EdgesSpy).toHaveBeenCalledWith(baseCtxStub);

        expect(traceTypeSpy).toHaveBeenCalledWith(baseCtxStub, drawingServiceSpy.traceTypePolygon);
    });

    it(' drawPolygon should call drawPolygon_4Edges if the number of edges is 4', () => {
        drawingServiceSpy.numberOfEdges = 4;
        const drawingSetupSpy = spyOn(service, 'drawingSetup').and.stub();
        const updateMinSpy = spyOn(service, 'updateMin').and.stub();

        const traceTypeSpy = spyOn(service, 'traceType').and.stub();
        const drawPolygon_4EdgesSpy = spyOn(service, 'drawPolygon_4Edges').and.stub();
        service.updateAndDraw(baseCtxStub);
        expect(drawingSetupSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(updateMinSpy).toHaveBeenCalled();
        expect(drawPolygon_4EdgesSpy).toHaveBeenCalledWith(baseCtxStub);

        expect(traceTypeSpy).toHaveBeenCalledWith(baseCtxStub, drawingServiceSpy.traceTypePolygon);
    });

    it(' drawPolygon should call drawPolygon_5Edges if the number of edges is 5', () => {
        drawingServiceSpy.numberOfEdges = 5;
        const drawingSetupSpy = spyOn(service, 'drawingSetup').and.stub();
        const updateMinSpy = spyOn(service, 'updateMin').and.stub();

        const traceTypeSpy = spyOn(service, 'traceType').and.stub();
        const drawPolygon_5EdgesSpy = spyOn(service, 'drawPolygon_5Edges').and.stub();
        service.updateAndDraw(baseCtxStub);
        expect(drawPolygon_5EdgesSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(drawingSetupSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(updateMinSpy).toHaveBeenCalled();

        expect(traceTypeSpy).toHaveBeenCalledWith(baseCtxStub, drawingServiceSpy.traceTypePolygon);
    });

    it(' drawPolygon should call drawPolygon_6Edges if the number of edges is 6', () => {
        drawingServiceSpy.numberOfEdges = 6;
        const drawingSetupSpy = spyOn(service, 'drawingSetup').and.stub();
        const updateMinSpy = spyOn(service, 'updateMin').and.stub();

        const traceTypeSpy = spyOn(service, 'traceType').and.stub();
        const drawPolygon_6EdgesSpy = spyOn(service, 'drawPolygon_6Edges').and.stub();
        service.updateAndDraw(baseCtxStub);
        expect(drawPolygon_6EdgesSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(drawingSetupSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(updateMinSpy).toHaveBeenCalled();

        expect(traceTypeSpy).toHaveBeenCalledWith(baseCtxStub, drawingServiceSpy.traceTypePolygon);
    });

    it(' drawPolygon should call drawPolygon_7Edges if the number of edges is 7', () => {
        drawingServiceSpy.numberOfEdges = 7;
        const drawingSetupSpy = spyOn(service, 'drawingSetup').and.stub();
        const updateMinSpy = spyOn(service, 'updateMin').and.stub();

        const traceTypeSpy = spyOn(service, 'traceType').and.stub();
        const drawPolygon_7EdgesSpy = spyOn(service, 'drawPolygon_7Edges').and.stub();
        service.updateAndDraw(baseCtxStub);
        expect(drawPolygon_7EdgesSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(drawingSetupSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(updateMinSpy).toHaveBeenCalled();

        expect(traceTypeSpy).toHaveBeenCalledWith(baseCtxStub, drawingServiceSpy.traceTypePolygon);
    });

    it(' drawPolygon should call drawPolygon_8Edges if the number of edges is 8', () => {
        drawingServiceSpy.numberOfEdges = 8;
        const drawingSetupSpy = spyOn(service, 'drawingSetup').and.stub();
        const updateMinSpy = spyOn(service, 'updateMin').and.stub();

        const traceTypeSpy = spyOn(service, 'traceType').and.stub();
        const drawPolygon_8EdgesSpy = spyOn(service, 'drawPolygon_8Edges').and.stub();
        service.updateAndDraw(baseCtxStub);
        expect(drawPolygon_8EdgesSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(drawingSetupSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(updateMinSpy).toHaveBeenCalled();
        expect(traceTypeSpy).toHaveBeenCalledWith(baseCtxStub, drawingServiceSpy.traceTypePolygon);
    });

    it(' drawPolygon should call drawPolygon_9Edges if the number of edges is 9', () => {
        drawingServiceSpy.numberOfEdges = 9;
        const drawingSetupSpy = spyOn(service, 'drawingSetup').and.stub();
        const updateMinSpy = spyOn(service, 'updateMin').and.stub();

        const traceTypeSpy = spyOn(service, 'traceType').and.stub();
        const drawPolygon_9EdgesSpy = spyOn(service, 'drawPolygon_9Edges').and.stub();
        service.updateAndDraw(baseCtxStub);
        expect(drawPolygon_9EdgesSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(drawingSetupSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(updateMinSpy).toHaveBeenCalled();
        expect(traceTypeSpy).toHaveBeenCalledWith(baseCtxStub, drawingServiceSpy.traceTypePolygon);
    });

    it(' drawPolygon should call drawPolygon_10Edges if the number of edges is 10', () => {
        drawingServiceSpy.numberOfEdges = 10;
        const drawingSetupSpy = spyOn(service, 'drawingSetup').and.stub();
        const updateMinSpy = spyOn(service, 'updateMin').and.stub();

        const traceTypeSpy = spyOn(service, 'traceType').and.stub();
        const drawPolygon_10EdgesSpy = spyOn(service, 'drawPolygon_10Edges').and.stub();
        service.updateAndDraw(baseCtxStub);
        expect(drawPolygon_10EdgesSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(drawingSetupSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(updateMinSpy).toHaveBeenCalled();
        expect(traceTypeSpy).toHaveBeenCalledWith(baseCtxStub, drawingServiceSpy.traceTypePolygon);
    });

    it(' drawPolygon should call drawPolygon_11Edges if the number of edges is 11', () => {
        drawingServiceSpy.numberOfEdges = 11;
        const drawingSetupSpy = spyOn(service, 'drawingSetup').and.stub();
        const updateMinSpy = spyOn(service, 'updateMin').and.stub();

        const traceTypeSpy = spyOn(service, 'traceType').and.stub();
        const drawPolygon_11EdgesSpy = spyOn(service, 'drawPolygon_11Edges').and.stub();
        service.updateAndDraw(baseCtxStub);
        expect(drawPolygon_11EdgesSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(drawingSetupSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(updateMinSpy).toHaveBeenCalled();
        expect(traceTypeSpy).toHaveBeenCalledWith(baseCtxStub, drawingServiceSpy.traceTypePolygon);
    });

    it(' drawPolygon should call drawPolygon_12Edges if the number of edges is 12', () => {
        drawingServiceSpy.numberOfEdges = 12;
        const drawingSetupSpy = spyOn(service, 'drawingSetup').and.stub();
        const updateMinSpy = spyOn(service, 'updateMin').and.stub();

        const traceTypeSpy = spyOn(service, 'traceType').and.stub();
        const drawPolygon_12EdgesSpy = spyOn(service, 'drawPolygon_12Edges').and.stub();
        service.updateAndDraw(baseCtxStub);
        expect(drawPolygon_12EdgesSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(drawingSetupSpy).toHaveBeenCalledWith(baseCtxStub);
        expect(updateMinSpy).toHaveBeenCalled();
        expect(traceTypeSpy).toHaveBeenCalledWith(baseCtxStub, drawingServiceSpy.traceTypePolygon);
    });

    it(' updateMin should update width, height and min and forward call setNewPoint', () => {
        service['lastMousePos'] = { x: 4, y: 4 };
        service['mouseDownCoord'] = { x: 2, y: 3 };
        const setNewPointSpy = spyOn(service, 'setNewPoint');
        service.updateMin();
        expect(service['width']).toEqual(service['lastMousePos'].x - service['mouseDownCoord'].x);
        expect(service['height']).toEqual(service['lastMousePos'].y - service['mouseDownCoord'].y);
        expect(service['min']).toEqual(Math.min(Math.abs(service['width']), Math.abs(service['height'])));
        expect(setNewPointSpy).toHaveBeenCalled();
    });

    it(' setNewPoint should update newPoint0', () => {
        service['newPoint'] = { x: 0, y: 0 };
        service['mouseDownCoord'] = { x: 2, y: 2 };
        service['min'] = 2;
        service['width'] = -1;
        service['height'] = 0;

        service.setNewPoint();
        expect(service['newPoint'].x).toEqual(service['mouseDownCoord'].x - service['min'] / 2);
        expect(service['newPoint'].y).toEqual(service['mouseDownCoord'].y + service['min'] / 2);
    });

    it(' setNewPoint should update newPoint1', () => {
        service['newPoint'] = { x: 0, y: 0 };
        service['mouseDownCoord'] = { x: 2, y: 2 };
        service['min'] = 2;
        service['width'] = 0;
        service['height'] = -1;

        service.setNewPoint();
        expect(service['newPoint'].x).toEqual(service['mouseDownCoord'].x + service['min'] / 2);
        expect(service['newPoint'].y).toEqual(service['mouseDownCoord'].y - service['min'] / 2);
    });

    it(' setNewPoint should update newPoint2', () => {
        service['newPoint'] = { x: 0, y: 0 };
        service['mouseDownCoord'] = { x: 2, y: 2 };
        service['min'] = 2;
        service['width'] = 0;
        service['height'] = 0;

        service.setNewPoint();
        expect(service['newPoint'].x).toEqual(service['mouseDownCoord'].x + service['min'] / 2);
        expect(service['newPoint'].y).toEqual(service['mouseDownCoord'].y + service['min'] / 2);
    });

    it(' setNewPoint should update newPoint3', () => {
        service['newPoint'] = { x: 0, y: 0 };
        service['mouseDownCoord'] = { x: 2, y: 2 };
        service['min'] = 2;
        service['width'] = -1;
        service['height'] = -1;

        service.setNewPoint();
        expect(service['newPoint'].x).toEqual(service['mouseDownCoord'].x - service['min'] / 2);
        expect(service['newPoint'].y).toEqual(service['mouseDownCoord'].y - service['min'] / 2);
    });

    it(' drawPolygon_3edges should call closePath, moveTo and lineTo 2 times', () => {
        service['min'] = 10;
        service['newPoint'] = { x: 1, y: 1 };
        const x1: number = ((service['min'] / 2) * Math.sin((2 * Math.PI) / 3)) / Math.sin(Math.PI / 6);
        const x2: number = Math.cos(Math.PI / 3) * x1;
        const x3: number = Math.tan(Math.PI / 6) * x2;
        const moveToSpy = spyOn(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(baseCtxStub, 'lineTo').and.stub();
        const closePathSpy = spyOn(baseCtxStub, 'closePath').and.stub();
        service.drawPolygon_3Edges(baseCtxStub);
        expect(moveToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y - service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x2, service['newPoint'].y + x3);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x2, service['newPoint'].y + x3);
        expect(closePathSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalledTimes(2);
    });

    it(' drawPolygon_4edges should call closePath, moveTo and lineTo 3 times', () => {
        service['min'] = 10;
        service['newPoint'] = { x: 1, y: 1 };
        const x1: number = Math.cos(Math.PI / 4) * (service['min'] / 2);
        const moveToSpy = spyOn(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(baseCtxStub, 'lineTo').and.stub();
        const closePathSpy = spyOn(baseCtxStub, 'closePath').and.stub();
        service.drawPolygon_4Edges(baseCtxStub);
        expect(moveToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1, service['newPoint'].y - x1);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1, service['newPoint'].y + x1);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1, service['newPoint'].y + x1);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1, service['newPoint'].y - x1);
        expect(closePathSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalledTimes(3);
    });
    it(' drawPolygon_5edges should call moveTo and lineTo 4 times', () => {
        service['min'] = 10;
        service['newPoint'] = { x: 1, y: 1 };
        const x1: number = (Math.sin((2 / 5) * Math.PI) * (service['min'] / 2)) / Math.sin((3 / 10) * Math.PI);
        const x2: number = x1 / 2 / Math.tan(Math.PI / 5);
        const x3: number = x1 * Math.sin((3 / 10) * Math.PI);
        const x4: number = x3 / Math.tan((2 / 5) * Math.PI);
        const moveToSpy = spyOn(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(baseCtxStub, 'lineTo').and.stub();
        const closePathSpy = spyOn(baseCtxStub, 'closePath').and.stub();
        service.drawPolygon_5Edges(baseCtxStub);
        expect(moveToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y - service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x3, service['newPoint'].y - x4);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1 / 2, service['newPoint'].y + x2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1 / 2, service['newPoint'].y + x2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x3, service['newPoint'].y - x4);
        expect(closePathSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalledTimes(4);
    });
    it(' drawPolygon_6edges should call moveTo and lineTo 5 times', () => {
        service['min'] = 10;
        service['newPoint'] = { x: 1, y: 1 };
        const x1: number = Math.cos(Math.PI / 6) * (service['min'] / 2);
        const moveToSpy = spyOn(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(baseCtxStub, 'lineTo').and.stub();
        const closePathSpy = spyOn(baseCtxStub, 'closePath').and.stub();
        service.drawPolygon_6Edges(baseCtxStub);
        expect(moveToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y - service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1, service['newPoint'].y - service['min'] / 4);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1, service['newPoint'].y + service['min'] / 4);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y + service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1, service['newPoint'].y + service['min'] / 4);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1, service['newPoint'].y - service['min'] / 4);
        expect(closePathSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalledTimes(5);
    });
    it(' drawPolygon_7edges should call moveTo and lineTo 6 times', () => {
        service['min'] = 10;
        service['newPoint'] = { x: 1, y: 1 };
        const x1: number = (service['min'] / 2) * Math.sin((2 / 7) * Math.PI);
        const x2: number = x1 / Math.tan((5 / 14) * Math.PI);
        const x3: number = (service['min'] / 2) * Math.cos((3 / 7) * Math.PI);
        const x4: number = (service['min'] / 2) * Math.sin((3 / 7) * Math.PI);
        const x5: number = (service['min'] / 2) * Math.sin(Math.PI / 7);
        const x6: number = (service['min'] / 2) * Math.cos(Math.PI / 7);
        const moveToSpy = spyOn(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(baseCtxStub, 'lineTo').and.stub();
        const closePathSpy = spyOn(baseCtxStub, 'closePath').and.stub();
        service.drawPolygon_7Edges(baseCtxStub);
        expect(moveToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y - service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1, service['newPoint'].y - service['min'] / 2 + x2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x4, service['newPoint'].y + x3);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x5, service['newPoint'].y + x6);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x5, service['newPoint'].y + x6);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x4, service['newPoint'].y + x3);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1, service['newPoint'].y - service['min'] / 2 + x2);
        expect(closePathSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalledTimes(6);
    });
    it(' drawPolygon_8edges should call moveTo and lineTo 7 times', () => {
        service['min'] = 10;
        service['newPoint'] = { x: 1, y: 1 };
        const x1: number = Math.sin(Math.PI / 4) * (service['min'] / 2);
        const x2: number = Math.cos(Math.PI / 4) * (service['min'] / 2);
        const moveToSpy = spyOn(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(baseCtxStub, 'lineTo').and.stub();
        const closePathSpy = spyOn(baseCtxStub, 'closePath').and.stub();
        service.drawPolygon_8Edges(baseCtxStub);
        expect(moveToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y - service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1, service['newPoint'].y - x2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + service['min'] / 2, service['newPoint'].y);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1, service['newPoint'].y + x2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y + service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1, service['newPoint'].y + x2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - service['min'] / 2, service['newPoint'].y);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1, service['newPoint'].y - x2);
        expect(closePathSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalledTimes(7);
    });
    it(' drawPolygon_9edges should call moveTo and lineTo 2 times', () => {
        service['min'] = 10;
        service['newPoint'] = { x: 1, y: 1 };
        const x1: number = ((service['min'] / 2) * Math.sin((2 / 9) * Math.PI)) / Math.sin((7 / 18) * Math.PI);
        const x2: number = (service['min'] / 2) * Math.sin((2 / 9) * Math.PI);
        const x3: number = (service['min'] / 2) * Math.cos((2 / 9) * Math.PI);
        const x4: number = (service['min'] / 2) * Math.sin((4 / 9) * Math.PI);
        const x5: number = (service['min'] / 2) * Math.cos((4 / 9) * Math.PI);
        const x6: number = (service['min'] / 2) * Math.sin(Math.PI / 3);
        const x7: number = (service['min'] / 2) * Math.cos(Math.PI / 3);
        const x8: number = (service['min'] / 2) * Math.sin((7 / 18) * Math.PI);
        const moveToSpy = spyOn(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(baseCtxStub, 'lineTo').and.stub();
        const closePathSpy = spyOn(baseCtxStub, 'closePath').and.stub();
        service.drawPolygon_9Edges(baseCtxStub);
        expect(moveToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y - service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x2, service['newPoint'].y - x3);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x4, service['newPoint'].y - x5);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x6, service['newPoint'].y + x7);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1 / 2, service['newPoint'].y + x8);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1 / 2, service['newPoint'].y + x8);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x6, service['newPoint'].y + x7);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x4, service['newPoint'].y - x5);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x2, service['newPoint'].y - x3);
        expect(closePathSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalledTimes(8);
    });

    it(' drawPolygon_10edges should call moveTo and lineTo 2 times', () => {
        service['min'] = 10;
        service['newPoint'] = { x: 1, y: 1 };
        const x1: number = (Math.sin(Math.PI / 4) * (service['min'] / 2)) / Math.sin((3 * Math.PI) / 8);
        const x2: number = Math.cos(Math.PI / 10) * (service['min'] / 2);
        const x3: number = Math.sin(Math.PI / 5) * (service['min'] / 2);
        const x4: number = Math.cos(Math.PI / 5) * (service['min'] / 2);
        const moveToSpy = spyOn(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(baseCtxStub, 'lineTo').and.stub();
        const closePathSpy = spyOn(baseCtxStub, 'closePath').and.stub();
        service.drawPolygon_10Edges(baseCtxStub);
        expect(moveToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y - service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x3, service['newPoint'].y - x4);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x2, service['newPoint'].y - x1 / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x2, service['newPoint'].y + x1 / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x3, service['newPoint'].y + x4);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y + service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x3, service['newPoint'].y + x4);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x2, service['newPoint'].y + x1 / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x2, service['newPoint'].y - x1 / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x3, service['newPoint'].y - x4);
        expect(closePathSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalledTimes(9);
    });

    it(' drawPolygon_11edges should call moveTo and lineTo 2 times', () => {
        service['min'] = 10;
        service['newPoint'] = { x: 1, y: 1 };
        const x1: number = ((service['min'] / 2) * Math.sin((2 / 11) * Math.PI)) / Math.sin((5 / 11) * Math.PI);
        const x2: number = (service['min'] / 2) * Math.cos((2 / 11) * Math.PI);
        const x3: number = (service['min'] / 2) * Math.sin((2 / 11) * Math.PI);
        const x4: number = (service['min'] / 2) * Math.sin((4 / 11) * Math.PI);
        const x5: number = (service['min'] / 2) * Math.cos((4 / 11) * Math.PI);
        const x6: number = (service['min'] / 2) * Math.sin((5 / 11) * Math.PI);
        const x7: number = (service['min'] / 2) * Math.cos((5 / 11) * Math.PI);
        const x8: number = (service['min'] / 2) * Math.sin((3 / 11) * Math.PI);
        const x9: number = (service['min'] / 2) * Math.cos((3 / 11) * Math.PI);
        const x10: number = (service['min'] / 2) * Math.cos(Math.PI / 11);
        const moveToSpy = spyOn(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(baseCtxStub, 'lineTo').and.stub();
        const closePathSpy = spyOn(baseCtxStub, 'closePath').and.stub();
        service.drawPolygon_11Edges(baseCtxStub);
        expect(moveToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y - service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x3, service['newPoint'].y - x2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x4, service['newPoint'].y - x5);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x6, service['newPoint'].y + x7);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x8, service['newPoint'].y + x9);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1 / 2, service['newPoint'].y + x10);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1 / 2, service['newPoint'].y + x10);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x8, service['newPoint'].y + x9);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x6, service['newPoint'].y + x7);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x4, service['newPoint'].y - x5);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x3, service['newPoint'].y - x2);
        expect(closePathSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalledTimes(10);
    });

    it(' drawPolygon_12edges should call moveTo and lineTo 2 times', () => {
        service['min'] = 10;
        service['newPoint'] = { x: 1, y: 1 };
        const x1: number = Math.sin(Math.PI / 6) * (service['min'] / 2);
        const x2: number = Math.cos(Math.PI / 6) * (service['min'] / 2);
        const moveToSpy = spyOn(baseCtxStub, 'moveTo').and.stub();
        const lineToSpy = spyOn(baseCtxStub, 'lineTo').and.stub();
        const closePathSpy = spyOn(baseCtxStub, 'closePath').and.stub();
        service.drawPolygon_12Edges(baseCtxStub);
        expect(moveToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y - service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1, service['newPoint'].y - x2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x2, service['newPoint'].y - x1);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + service['min'] / 2, service['newPoint'].y);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x2, service['newPoint'].y + x1);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x + x1, service['newPoint'].y + x2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x, service['newPoint'].y + service['min'] / 2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1, service['newPoint'].y + x2);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x2, service['newPoint'].y + x1);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - service['min'] / 2, service['newPoint'].y);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x2, service['newPoint'].y - x1);
        expect(lineToSpy).toHaveBeenCalledWith(service['newPoint'].x - x1, service['newPoint'].y - x2);
        expect(closePathSpy).toHaveBeenCalled();
        expect(lineToSpy).toHaveBeenCalledTimes(11);
    });

    it(' placeCircle should update strokeStyle, lineWidth call beginPath, setLineDash, updateMin, ellipse, stroke and setLineDash', () => {
        const DEFAULT_LINE_WIDTH = 3;
        const beginPathSpy = spyOn(baseCtxStub, 'beginPath').and.stub();
        const setLineDashSpy = spyOn(baseCtxStub, 'setLineDash').and.stub();
        const ellipseSpy = spyOn(baseCtxStub, 'ellipse').and.stub();
        const strokeSpy = spyOn(baseCtxStub, 'stroke').and.stub();
        const updateMinSpy = spyOn(service, 'updateMin').and.stub();
        service['newPoint'] = { x: 1, y: 1 };

        baseCtxStub.strokeStyle = '#fff';

        service.placeCircle(baseCtxStub);
        expect(baseCtxStub.strokeStyle).toEqual('#000000');
        expect(beginPathSpy).toHaveBeenCalled();
        expect(setLineDashSpy).toHaveBeenCalledWith([5, 15]);
        expect(baseCtxStub.lineWidth).toEqual(DEFAULT_LINE_WIDTH);
        expect(updateMinSpy).toHaveBeenCalled();
        expect(ellipseSpy).toHaveBeenCalledWith(
            service['newPoint'].x,
            service['newPoint'].y,
            service['min'] / 2,
            service['min'] / 2,
            0,
            0,
            2 * Math.PI,
        );
        expect(strokeSpy).toHaveBeenCalled();
        expect(setLineDashSpy).toHaveBeenCalled();
    });

    it('traceType should call stroke if traceTypePolygon equal 0', () => {
        const strokeSpy = spyOn(baseCtxStub, 'stroke').and.stub();
        drawingServiceSpy.traceTypePolygon = 0;
        service.traceType(baseCtxStub, drawingServiceSpy.traceTypePolygon);
        expect(strokeSpy).toHaveBeenCalled();
    });
    it('traceType should update fillStyle and forward call fill if traceTypePolygon equal 1', () => {
        const fillSpy = spyOn(baseCtxStub, 'fill').and.stub();
        drawingServiceSpy.traceTypePolygon = 1;
        drawingServiceSpy.primaryColor = '#000000';
        baseCtxStub.fillStyle = '#123123';
        service.traceType(baseCtxStub, drawingServiceSpy.traceTypePolygon);
        expect(fillSpy).toHaveBeenCalled();
        expect(baseCtxStub.fillStyle).toEqual(drawingServiceSpy.primaryColor);
    });
    it('traceType should update fillStyle and strokeStyle and forward call fill and stroke if traceTypePolygon equal 2', () => {
        const strokeSpy = spyOn(baseCtxStub, 'stroke').and.stub();
        const fillSpy = spyOn(baseCtxStub, 'fill').and.stub();
        drawingServiceSpy.traceTypePolygon = 2;
        drawingServiceSpy.primaryColor = '#000000';
        drawingServiceSpy.secondaryColor = '#000000';
        baseCtxStub.fillStyle = '#123123';
        baseCtxStub.strokeStyle = '#123123';
        service.traceType(baseCtxStub, drawingServiceSpy.traceTypePolygon);
        expect(strokeSpy).toHaveBeenCalled();
        expect(fillSpy).toHaveBeenCalled();
        expect(baseCtxStub.fillStyle).toEqual(drawingServiceSpy.primaryColor);
        expect(baseCtxStub.strokeStyle).toEqual(drawingServiceSpy.secondaryColor);
    });

    it('drawingSetup should call beginPath and set lineWidth, strokeStyle, lineCap and lineJoin ', () => {
        const beginPathSpy = spyOn(baseCtxStub, 'beginPath').and.stub();
        drawingServiceSpy.polygonWidth = 2;
        drawingServiceSpy.secondaryColor = '#000000';
        baseCtxStub.lineWidth = 3;
        baseCtxStub.strokeStyle = '#123123';
        baseCtxStub.lineCap = 'round';
        baseCtxStub.lineJoin = 'round';
        service.drawingSetup(baseCtxStub);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(baseCtxStub.lineWidth).toEqual(drawingServiceSpy.polygonWidth);
        expect(baseCtxStub.strokeStyle).toEqual(drawingServiceSpy.secondaryColor);
        expect(baseCtxStub.lineCap).toEqual('square');
        expect(baseCtxStub.lineJoin).toEqual('miter');
    });

    it('getCurrentToolString should return polygon', () => {
        service.getCurrentToolString();
        expect(service.getCurrentToolString()).toEqual('polygon');
    });
});

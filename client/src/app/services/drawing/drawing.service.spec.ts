import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BLUE, GREEN, OPACITY, RED, WHITE } from '@app/classes/constantes';
import { DrawingService } from './drawing.service';
// tslint:disable: no-magic-numbers
// tslint:disable:no-any
describe('DrawingService', () => {
    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.gridCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('clearCanvas should clear the whole sliderCanvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('clearCanvas should call drawGrid if showGrid is true and the context is previewCtx', () => {
        const drawGridSpy = spyOn<any>(service, 'drawGrid').and.stub();
        service.showGrid = true;
        service.clearCanvas(service.previewCtx);
        expect(drawGridSpy).toHaveBeenCalled();
    });

    it('swap color should swap primary and secondary colors', () => {
        const expectedResult1 = '#223344';
        const expectedResult2 = '#112233';
        service.primaryColor = expectedResult1;
        service.secondaryColor = expectedResult2;
        service.swapColors();
        expect(service.secondaryColor).toEqual(expectedResult1);
        expect(service.primaryColor).toEqual(expectedResult2);
    });

    it('drawGrid should call lineTo the right amount of times', () => {
        const lineToSpy = spyOn<any>(service.previewCtx, 'lineTo').and.stub();
        const squareSize = 10;
        service.squareSize = squareSize;
        service.canvas.width = service.canvas.height = squareSize * squareSize;
        service.drawGrid();
        expect(lineToSpy).toHaveBeenCalledTimes(squareSize + squareSize - 2);
    });

    it(' drawImageDataOnBaseCtx should draw an ImageData on the base ctx', () => {
        const canvasStub = {
            width: 5,
            height: 5,
            getContext: {},
            remove: {},
        } as HTMLCanvasElement;
        const creatElementSpy = spyOn(document, 'createElement').and.returnValue(canvasStub);
        const baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        const getContextSpy = spyOn(canvasStub, 'getContext').and.returnValue(baseCtxStub);
        const clearCanvasSpy = spyOn(service, 'clearCanvas').and.stub();
        const putImageData1Spy = spyOn(baseCtxStub, 'putImageData').and.stub();
        const putImageData2Spy = spyOn(service.previewCtx, 'putImageData').and.stub();
        const drawImageSpy = spyOn(service.baseCtx, 'drawImage').and.stub();
        const removeSpy = spyOn(canvasStub, 'remove').and.stub();
        service.drawImageDataOnBaseCtx({ x: 5, y: 3 }, { x: 10, y: 15 }, new ImageData(5, 3));
        expect(creatElementSpy).toHaveBeenCalled();
        expect(getContextSpy).toHaveBeenCalled();
        expect(clearCanvasSpy).toHaveBeenCalledTimes(2);
        expect(putImageData1Spy).toHaveBeenCalled();
        expect(putImageData2Spy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalledWith(canvasStub, 5, 3);
        expect(removeSpy).toHaveBeenCalled();
    });

    it(' makeInvisible should replace data color if black', () => {
        const imagePosition = { x: 10, y: 10 };
        const imageDimension = { x: 10, y: 10 };
        const pathData = [{ x: 0, y: 0 }];
        const data = new Uint8ClampedArray(4);
        data[RED] = data[GREEN] = data[BLUE] = 0;
        data[OPACITY] = WHITE;
        const newData = new Uint8ClampedArray(4);
        newData[RED] = newData[GREEN] = newData[BLUE] = newData[OPACITY] = 255;
        spyOn(service.previewCtx, 'getImageData').and.returnValue({ data } as ImageData);
        spyOn(service.baseCtx, 'putImageData').and.stub();
        service.makeInvisible({ data: newData } as ImageData, imagePosition, imageDimension, pathData);
        expect(data[RED]).toEqual(newData[RED]);
        expect(data[GREEN]).toEqual(newData[GREEN]);
        expect(data[BLUE]).toEqual(newData[BLUE]);
    });

    it(' makeInvisible should call clearCanvas twice', () => {
        const pathData = [{ x: 0, y: 0 }];
        const imageData = {} as ImageData;
        const imagePosition = { x: 10, y: 10 };
        const imageDimension = { x: 10, y: 10 };
        const clearCanvasSpy = spyOn(service, 'clearCanvas').and.stub();
        spyOn<any>(service.baseCtx, 'putImageData').and.stub();
        service.makeInvisible(imageData, imagePosition, imageDimension, pathData);
        expect(clearCanvasSpy).toHaveBeenCalledTimes(2);
    });

    it(' changePositionAndDImensions UPPERLEFT status = 1', () => {
        const imageDataPosition = { x: 10, y: 10 };
        const imageDataDimension = { x: 10, y: 10 };
        const lastMousePos = { x: 20, y: 20 };
        const status = 1;
        const expectedResult = 20;
        service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        const RESULT = service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        expect(RESULT.x).toEqual(expectedResult);
    });

    it(' changePositionAndDImensions UPPERMIDDLE status = 2', () => {
        const imageDataPosition = { x: 10, y: 10 };
        const imageDataDimension = { x: 10, y: 10 };
        const lastMousePos = { x: 20, y: 20 };
        const status = 2;
        const expectedResult = 15;
        service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        const RESULT = service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        expect(RESULT.x).toEqual(expectedResult);
    });

    it(' changePositionAndDImensions UPPERRIGHT status = 3', () => {
        const imageDataPosition = { x: 10, y: 10 };
        const imageDataDimension = { x: 10, y: 10 };
        const lastMousePos = { x: 20, y: 20 };
        const status = 3;
        const expectedResult = 10;
        service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        const RESULT = service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        expect(RESULT.x).toEqual(expectedResult);
    });

    it(' changePositionAndDImensions MIDDLELEFT status = 4', () => {
        const imageDataPosition = { x: 10, y: 10 };
        const imageDataDimension = { x: 10, y: 10 };
        const lastMousePos = { x: 20, y: 20 };
        const status = 4;
        const expectedResult = 20;
        service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        const RESULT = service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        expect(RESULT.x).toEqual(expectedResult);
    });

    it(' changePositionAndDImensions MIDDLERIGHT status = 6', () => {
        const imageDataPosition = { x: 10, y: 10 };
        const imageDataDimension = { x: 10, y: 10 };
        const lastMousePos = { x: 20, y: 20 };
        const status = 6;
        const expectedResult = 10;
        service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        const RESULT = service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        expect(RESULT.x).toEqual(expectedResult);
    });

    it(' changePositionAndDImensions BOTTOMLEFT status = 7', () => {
        const imageDataPosition = { x: 10, y: 10 };
        const imageDataDimension = { x: 10, y: 10 };
        const lastMousePos = { x: 20, y: 20 };
        const status = 7;
        const expectedResult = 20;
        service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        const RESULT = service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        expect(RESULT.x).toEqual(expectedResult);
    });

    it(' changePositionAndDImensions BOTTOMMIDDLE status = 8', () => {
        const imageDataPosition = { x: 10, y: 10 };
        const imageDataDimension = { x: 10, y: 10 };
        const lastMousePos = { x: 20, y: 20 };
        const status = 8;
        const expectedResult = 15;
        service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        const RESULT = service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        expect(RESULT.x).toEqual(expectedResult);
    });

    it(' changePositionAndDImensions BOTTOMRIGHT status = 9', () => {
        const imageDataPosition = { x: 10, y: 10 };
        const imageDataDimension = { x: 10, y: 10 };
        const lastMousePos = { x: 20, y: 20 };
        const status = 9;
        const expectedResult = 10;
        service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        const RESULT = service.changePositionAndDimensions(imageDataPosition, imageDataDimension, lastMousePos, status);
        expect(RESULT.x).toEqual(expectedResult);
    });

    it('autoSave should remove the saved canvas and save a new one', () => {
        spyOn<any>(service.localStorage, 'setItem').and.stub();
        service.autoSave();
        expect(service.localStorage.setItem).toHaveBeenCalledWith('savedCanvas', service.canvas.toDataURL('image/jpeg'));
    });

    it('getSavedCanvas should get the item associate with the key', () => {
        const getItemSpy = spyOn<any>(service.localStorage, 'getItem').and.returnValue('canvasUrl');
        const canvasUrl = service.getSavedCanvas();
        expect(getItemSpy).toHaveBeenCalled();
        expect(canvasUrl).toEqual('canvasUrl');
    });

    it('removedCanvas should remove the saved canvas', () => {
        const removeItemSpy = spyOn<any>(service.localStorage, 'removeItem').and.stub();
        service.removeSavedCanvas();
        expect(removeItemSpy).toHaveBeenCalled();
    });
});

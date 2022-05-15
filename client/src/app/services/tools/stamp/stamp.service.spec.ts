import { TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampService } from './stamp.service';
// tslint:disable:no-string-literal
// tslint:disable: no-magic-numbers
describe('StampService', () => {
    let service: StampService;
    let mouseEvent: MouseEvent;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let matSliderStub: MatSliderChange;

    // tslint:disable: no-string-literal
    // tslint:disable: no-magic-numbers

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        matSliderStub = {} as MatSliderChange;
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(StampService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy.baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        drawingServiceSpy.previewCtx = previewCtxStub;
        drawingServiceSpy.canvas = ({ width: 300, height: 150 } as unknown) as HTMLCanvasElement;
        drawingServiceSpy.image = { setAttribute: {}, width: 5, height: 5 } as HTMLImageElement;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseMove should call rotateImage and clearCanvas if an icon has been selected and isInsideCanvas is true', () => {
        const getPositionMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        const isInsideCanvasSpy = spyOn(service, 'isInsideCanvas').and.returnValue(true);
        const rotateImageSpy = spyOn(service, 'rotateImage').and.stub();
        service.clickIcon = true;
        service.onMouseMove(mouseEvent);
        expect(getPositionMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(rotateImageSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(isInsideCanvasSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('onMouseMove should call clearCanvas if isInsideCanvas is false', () => {
        const getPositionMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        const isInsideCanvasSpy = spyOn(service, 'isInsideCanvas').and.returnValue(false);
        const rotateImageSpy = spyOn(service, 'rotateImage').and.stub();
        service.clickIcon = true;
        service.onMouseMove(mouseEvent);
        expect(getPositionMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(rotateImageSpy).not.toHaveBeenCalledWith(previewCtxStub);
        expect(isInsideCanvasSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('onMouseMove should od nothing if clickIcon is false', () => {
        const getPositionMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        const isInsideCanvasSpy = spyOn(service, 'isInsideCanvas').and.returnValue(true);
        const rotateImageSpy = spyOn(service, 'rotateImage').and.stub();
        service.clickIcon = false;
        service.onMouseMove(mouseEvent);
        expect(getPositionMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(rotateImageSpy).not.toHaveBeenCalledWith(previewCtxStub);
        expect(isInsideCanvasSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('onMouseDown should call rotateImage if mouseDown is true and isInsideCanvas is true', () => {
        drawingServiceSpy.mouseDown = true;
        const rotateImageSpy = spyOn(service, 'rotateImage').and.stub();
        const isInsideCanvasSpy = spyOn(service, 'isInsideCanvas').and.returnValue(true);
        service.onMouseDown(mouseEvent);
        expect(isInsideCanvasSpy).toHaveBeenCalled();
        expect(rotateImageSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it('onMouseDown should do nothing if mouseDown is false or isInsideCanvas is false', () => {
        drawingServiceSpy.mouseDown = false;
        mouseEvent = { button: 1 } as MouseEvent;
        service.lastMousePos = { x: 500, y: 500 };
        const rotateImageSpy = spyOn(service, 'rotateImage').and.stub();
        service.onMouseDown(mouseEvent);
        expect(rotateImageSpy).not.toHaveBeenCalledWith(previewCtxStub);
    });

    it('onKeyDown should set stepScroll to 1 if event.key = Alt', () => {
        const event = { key: 'Alt' } as KeyboardEvent;
        service.stepScroll = 15;
        service.onKeyDown(event);
        expect(service.stepScroll).toEqual(1);
    });

    it('onKeyDown should do nothing if event.key != Alt', () => {
        const event = { key: 'Enter' } as KeyboardEvent;
        service.stepScroll = 15;
        service.onKeyDown(event);
        expect(service.stepScroll).toEqual(15);
    });

    it('shiftDown should set isShiftDown to true', () => {
        service['isShiftDown'] = false;
        service.shiftDown();
        expect(service['isShiftDown']).toBeTrue();
    });

    it('shiftUp should set isShiftDown to false', () => {
        service['isShiftDown'] = true;
        service.shiftUp();
        expect(service['isShiftDown']).toBeFalse();
    });

    it('onKeyUp should set stepScroll to 15 if event.key = Alt', () => {
        const event = { key: 'Alt' } as KeyboardEvent;
        service.stepScroll = 1;
        service.onKeyUp(event);
        expect(service.stepScroll).toEqual(15);
    });

    it('onKeyUp should do nothing if event.key != Alt', () => {
        const event = { key: 'Enter' } as KeyboardEvent;
        service.stepScroll = 1;
        service.onKeyUp(event);
        expect(service.stepScroll).toEqual(1);
    });

    it('onScrollDown should call clearCanvas, rotateImage and call changeStampSlider if shiftDown is true', () => {
        service.stampAngle = 100;
        service.stampScale = 100;
        service['isShiftDown'] = true;
        const rotateImageSpy = spyOn(service, 'rotateImage').and.stub();
        const changeStampAngleSliderSpy = spyOn(service, 'changeStampScaleSlider').and.stub();
        service.onScrollDown();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(rotateImageSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(changeStampAngleSliderSpy).toHaveBeenCalled();
    });

    it('onScrollDown should call clearCanvas and rotateImage', () => {
        service.stampAngle = 100;
        service['isShiftDown'] = false;
        const rotateImageSpy = spyOn(service, 'rotateImage').and.stub();
        service.onScrollDown();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(rotateImageSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it('onScrollUp should call clearCanvas, rotateImage and call changeStampSlider if shiftDown is true', () => {
        service.stampAngle = 100;
        service.stampScale = 100;
        service['isShiftDown'] = true;
        const rotateImageSpy = spyOn(service, 'rotateImage').and.stub();
        const changeStampAngleSliderSpy = spyOn(service, 'changeStampScaleSlider').and.stub();
        service.onScrollUp();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(rotateImageSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(changeStampAngleSliderSpy).toHaveBeenCalled();
    });

    it('onScrollUp should call clearCanvas and rotateImage', () => {
        service.stampAngle = 100;
        service['isShiftDown'] = false;
        const rotateImageSpy = spyOn(service, 'rotateImage').and.stub();
        service.onScrollUp();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(rotateImageSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it('isInsideCanvas should return true if mouse is inside canvas', () => {
        service.lastMousePos = { x: 5, y: 5 };
        expect(service.isInsideCanvas()).toBeTrue();
    });

    it('isInsideCanvas should return false if mouse is outside of canvas', () => {
        service.lastMousePos = { x: 305, y: 305 };
        expect(service.isInsideCanvas()).toBeFalse();
    });

    it('rotateImage should call save,translate ,rotate and restore', () => {
        service.lastMousePos = { x: 100, y: 100 };
        service.stampAngle = 100;
        const saveSpy = spyOn(baseCtxStub, 'save').and.stub();
        const translateSpy = spyOn(baseCtxStub, 'translate').and.stub();
        const rotateSpy = spyOn(baseCtxStub, 'rotate').and.stub();
        const restoreSpy = spyOn(baseCtxStub, 'restore').and.stub();
        const drawStampSpy = spyOn(service, 'drawStamp').and.stub();
        service.rotateImage(baseCtxStub);
        expect(saveSpy).toHaveBeenCalled();
        expect(translateSpy).toHaveBeenCalled();
        expect(rotateSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
        expect(drawStampSpy).toHaveBeenCalled();
    });

    it('drawStamp should call stampSetup, drawImage and autoSave', () => {
        const drawImageSpy = spyOn(baseCtxStub, 'drawImage').and.stub();
        const stampSetupSpy = spyOn(service, 'stampSetup').and.stub();
        service.drawStamp(baseCtxStub);
        expect(drawImageSpy).toHaveBeenCalled();
        expect(stampSetupSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.autoSave).toHaveBeenCalled();
    });

    it('stampSetup should update imageDimension', () => {
        service.imageDimension = { x: 0, y: 0 };
        drawingServiceSpy.image.width = 5;
        drawingServiceSpy.image.height = 5;
        drawingServiceSpy.stampScale = 500;
        service.stampSetup();
        expect(service.imageDimension.x).toEqual((drawingServiceSpy.image.width * drawingServiceSpy.stampScale) / 100);
        expect(service.imageDimension.y).toEqual((drawingServiceSpy.image.height * drawingServiceSpy.stampScale) / 100);
    });

    it('updateImage should call setAttribute', () => {
        const link = 'allo';
        service.clickIcon = false;
        const setAttributeSpy = spyOn(drawingServiceSpy.image, 'setAttribute').and.stub();
        service.updateImage(link);
        expect(service.clickIcon).toBeTrue();
        expect(setAttributeSpy).toHaveBeenCalled();
    });

    it('changeStampScaleSlider should update stampScale if value is lower than Min', () => {
        const value = 20;
        service.changeStampScaleSlider(value);
        expect(service.stampScale).toEqual(service.STAMP_MIN_SCALE);
        expect(drawingServiceSpy.stampScale).toEqual(service.STAMP_MIN_SCALE);
    });

    it('changeStampScaleSlider should update stampScale if value is higher than Max', () => {
        const value = 600;
        service.changeStampScaleSlider(value);
        expect(service.stampScale).toEqual(service.STAMP_MAX_SCALE);
        expect(drawingServiceSpy.stampScale).toEqual(service.STAMP_MAX_SCALE);
    });

    it('changeStampScaleSlider should update stampScale', () => {
        const value = 120;
        service.changeStampScaleSlider(value);
        expect(service.stampScale).toEqual(value);
        expect(drawingServiceSpy.stampScale).toEqual(value);
    });

    it('changeStampAngleSlider should update stampAngle ', () => {
        matSliderStub.value = 100;
        service.stampAngle = 100;
        service.changeStampAngleSlider(matSliderStub);
        expect(service.stampAngle).toEqual(matSliderStub.value);
        expect(drawingServiceSpy.stampAngle).toEqual(matSliderStub.value);
    });

    it('changeStampAngleSlider should update stampAngle if value is lower than Min', () => {
        matSliderStub.value = 0;
        service.stampAngle = 0;
        service.changeStampAngleSlider(matSliderStub);
        expect(service.stampAngle).toEqual(service.STAMP_MIN_ANGLE);
        expect(drawingServiceSpy.stampAngle).toEqual(service.STAMP_MIN_ANGLE);
    });

    it(' getCurrentToolString should return stamp', () => {
        expect(service.getCurrentToolString()).toEqual('stamp');
    });
});

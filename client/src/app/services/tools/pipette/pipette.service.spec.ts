import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Color } from '@app/classes/color';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PipetteService } from './pipette.service';

describe('PipetteService', () => {
    let service: PipetteService;
    let canvasTestHelper: CanvasTestHelper;
    let ctxStub: CanvasRenderingContext2D;
    let mouseEvent: MouseEvent;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas'], { canvas: {} as HTMLCanvasElement });
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpyObj }],
        });
        service = TestBed.inject(PipetteService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        ctxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = ctxStub;
        service.magnifierCtx = ctxStub;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            x: 25,
            y: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseMove should forward call to drawImage, getZoomedInImage getPositionFromMouse, putImageData and update opacity and transform if not in boundaries', () => {
        service.wrapper = { style: {} } as HTMLElement;
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.returnValue(mouseEvent);
        const putImageDataSpy = spyOn(service.magnifierCtx, 'putImageData').and.stub();
        const getZoomedInImageSpy = spyOn(service, 'getZoomedInImage').and.stub();
        service.wrapper.style.opacity = '1';
        service.wrapper.style.transform = 'scale(1)';
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(service.wrapper.style.opacity).toEqual('0');
        expect(service.wrapper.style.transform).toEqual('scale(0.7)');
        expect(putImageDataSpy).toHaveBeenCalledWith(service.getZoomedInImage(service.getPositionFromMouse(mouseEvent)), 0, 0);
        expect(getZoomedInImageSpy).toHaveBeenCalledWith(service.getPositionFromMouse(mouseEvent));
    });

    it('onMouseMove should forward call to checkBoundaries and update opacity and transform if in boundaries', () => {
        const mouseEvent2 = { offsetX: 100, offsetY: 100 } as MouseEvent;
        const checkBoundariesSpy = spyOn(service, 'checkBoundaries').and.returnValue(true);
        const getZoomedInImageSpy = spyOn(service, 'getZoomedInImage').and.stub();
        const putImageDataSpy = spyOn(service.magnifierCtx, 'putImageData').and.stub();
        spyOn(service, 'getPositionFromMouse').and.returnValue({ x: 100, y: 100 });
        service.wrapper = { style: {} } as HTMLElement;
        service.wrapper.style.opacity = '0';
        service.wrapper.style.transform = 'scale(0)';
        service.onMouseMove(mouseEvent2);
        expect(checkBoundariesSpy).toHaveBeenCalledWith(mouseEvent2);
        expect(service.wrapper.style.opacity).toEqual('1');
        expect(service.wrapper.style.transform).toEqual('scale(1)');
        expect(getZoomedInImageSpy).toHaveBeenCalledWith(service.getPositionFromMouse(mouseEvent));
        expect(putImageDataSpy).toHaveBeenCalledWith(service.getZoomedInImage(service.getPositionFromMouse(mouseEvent)), 0, 0);
    });

    it('checkBoundaries should forward call to getPositionFromMouse and be true', () => {
        // tslint:disable-next-line:no-magic-numbers
        service['drawingService'].canvas.width = 1000;
        // tslint:disable-next-line:no-magic-numbers
        service['drawingService'].canvas.height = 1000;
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.returnValue({ x: 25, y: 25 });
        const bool = service.checkBoundaries(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(bool).toEqual(true);
    });

    it('checkBoundaries should forward call to getPositionFromMouse and be false', () => {
        // tslint:disable-next-line:no-magic-numbers
        service['drawingService'].canvas.width = 1000;
        // tslint:disable-next-line:no-magic-numbers
        service['drawingService'].canvas.height = 1000;
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.returnValue({ x: 2000, y: 2000 });
        const bool = service.checkBoundaries(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(bool).toEqual(false);
    });

    it('onClick should forward call to getCurrentPixelColor and getPositionFromMouse and update primaryColor', () => {
        service['drawingService'].primaryColor = new Color(1, 1, 1, 0).toRgba();
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.returnValue(mouseEvent);
        const getCurrentPixelColorSpy = spyOn(service, 'getCurrentPixelColor').and.returnValue(new Color());
        service.onClick(mouseEvent);
        expect(getCurrentPixelColorSpy).toHaveBeenCalledWith(service.getPositionFromMouse(mouseEvent));
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(service['drawingService'].primaryColor).toEqual(new Color().toRgba());
    });

    it('onClickRight should forward call to getCurrentPixelColor and getPositionFromMouse and update secondaryColor', () => {
        service['drawingService'].secondaryColor = new Color(1, 1, 1, 0).toRgba();
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.returnValue(mouseEvent);
        const getCurrentPixelColorSpy = spyOn(service, 'getCurrentPixelColor').and.returnValue(new Color());
        service.onClickRight(mouseEvent);
        expect(getCurrentPixelColorSpy).toHaveBeenCalledWith(service.getPositionFromMouse(mouseEvent));
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(service['drawingService'].secondaryColor).toEqual(new Color().toRgba());
    });

    it('getCurrentPixelColor should forward call to getImageData', () => {
        const mousePos = { x: 0, y: 0 };
        const getImageDataSpy = spyOn(ctxStub, 'getImageData').and.returnValue({ data: {} } as ImageData);
        service.getCurrentPixelColor(mousePos);
        expect(getImageDataSpy).toHaveBeenCalledWith(mousePos.x, mousePos.y, 1, 1);
    });

    it('getZoomedInImage should forward call to getImageData', () => {
        const mousePos = { x: 0, y: 0 };
        const getImageDataSpy = spyOn(ctxStub, 'getImageData').and.stub();
        service.getZoomedInImage(mousePos);
        expect(getImageDataSpy).toHaveBeenCalled();
    });

    it('getCurrentToolString should return pipette', () => {
        service.getCurrentToolString();
        expect(service.getCurrentToolString()).toEqual('pipette');
    });
});

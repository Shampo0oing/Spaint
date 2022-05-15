import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BLUE, GREEN, OPACITY, RED } from '@app/classes/constantes';
import { SceauService } from './sceau.service';

// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers
// tslint:disable: variable-name
// tslint:disable: max-file-line-count
describe('SceauService', () => {
    let service: SceauService;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SceauService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service['drawingService'].canvas = canvasTestHelper.canvas;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onClick should forward call to fillPixelsContigus and addUndoAction otherwise', () => {
        const fillPixelsContigusSpy = spyOn(service, 'fillPixelsContigus').and.stub();
        const addUndoActionSpy = spyOn(service['annulerRefaireService'], 'addUndoAction').and.stub();
        const test = new Uint8ClampedArray(4);
        test[0] = 255;
        spyOn(baseCtxStub, 'getImageData').and.returnValue({ data: test } as ImageData);
        spyOn(baseCtxStub, 'putImageData').and.stub();
        service.onClick({} as MouseEvent);
        expect(fillPixelsContigusSpy).toHaveBeenCalled();
        expect(addUndoActionSpy).toHaveBeenCalled();
    });

    it('onClickRight should forward call to getCurrentPixelColor, getRGBArray, fillPixelsNContigus and addUndoAction', () => {
        const getCurrentPixelColorSpy = spyOn(service, 'getCurrentPixelColor').and.stub();
        const getRGBArraySpy = spyOn(service, 'getRGBArray').and.stub();
        const fillPixelsNContigus = spyOn(service, 'fillPixelsNContigus').and.stub();
        const addUndoActionSpy = spyOn(service['annulerRefaireService'], 'addUndoAction').and.stub();

        service.onClickRight({} as MouseEvent);
        expect(getCurrentPixelColorSpy).toHaveBeenCalledWith(service.getPositionFromMouse({} as MouseEvent));
        expect(getRGBArraySpy).toHaveBeenCalledWith(service['drawingService'].primaryColor);
        expect(fillPixelsNContigus).toHaveBeenCalled();
        expect(addUndoActionSpy).toHaveBeenCalled();
    });

    it('fillPixelsContigus should forward call to checkValidity', () => {
        const currentColor = [255, 255, 255, 1];
        const newColor = [0, 0, 0, 1];
        const test = new Uint8ClampedArray(1000);
        for (let i = 0; i < test.length; i++) {
            test[i] = 255;
        }
        const checkValiditySpy = spyOn(service, 'checkValidity');
        service.fillPixelsContigus(test, { x: 0, y: 0 }, currentColor, newColor, 0);
        expect(checkValiditySpy).toHaveBeenCalled();
    });

    it('fillPixelsContigus should fill color', () => {
        const currentColor = [255, 255, 255, 1];
        const newColor = [0, 0, 0, 1];
        const test = new Uint8ClampedArray(250000);
        for (let i = 0; i < test.length; i++) {
            test[i] = 255;
        }
        spyOn(service, 'sameColor').and.returnValue(false);
        service.fillPixelsContigus(test, { x: 100, y: 100 }, currentColor, newColor, 0);
        expect(test[5]).toEqual(0);
    });

    it('fillPixelsContigus should fill color unless different', () => {
        const currentColor = [255, 255, 255, 1];
        const newColor = [0, 0, 0, 1];
        const test = new Uint8ClampedArray(250000);
        for (let i = 0; i < 16383; i += 4) {
            test[i + RED] = 255;
            test[i + GREEN] = 255;
            test[i + BLUE] = 255;
            test[i + OPACITY] = 255;
        }
        for (let i = 16383; i < test.length; i += 4) {
            test[i + RED] = 100;
            test[i + GREEN] = 100;
            test[i + BLUE] = 100;
            test[i + OPACITY] = 255;
        }
        spyOn(service, 'sameColor').and.returnValue(false);
        service.fillPixelsContigus(test, { x: 15, y: 15 }, currentColor, newColor, 0);
        expect(test[0]).toEqual(0);
    });

    it('fillPixelsNContigus should forward call to checkValidity and setPixels if return true', () => {
        const checkValiditySpy = spyOn(service, 'checkValidity').and.returnValue(true);
        const setPixelsSpy = spyOn(service, 'setPixels').and.stub();

        const currentColor = [0, 0, 0, 1];
        const newColor = [255, 255, 255, 1];
        const test = new Uint8ClampedArray(1);

        service.fillPixelsNContigus(test, currentColor, newColor, 50);
        expect(checkValiditySpy).toHaveBeenCalled();
        expect(setPixelsSpy).toHaveBeenCalled();
    });

    it('fillPixelsNContigus should only forward call to checkValidity if return is false', () => {
        const checkValiditySpy = spyOn(service, 'checkValidity').and.returnValue(false);
        const setPixelsSpy = spyOn(service, 'setPixels').and.stub();

        const currentColor = [0, 0, 0, 1];
        const newColor = [255, 255, 255, 1];
        const test = new Uint8ClampedArray(1);

        service.fillPixelsNContigus(test, currentColor, newColor, 50);
        expect(checkValiditySpy).toHaveBeenCalled();
        expect(setPixelsSpy).not.toHaveBeenCalled();
    });

    it('getCurrentPixelColor should return an array', () => {
        const test = new Uint8ClampedArray(4);
        test[0] = 255;
        spyOn(baseCtxStub, 'getImageData').and.returnValue({ data: test } as ImageData);
        const result = service.getCurrentPixelColor({ x: 0, y: 0 });
        expect(result[0]).toEqual(255);
    });

    it('getRGBArray should return an array', () => {
        const result = service.getRGBArray('rgba(0, 0, 0, 1)');
        expect(result[0]).toEqual(0);
        expect(result[1]).toEqual(0);
        expect(result[2]).toEqual(0);
        expect(result[3]).toEqual(1);
    });

    it('checkValidity should return false if sameColor is true', () => {
        spyOn(service, 'sameColor').and.returnValue(true);
        const test = service.checkValidity({} as Uint8ClampedArray, 0, {} as number[], 0);
        expect(test).toBeFalse();
    });

    it('sameColor should forward return true if compareValue is true', () => {
        spyOn(service, 'compareValue').and.returnValue(true);
        const test = service.sameColor({} as Uint8ClampedArray, 0, {} as number[]);
        expect(test).toBeTrue();
    });

    it('setPixels should change pixel colors', () => {
        const test = new Uint8ClampedArray(4);
        test[0] = 0;
        test[1] = 0;
        test[2] = 0;
        test[3] = 1;
        const newColor = [10, 10, 10, 1];
        service.setPixels(test, 0, newColor);
        expect(test[0]).toEqual(10);
        expect(test[1]).toEqual(10);
        expect(test[2]).toEqual(10);
    });

    it('compareValue should return true if source is less than ref and within range', () => {
        const result = service.compareValue(100, 200, 50);
        expect(result).toBeTrue();
    });

    it('compareValue should return false if source is less than ref and not within range', () => {
        const result = service.compareValue(-1, 50, 100);
        expect(result).toBeFalse();
    });

    it('compareValue should return true if source is greater than ref and within range', () => {
        const result = service.compareValue(250, 200, 50);
        expect(result).toBeTrue();
    });

    it('compareValue should return false if source is greater than ref and not within range', () => {
        const result = service.compareValue(250, 10, 50);
        expect(result).toBeFalse();
    });

    it('compareValue should return true if source is equal to ref', () => {
        const result = service.compareValue(200, 200, 50);
        expect(result).toBeTrue();
    });

    it('getCurrentToolString should return a string', () => {
        const result = service.getCurrentToolString();
        expect(result).toEqual('sceau');
    });
});

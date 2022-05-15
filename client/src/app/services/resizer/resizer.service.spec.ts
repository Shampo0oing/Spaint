import { TestBed } from '@angular/core/testing';
import { DEFAULT_POSITION, DragPos } from '@app/classes/constantes';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizerService } from '@app/services/resizer/resizer.service';

const MIN_WIDTH = 250;
const MIN_HEIGHT = 250;
const SMALL_DIMENSIONS = 100;
const BIG_DIMENSIONS = 10000;
const POINT = { x: 10000, y: 10000 };
// tslint:disable:no-any

describe('ResizerService', () => {
    let service: ResizerService;
    let verificationMinimumSpy: jasmine.Spy<any>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({ providers: [{ provide: DrawingService, useValue: drawingServiceSpy }] });

        service = TestBed.inject(ResizerService);
        verificationMinimumSpy = spyOn<any>(service, 'verificationMinimum').and.stub();
        service.offset = { x: 51, y: 1 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' verificationMinimum should put the width and hight to 250px if they are less then 250px', () => {
        verificationMinimumSpy.and.callThrough();
        service.width = SMALL_DIMENSIONS;
        service.height = SMALL_DIMENSIONS;
        service.verificationMinimum();
        expect(service.width).toEqual(MIN_WIDTH);
        expect(service.height).toEqual(MIN_HEIGHT);
    });

    it(' verificationMinimum should not change the width and hight to 250px if they are more then 250px', () => {
        verificationMinimumSpy.and.callThrough();
        service.width = BIG_DIMENSIONS;
        service.height = BIG_DIMENSIONS;
        service.verificationMinimum();
        expect(service.width).toEqual(BIG_DIMENSIONS);
        expect(service.height).toEqual(BIG_DIMENSIONS);
    });

    it(' resize should only call verificationMinimum when status is NONE', () => {
        service.width = BIG_DIMENSIONS;
        service.height = BIG_DIMENSIONS;
        service.resize(DragPos.NONE, POINT);
        expect(verificationMinimumSpy).toHaveBeenCalled();
        expect(service.width).toEqual(BIG_DIMENSIONS);
        expect(service.height).toEqual(BIG_DIMENSIONS);
    });

    it(' resize should change width and height and call verificationMinimum when status is CORNER', () => {
        service.width = BIG_DIMENSIONS;
        service.height = BIG_DIMENSIONS;
        service.resize(DragPos.CORNER, POINT);
        expect(verificationMinimumSpy).toHaveBeenCalled();
        expect(service.width).toEqual(POINT.x - DEFAULT_POSITION.left);
        expect(service.height).toEqual(POINT.y - DEFAULT_POSITION.top);
    });

    it(' resize should only change height and call verificationMinimum when status is BOTTOM', () => {
        service.width = BIG_DIMENSIONS;
        service.height = BIG_DIMENSIONS;
        service.resize(DragPos.BOTTOM, POINT);
        expect(verificationMinimumSpy).toHaveBeenCalled();
        expect(service.height).toEqual(POINT.y - DEFAULT_POSITION.top);
    });

    it(' resize should only change width and call verificationMinimum when status is RIGHT', () => {
        service.width = BIG_DIMENSIONS;
        service.height = BIG_DIMENSIONS;
        service.resize(DragPos.RIGHT, POINT);
        expect(verificationMinimumSpy).toHaveBeenCalled();
        expect(service.width).toEqual(POINT.x - DEFAULT_POSITION.left);
    });

    it(' resizeImage should not call verificationMinimum', () => {
        const dummyElement = document.createElement('canvas');
        dummyElement.setAttribute('width', '250px');
        dummyElement.setAttribute('height', '250px');
        document.getElementById = jasmine.createSpy('HTMLCanvasElement').and.returnValue(dummyElement);
        service.width = BIG_DIMENSIONS;
        service.height = BIG_DIMENSIONS;
        service.resizeImage();
        expect(verificationMinimumSpy).not.toHaveBeenCalled();
    });

    it(' resizeImage should call verificationMinimum', () => {
        const dummyElement = document.createElement('canvas');
        dummyElement.setAttribute('width', '250px');
        dummyElement.setAttribute('height', '250px');
        document.getElementById = jasmine.createSpy('HTMLCanvasElement').and.returnValue(dummyElement);
        service.width = BIG_DIMENSIONS;
        service.height = BIG_DIMENSIONS;
        service.resizeImage(POINT);
        expect(verificationMinimumSpy).toHaveBeenCalled();
        expect(service.width).toEqual(POINT.x);
        expect(service.height).toEqual(POINT.y);
    });
});

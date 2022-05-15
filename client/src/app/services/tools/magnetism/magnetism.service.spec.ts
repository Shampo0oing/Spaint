import { TestBed } from '@angular/core/testing';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from './magnetism.service';

const SQUARESIZE_TEST = 5;

// tslint:disable:no-string-literal
// tslint:disable:no-any
describe('MagnetismService', () => {
    let service: MagnetismService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas'], { canvas: {} as HTMLCanvasElement });
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(MagnetismService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' affectWithMagnestism should return a position that is the closest multiple of squareSize', () => {
        drawingServiceSpy.squareSize = SQUARESIZE_TEST;
        expect(service.affectWithMagnestism({ x: SQUARESIZE_TEST + 2, y: SQUARESIZE_TEST + 2 }, { x: SQUARESIZE_TEST, y: SQUARESIZE_TEST })).toEqual({
            x: SQUARESIZE_TEST,
            y: SQUARESIZE_TEST,
        });
    });
});

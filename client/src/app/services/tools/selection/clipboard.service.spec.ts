import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/classes/vec2';
import { ClipboardService } from './clipboard.service';

// tslint:disable:no-string-literal
// tslint:disable:no-any
// tslint:disable:no-empty

const EXPECTED_IMAGEDATA = {} as ImageData;
const EXPECTED_DIMENSION = { x: 1, y: 1 } as Vec2;
const EXPECTED_TOOL = 'e';

describe('SelectionService', () => {
    let service: ClipboardService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClipboardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' copy should change imageData, imageDimensions and selectedTool', () => {
        service.copy(EXPECTED_IMAGEDATA, EXPECTED_DIMENSION, EXPECTED_TOOL);
        expect(service.imageData).toEqual(EXPECTED_IMAGEDATA);
        expect(service.imageDimensions).toEqual(EXPECTED_DIMENSION);
        expect(service.selectedTool).toEqual(EXPECTED_TOOL);
    });

    it(' copy should change pathData if one is provided and become empty if not', () => {
        const EXPECTED_PATHDATA = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        service.copy(EXPECTED_IMAGEDATA, EXPECTED_DIMENSION, EXPECTED_TOOL, EXPECTED_PATHDATA, EXPECTED_PATHDATA);
        expect(service.pathData).toEqual(EXPECTED_PATHDATA);
        service.copy(EXPECTED_IMAGEDATA, EXPECTED_DIMENSION, EXPECTED_TOOL);
        expect(service.pathData).toEqual([]);
    });

    it(' isEmpty should return true if imageDimensions is (0,0)', () => {
        expect(service.isEmpty()).toEqual(true);
    });

    it(' isEmpty should return false if imageDimensions is not (0,0)', () => {
        service.imageDimensions = { x: 1, y: 1 } as Vec2;
        expect(service.isEmpty()).toEqual(false);
    });
});

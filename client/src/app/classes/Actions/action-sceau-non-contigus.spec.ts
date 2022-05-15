import { TestBed } from '@angular/core/testing';
import { ActionSceauNonContigus } from '@app/classes/Actions/action-sceau-non-contigus';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SceauService } from '@app/services/tools/sceau/sceau.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionSceauContigus', () => {
    let actionSceau: ActionSceauNonContigus;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let sceauServiceSpy: jasmine.SpyObj<SceauService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        sceauServiceSpy = jasmine.createSpyObj('SceauService', ['fillPixelsNContigus']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: SceauService, useValue: sceauServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        actionSceau = new ActionSceauNonContigus(drawServiceSpy, [255, 255, 255, 1], [0, 0, 0, 1], sceauServiceSpy);
        drawServiceSpy.canvas = canvasTestHelper.canvas;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionSceau['drawingService'].baseCtx = baseCtxStub;
    });

    it('should be created', () => {
        expect(actionSceau).toBeTruthy();
    });

    it('draw should call fillPixelsNContigus', () => {
        actionSceau.draw();
        expect(sceauServiceSpy.fillPixelsNContigus).toHaveBeenCalled();
    });
});

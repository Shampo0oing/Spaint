import { TestBed } from '@angular/core/testing';
import { ActionAerosol } from '@app/classes/Actions/action-aerosol';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionAerosol', () => {
    let actionAerosol: ActionAerosol;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        actionAerosol = new ActionAerosol(
            drawServiceSpy,
            [
                { x: 0, y: 0 },
                { x: 10, y: 10 },
                { x: 10, y: 0 },
                { x: 0, y: 10 },
                { x: 5, y: 5 },
            ],
            '#000000',
            10,
        );
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionAerosol['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
    });

    it('should be created', () => {
        expect(actionAerosol).toBeTruthy();
    });

    it('draw should draw ', () => {
        const arcSpy = spyOn<any>(actionAerosol['drawingService'].baseCtx, 'arc').and.callThrough();
        actionAerosol.draw();
        expect(arcSpy).toHaveBeenCalledTimes(5);
    });
});

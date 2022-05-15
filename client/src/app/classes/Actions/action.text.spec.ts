import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from '@app/services/tools/text/text.service';
import { ActionText } from './action-text';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionPolygon', () => {
    let actionText: ActionText;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let textServiceSpy: jasmine.SpyObj<TextService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        textServiceSpy = jasmine.createSpyObj('TextService', ['writeAllText']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: TextService, useValue: textServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        actionText = new ActionText(drawServiceSpy, { x: 10, y: 10 }, ['test'], 10, '#000000', 'center', 'consola', 'bold', textServiceSpy);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        actionText['drawingService'].baseCtx = baseCtxStub;
    });

    it('should be created', () => {
        expect(actionText).toBeTruthy();
    });

    it('draw should call writeAllText', () => {
        actionText.draw();
        expect(textServiceSpy.writeAllText).toHaveBeenCalled();
    });
});

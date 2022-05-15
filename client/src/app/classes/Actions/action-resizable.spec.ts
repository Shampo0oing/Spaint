import { TestBed } from '@angular/core/testing';
import { ActionResizer } from '@app/classes/Actions/action-resizable';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizerService } from '@app/services/resizer/resizer.service';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('ActionResizable', () => {
    let actionResizable: ActionResizer;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let resizerServiceSpy: jasmine.SpyObj<ResizerService>;
    const point: Vec2 = { x: 10, y: 10 };
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        resizerServiceSpy = jasmine.createSpyObj('ResizerService', ['resizeImage']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ResizerService, useValue: resizerServiceSpy },
            ],
        });
        actionResizable = new ActionResizer(drawServiceSpy, resizerServiceSpy, point);
    });

    it('should be created', () => {
        expect(actionResizable).toBeTruthy();
    });

    it('draw should call resizeImage of resizerService ', () => {
        actionResizable.draw();
        expect(resizerServiceSpy.resizeImage).toHaveBeenCalledWith(point);
    });
});

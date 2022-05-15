import { TestBed } from '@angular/core/testing';
import { Tool } from '@app/classes/tool';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Vec2 } from './vec2';

class ToolStub extends Tool {
    getCurrentToolString(): string {
        return '';
    }
}

// tslint:disable:no-string-literal
// tslint:disable:no-any
describe('Tool', () => {
    let tool: Tool;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let annulerRefaireServiceSpy: jasmine.SpyObj<AnnulerRefaireService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        annulerRefaireServiceSpy = jasmine.createSpyObj('AnnulerRefaireService', ['undo']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: AnnulerRefaireService, useValue: annulerRefaireServiceSpy },
            ],
        });
        tool = new ToolStub(drawServiceSpy, annulerRefaireServiceSpy);
    });

    it('should be created', () => {
        expect(tool).toBeTruthy();
    });

    it(' getPositionFromMouse should return the difference between the mouse position and the boundingBox of the canvas', () => {
        const dummyElement = document.createElement('canvas');
        spyOn<any>(dummyElement, 'getBoundingClientRect').and.returnValue({ top: 5, left: 5 });
        drawServiceSpy.canvas = dummyElement;
        const mouseEvent = { pageX: 10, pageY: 10 } as MouseEvent;
        expect(tool.getPositionFromMouse(mouseEvent)).toEqual({ x: 5, y: 5 } as Vec2);
    });
});

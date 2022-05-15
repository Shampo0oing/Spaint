import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragPos } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { ResizerService } from '@app/services/resizer/resizer.service';
import { DrawingService, ResizableComponent } from './resizable.component';

const WIDTH = 250;
const HEIGHT = 250;
// tslint:disable:no-any
// tslint:disable:no-string-literal
describe('ResizableComponent', () => {
    let component: ResizableComponent;
    let fixture: ComponentFixture<ResizableComponent>;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let resizerServiceSpy: jasmine.SpyObj<ResizerService>;
    let annulerRefaireServiceSpy: jasmine.SpyObj<AnnulerRefaireService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        resizerServiceSpy = jasmine.createSpyObj('ResizerService', ['resize', 'resizeImage']);
        annulerRefaireServiceSpy = jasmine.createSpyObj('AnnulerRefaireService', ['addUndoAction']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ResizerService, useValue: resizerServiceSpy },
                { provide: AnnulerRefaireService, useValue: annulerRefaireServiceSpy },
            ],
        }).compileComponents();
        mouseEvent = { pageX: 5, pageY: 5 } as MouseEvent;
        fixture = TestBed.createComponent(ResizableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should be able to change the status', () => {
        component.setStatus(DragPos.BOTTOM);
        expect(component.status).toEqual(DragPos.BOTTOM);
        component.setStatus(DragPos.CORNER);
        expect(component.status).toEqual(DragPos.CORNER);
        component.setStatus(DragPos.RIGHT);
        expect(component.status).toEqual(DragPos.RIGHT);
        component.setStatus(DragPos.NONE);
        expect(component.status).toEqual(DragPos.NONE);
    });

    it(' should call setStatus on mouse up only when status is not NONE', () => {
        const setStatusSpy = spyOn<any>(component, 'setStatus').and.callThrough();
        const dummyElement = document.createElement('canvas');
        dummyElement.setAttribute('width', '250px');
        dummyElement.setAttribute('height', '250px');
        component.resizerService.width = WIDTH;
        component.resizerService.height = HEIGHT;
        document.getElementById = jasmine.createSpy('HTMLCanvasElement').and.returnValue(dummyElement);
        component.onMouseUp(mouseEvent);
        expect(setStatusSpy).not.toHaveBeenCalled();
        component['status'] = DragPos.CORNER;
        component.onMouseUp(mouseEvent);
        expect(setStatusSpy).toHaveBeenCalled();
        expect(annulerRefaireServiceSpy.addUndoAction).toHaveBeenCalled();
    });

    it(' drag and dropping the canvas should call resize of resizerService', () => {
        component['status'] = DragPos.RIGHT;
        const mouse = { x: 250, y: 300 } as Vec2;
        const event: MouseEvent = { pageX: mouse.x, pageY: mouse.y } as MouseEvent;
        component.onMouseMove(event);
        expect(resizerServiceSpy.resize).toHaveBeenCalledWith(DragPos.RIGHT, mouse);
    });

    it(' drag and dropping the canvas should not call resize of resizerService', () => {
        component['status'] = DragPos.NONE;
        const mouse = { x: 250, y: 300 } as Vec2;
        const event: MouseEvent = { pageX: mouse.x, pageY: mouse.y } as MouseEvent;
        component.onMouseMove(event);
        expect(resizerServiceSpy.resize).not.toHaveBeenCalled();
    });
});

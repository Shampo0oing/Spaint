import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider } from '@angular/material/slider';
import { ColorSliderComponent } from './color-slider.component';
// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
describe('ColorSliderComponent', () => {
    let component: ColorSliderComponent;
    let fixture: ComponentFixture<ColorSliderComponent>;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', '10px');
    canvas.setAttribute('height', '250px');

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorSliderComponent, MatSlider],
            imports: [FormsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit should init attributes and display slider', () => {
        spyOn(component, 'displaySlider').and.callThrough();
        component.ngAfterViewInit();
        expect(component.displaySlider).toHaveBeenCalled();
    });

    it('updateCurrentHeight should update the cursor height with the mouse position', () => {
        const mouseEvent: MouseEvent = { pageY: 50 } as MouseEvent;
        component.sliderCanvas.nativeElement = canvas;
        // @ts-ignore
        const spy = spyOn(component.sliderCanvas.nativeElement, ['getBoundingClientRect']).and.returnValue({ top: 0 });
        // @ts-ignore
        component.updateCurrentHeight(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('updateCurrentHeight should fixe the bottom boundary for the height', () => {
        const mouseEvent: MouseEvent = { pageY: -5 } as MouseEvent;
        // @ts-ignore
        spyOn(component.sliderCanvas.nativeElement, ['getBoundingClientRect']).and.returnValue({ top: 0 });
        component.updateCurrentHeight(mouseEvent);
        expect(component['selectedHeight']).toEqual(1);
    });

    it('updateCurrentHeight should fixe the top boundary for the height', () => {
        const mouseEvent: MouseEvent = { pageY: 267 } as MouseEvent;
        // @ts-ignore
        spyOn(component.sliderCanvas.nativeElement, ['getBoundingClientRect']).and.returnValue({ top: 0 });
        component.updateCurrentHeight(mouseEvent);
        expect(component['selectedHeight']).toEqual(249);
    });

    it('onMouseUp should update mouseDown attribute to false', () => {
        // const event = jasmine.createSpyObj('MouseEvent', ['preventDefault'], { key: KeyboardButton.Backspace });
        component['mouseDown'] = true;
        component.onMouseUp();
        expect(component['mouseDown']).toEqual(false);
    });

    it('onMouseMove should update height, cursor and color', () => {
        const event: MouseEvent = {} as MouseEvent;
        spyOn(component, 'displaySelector').and.callThrough();
        spyOn(component, 'emitColor').and.callThrough();
        spyOn(component, 'updateCurrentHeight').and.callThrough();
        component['mouseDown'] = true;
        component.onMouseMove(event);
        expect(component.displaySelector).toHaveBeenCalled();
        expect(component.emitColor).toHaveBeenCalled();
        expect(component.updateCurrentHeight).toHaveBeenCalledWith(event);
    });

    it('oneMouseMove should do nothing when not down', () => {
        const event: MouseEvent = {} as MouseEvent;
        spyOn(component, 'displaySelector').and.callThrough();
        spyOn(component, 'emitColor').and.callThrough();
        spyOn(component, 'updateCurrentHeight').and.callThrough();
        component['mouseDown'] = false;
        component.onMouseMove(event);
        expect(component.displaySelector).not.toHaveBeenCalled();
        expect(component.emitColor).not.toHaveBeenCalled();
        expect(component.updateCurrentHeight).not.toHaveBeenCalledWith(event);
    });

    it('onMouseDown should update cursor, height and color', () => {
        const event: MouseEvent = {} as MouseEvent;
        spyOn(component, 'displaySelector').and.callThrough();
        spyOn(component, 'emitColor').and.callThrough();
        spyOn(component, 'updateCurrentHeight').and.callThrough();
        component['mouseDown'] = false;
        component.onMouseDown(event);
        expect(component.displaySelector).toHaveBeenCalled();
        expect(component.emitColor).toHaveBeenCalled();
        expect(component.updateCurrentHeight).toHaveBeenCalledWith(event);
        expect(component['mouseDown']).toEqual(true);
    });

    it('displaySlider should create the canvas context, create color gradient and update cursor', () => {
        component['ctx'] = canvas.getContext('2d') as CanvasRenderingContext2D;
        component['ctx'].fillStyle = '#FF0000';
        const spy1 = spyOn(component['ctx'], 'createLinearGradient').and.callThrough();
        const spy2 = spyOn(component['ctx'], 'clearRect').and.callThrough();
        const spy3 = spyOn(component['ctx'], 'beginPath').and.callThrough();
        const spy4 = spyOn(component['ctx'], 'fillRect').and.callThrough();
        const spy5 = spyOn(component['ctx'], 'closePath').and.callThrough();
        const spy6 = spyOn(component, 'displaySelector').and.callThrough();
        const spy7 = spyOn(CanvasGradient.prototype, 'addColorStop').and.callThrough();
        component.displaySlider();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        expect(spy3).toHaveBeenCalled();
        expect(spy4).toHaveBeenCalled();
        expect(spy5).toHaveBeenCalled();
        expect(spy6).toHaveBeenCalled();
        expect(spy7).toHaveBeenCalledTimes(7);
        expect(component['ctx'].fillStyle).not.toEqual('#FF0000');
    });

    it('displaySlider should not create color gradient and update cursor if the canvas context doesnt exist', () => {
        component['ctx'] = null;
        const spy6 = spyOn(component, 'displaySelector').and.callThrough();
        const spy7 = spyOn(CanvasGradient.prototype, 'addColorStop').and.callThrough();
        // @ts-ignore
        spyOn(component.sliderCanvas.nativeElement, ['getContext']).and.returnValue(null);
        component.displaySlider();
        expect(spy6).not.toHaveBeenCalled();
        expect(spy7).not.toHaveBeenCalled();
    });

    it('displaySelector should update the cursor height and color', () => {
        component['cursor'].style.top = '5465465px';
        spyOn(component, 'getColorAtPoint').and.callThrough();
        component.displaySelector();
        expect(component.getColorAtPoint).toHaveBeenCalled();
        expect(component['cursor'].style.top).not.toEqual('5465465px');
    });
});

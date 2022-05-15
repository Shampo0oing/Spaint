import { ElementRef, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider } from '@angular/material/slider';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';
import { ColorPaletteComponent } from './color-palette.component';
// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
describe('ColorPaletteComponent', () => {
    let component: ColorPaletteComponent;
    let fixture: ComponentFixture<ColorPaletteComponent>;
    let event: MouseEvent;
    const canvas = document.createElement('canvas');

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPaletteComponent, MatSlider],
            imports: [FormsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPaletteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        event = {} as MouseEvent;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnChanges should display palette if color has been changed', () => {
        // tslint:disable-next-line:no-any
        const previousValue = 'rgba(0, 0, 0, 1)';
        const currentValue = 'rgba(211, 42, 99, 0.47)';
        spyOn(component, 'displayPalette').and.callThrough();
        component.ngOnChanges({
            color: new SimpleChange(previousValue, currentValue, false),
        });
        expect(component.displayPalette).toHaveBeenCalled();
    });

    it('ngOnChanges should do nothing if no changes', () => {
        spyOn(component, 'displayPalette').and.callThrough();
        component.ngOnChanges({});
        expect(component.displayPalette).not.toHaveBeenCalled();
    });

    it('updateCurrentPosition should update the cursor position', () => {
        const event2: MouseEvent = { pageX: 50, pageY: 50 } as MouseEvent;
        spyOn(component.paletteCanvas.nativeElement, 'getBoundingClientRect').and.returnValue({ top: 0, left: 0 } as DOMRect);
        component.updateCurrentPosition(event2);
        expect(component['currentPosition'].x).toEqual(event2.pageX);
        expect(component['currentPosition'].y).toEqual(event2.pageY);
    });

    it('updateCurrentPosition should set y position to 250 if the value was initially lower', () => {
        const event2: MouseEvent = { pageX: 50, pageY: -12 } as MouseEvent;
        spyOn(component.paletteCanvas.nativeElement, 'getBoundingClientRect').and.returnValue({ top: 0, left: 0 } as DOMRect);
        component.updateCurrentPosition(event2);
        expect(component['currentPosition'].y).toEqual(0);
    });

    it('updateCurrentPosition should set y position to 250 if the value was initially greater', () => {
        const event2: MouseEvent = { pageX: 50, pageY: 260 } as MouseEvent;
        spyOn(component.paletteCanvas.nativeElement, 'getBoundingClientRect').and.returnValue({ top: 0, left: 0 } as DOMRect);
        component.updateCurrentPosition(event2);
        expect(component['currentPosition'].y).toEqual(250);
    });

    it('updateCurrentPosition should set x position to 0 if the value was initially lower', () => {
        const event2: MouseEvent = { pageX: -12, pageY: 200 } as MouseEvent;
        spyOn(component.paletteCanvas.nativeElement, 'getBoundingClientRect').and.returnValue({ top: 0, left: 0 } as DOMRect);
        component.updateCurrentPosition(event2);
        expect(component['currentPosition'].x).toEqual(0);
    });

    it('updateCurrentPosition should set x position to 250 if the value was initially greater', () => {
        const event2: MouseEvent = { pageX: 280, pageY: 200 } as MouseEvent;
        spyOn(component.paletteCanvas.nativeElement, 'getBoundingClientRect').and.returnValue({ top: 0, left: 0 } as DOMRect);
        component.updateCurrentPosition(event2);
        expect(component['currentPosition'].x).toEqual(249);
    });

    it('onMouseDown should forward call to preventDefault, stopImmediatePropagation, updateCurrentPosition and displaySelector', () => {
        const eventSpyObj = jasmine.createSpyObj('MouseEvent', ['preventDefault', 'stopImmediatePropagation']);
        const updateCurrentPositionSpy = spyOn(component, 'updateCurrentPosition').and.stub();
        const displaySelectorSpy = spyOn(component, 'displaySelector').and.stub();
        component.onMouseDown(eventSpyObj);
        expect(eventSpyObj.preventDefault).toHaveBeenCalled();
        expect(eventSpyObj.stopImmediatePropagation).toHaveBeenCalled();
        expect(component['mouseDown']).toBeTrue();
        expect(updateCurrentPositionSpy).toHaveBeenCalledWith(eventSpyObj);
        expect(displaySelectorSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should set cursor style to context menu and update mouseDown to false', () => {
        component['mouseDown'] = true;
        component.onMouseUp();
        expect(component['cursor'].style.cursor).toEqual('context-menu');
        expect(component['mouseDown']).toBeFalse();
    });

    it(' onMouseMove should forward call updateCurrentPosition and displaySelector if mouseDown is true', () => {
        component['mouseDown'] = true;
        const updateSpy = spyOn(component, 'updateCurrentPosition');
        const displaySelectorSpy = spyOn(component, 'displaySelector');
        component.onMouseMove(event);
        expect(updateSpy).toHaveBeenCalledWith(event);
        expect(displaySelectorSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should do nothing if mousDown isnt true', () => {
        component['mouseDown'] = false;
        const updateSpy = spyOn(component, 'updateCurrentPosition');
        const displaySelectorSpy = spyOn(component, 'displaySelector');
        component.onMouseMove(event);
        expect(updateSpy).not.toHaveBeenCalled();
        expect(displaySelectorSpy).not.toHaveBeenCalled();
    });

    it('displayPalette should create the canvas context, create color gradient and update cursor', () => {
        component['ctx'] = canvas.getContext('2d') as CanvasRenderingContext2D;
        component['ctx'].fillStyle = '#FF0000';
        const spy1 = spyOn(component['ctx'], 'createLinearGradient').and.callThrough();
        const spy2 = spyOn(component['ctx'], 'fillRect').and.callThrough();
        const spy3 = spyOn(component, 'displaySelector').and.callThrough();
        const spy4 = spyOn(CanvasGradient.prototype, 'addColorStop').and.callThrough();
        component.displayPalette();
        expect(spy1).toHaveBeenCalledTimes(2);
        expect(spy2).toHaveBeenCalledTimes(3);
        expect(spy3).toHaveBeenCalled();
        expect(spy4).toHaveBeenCalledTimes(4);
        expect(component['ctx'].fillStyle).not.toEqual('#FF0000');
    });

    it('displayPalette should not create color gradient and update cursor if the canvas context and paletteCanvas dont exist', () => {
        component['ctx'] = null;
        component.paletteCanvas = (null as unknown) as ElementRef<HTMLCanvasElement>;
        const spy1 = spyOn(component, 'displaySelector').and.callThrough();
        const spy2 = spyOn(CanvasGradient.prototype, 'addColorStop').and.callThrough();
        component.displayPalette();
        expect(spy1).toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
    });

    it('displaySelector should update cursor style and forward call to getColorAtThisPoint and sendPositionColor', () => {
        const getColorAtPointSpy = spyOn(component, 'getColorAtPoint').and.returnValue(new Color(154, 46, 78, 0.68));
        const sendPositionColorSpy = spyOn(component, 'sendPositionColor').and.stub();
        component['cursor'].style.backgroundColor = new Color(241, 154, 103, 1).toRgba();
        component['cursor'].style.cursor = 'pointer';
        component['cursor'].style.top = `${component['currentPosition'].x}px`;
        component['cursor'].style.left = `${component['currentPosition'].y}px`;
        component.displaySelector();
        expect(getColorAtPointSpy).toHaveBeenCalled();
        expect(sendPositionColorSpy).toHaveBeenCalled();
        expect(component['cursor'].style.backgroundColor).toEqual(component.getColorAtPoint().toRgba());
        expect(component['cursor'].style.cursor).toEqual('none');
        expect(component['cursor'].style.top).toEqual(`${component['currentPosition'].y}px`);
        expect(component['cursor'].style.left).toEqual(`${component['currentPosition'].x}px`);
    });

    it('displaySelector should update cursor style and forward call to getColorAtThisPoint and sendPositionColor', () => {
        component['currentPosition'] = (null as unknown) as Vec2;
        const getColorAtPointSpy = spyOn(component, 'getColorAtPoint').and.returnValue(new Color(154, 46, 78, 0.68));
        const sendPositionColorSpy = spyOn(component, 'sendPositionColor').and.stub();
        component.displaySelector();
        expect(getColorAtPointSpy).not.toHaveBeenCalled();
        expect(sendPositionColorSpy).not.toHaveBeenCalled();
    });

    it('sendPositionColor should forward call to emit', () => {
        const emitSpy = spyOn(component['colorChange'], 'emit').and.stub();
        const getColorAtPointSpy = spyOn(component, 'getColorAtPoint').and.returnValue(new Color(154, 46, 78, 0.68));
        component.sendPositionColor();
        expect(getColorAtPointSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(component.getColorAtPoint());
    });

    it('getColorAtPoint should forward call to getImageData and return default color if pathData length less than 2', () => {
        component['currentPosition'] = { x: 0, y: 0 } as Vec2;
        spyOn(component['ctx'] as CanvasRenderingContext2D, 'getImageData').and.returnValue(({ data: [156, 32, 45] } as unknown) as ImageData);
        component.getColorAtPoint();
        expect(component['ctx']?.getImageData).toHaveBeenCalled();
        expect(component.getColorAtPoint()).toEqual(new Color(156, 32, 45, 1));
    });

    it('getColorAtPoint should return default color if canvas and currentPosition dont exist', () => {
        component['currentPosition'] = (null as unknown) as Vec2;
        spyOn(component['ctx'] as CanvasRenderingContext2D, 'getImageData').and.returnValue(([156, 32, 45] as unknown) as ImageData);
        component.getColorAtPoint();
        expect(component['ctx']?.getImageData).not.toHaveBeenCalled();
        expect(component.getColorAtPoint()).toEqual(new Color());
    });
});

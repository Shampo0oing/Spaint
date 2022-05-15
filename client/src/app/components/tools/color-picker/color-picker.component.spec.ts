import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatSlider } from '@angular/material/slider';
import { MatTab } from '@angular/material/tabs';
import { Color } from '@app/classes/color';
import { ColorPaletteComponent } from './color-palette/color-palette.component';
import { ColorPickerComponent } from './color-picker.component';
import { ColorSliderComponent } from './color-slider/color-slider.component';

describe('ColorPickerComponent', () => {
    // tslint:disable:no-string-literal
    // tslint:disable:no-magic-numbers
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;
    const expectedColor: Color = new Color(25, 25, 25, 1);
    const eventStub: Event = {
        // @ts-ignore
        target: { parentElement: { parentElement: {} }, validity: {} },
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPickerComponent, MatSlider, ColorPaletteComponent, ColorSliderComponent, MatTab, MatIcon],
            imports: [FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('popupTitle has default value', () => {
        expect(component.popupTitle).toEqual('Color Picker');
    });

    it('ngOnChanges should update the color if initialColor change', () => {
        component.color = new Color(56, 3, 78, 1);
        component.initialColor = new Color().toRgba();
        const previousValue = 'rgba(0, 0, 0, 1)';
        const currentValue = 'rgba(211, 42, 99, 0.47)';
        spyOn(component.color, 'setAttributes').and.callThrough();
        component.ngOnChanges({
            initialColor: new SimpleChange(previousValue, currentValue, false),
        });
        expect(component.color.setAttributes).toHaveBeenCalledWith(component.initialColor);
    });

    it('ngOnChanges should do nothing there is no changes', () => {
        spyOn(component.color, 'setAttributes').and.callThrough();
        expect(component.color.setAttributes).not.toHaveBeenCalled();
        component.ngOnChanges({});
        expect(component.color.setAttributes).not.toHaveBeenCalledWith(component.initialColor);
    });

    it('restorePreviousColor should set the current color to the previous one', () => {
        spyOn(component, 'setColor').and.callThrough();
        component.restorePreviousColor();
        expect(component.setColor).toHaveBeenCalled();
    });

    it('setSliderColor should set the sliderColor to the color parameter', () => {
        const expectedString = 'rgba(15, 15, 15, 1)';
        component.setSliderColor(expectedString);
        expect(component.sliderColor).toEqual(expectedString);
    });

    it('openColorPicker should put display to block to open the color picker', () => {
        component['popup'].style.display = 'none';
        const spy = spyOn(component.popupOpened, 'emit').and.callThrough();
        component.openColorPicker();
        expect(component['popup'].style.display).toEqual('block');
        expect(spy).toHaveBeenCalled();
    });

    it('closeColorPicker should put display mod to none to close the color picker', () => {
        component['popup'].style.display = 'block';
        const spy = spyOn(component, 'restorePreviousColor').and.callThrough();
        component.closeColorPicker();
        expect(component['popup'].style.display).toEqual('none');
        expect(spy).toHaveBeenCalled();
    });

    it('cancelColor should rest the color and close the color picker', () => {
        component['popup'].style.display = 'block';
        const spy = spyOn(component, 'restorePreviousColor').and.callThrough();
        component.cancelColor();
        expect(component['popup'].style.display).toEqual('none');
        expect(spy).toHaveBeenCalled();
    });

    it('confirmColor should add color to history and forward call to setColor', () => {
        spyOn(component, 'setColor').and.stub();
        component.color = expectedColor;
        component['popup'].style.display = 'block';
        component.colorPickerService.colorHistory = [];
        for (let i = 0; i < 10; i++) {
            if (i === 9) component.colorPickerService.colorHistory.push(new Color());
            else component.colorPickerService.colorHistory.push(expectedColor);
        }
        component.confirmColor();
        expect(component.colorPickerService.colorHistory[component.colorPickerService.colorHistory.length - 1]).toEqual(expectedColor);
        expect(component['popup'].style.display).toEqual('none');
        expect(component.setColor).toHaveBeenCalledWith(expectedColor, true);
    });

    it('confirmColor should not add color in history if its just an opacity modification', () => {
        component.previousColor = new Color(0, 255, 0, 1);
        component.color = new Color(0, 255, 0, 0.56);
        component.colorPickerService.colorHistory = [];
        component.confirmColor();
        expect(component.colorPickerService.colorHistory[component.colorPickerService.colorHistory.length - 1]).not.toEqual(component.color);
    });

    it('confirmColor should not remove the last history color if less than 10 elements ', () => {
        const popSpy = spyOn(component.colorPickerService.colorHistory, 'pop').and.stub();
        component.previousColor = new Color(10, 255, 0, 1);
        component.color = new Color(0, 255, 0, 0.56);
        component.colorPickerService.colorHistory.length = 9;
        component.confirmColor();
        expect(popSpy).not.toHaveBeenCalled();
    });

    it('validateRgbaSliderInput should confirm if input value is valid and update the color with it', () => {
        const matSliderStub: MatSlider = {
            _elementRef: { nativeElement: { parentElement: {} as HTMLElement } as HTMLElement } as ElementRef,
        } as MatSlider;
        spyOn(component, 'setColor').and.callThrough();
        matSliderStub._elementRef.nativeElement.parentElement.id = 'r';
        matSliderStub.value = 15;
        component.validateRgbaSliderInput(matSliderStub);
        expect(component.color.r).toEqual(15);
        expect(component.setColor).toHaveBeenCalled();
    });

    it('validateRgbaInput should confirm if input value of "a" is valid and update the color with it', () => {
        // @ts-ignore
        eventStub.target.parentElement.parentElement.id = 'a';
        // @ts-ignore
        eventStub.target.validity.valid = true;
        const expectedValue = '0.94';
        // @ts-ignore
        eventStub.target.value = expectedValue;
        component.validateRgbaInput(eventStub);
        // @ts-ignore
        expect(component.color[eventStub.target.parentElement.parentElement.id]).toEqual(parseFloat(expectedValue));
    });

    it('validateRgbaInput should confirm if input value of "r,g,b" is valid and update the color with it', () => {
        // @ts-ignore
        eventStub.target.parentElement.parentElement.id = 'r';
        // @ts-ignore
        eventStub.target.validity.valid = true;
        const expectedValue = '230';
        // @ts-ignore
        eventStub.target.value = expectedValue;
        component.validateRgbaInput(eventStub);
        // @ts-ignore
        expect(component.color[eventStub.target.parentElement.parentElement.id]).toEqual(parseInt(expectedValue, 10));
    });

    it('validateRgbaInput should if the input is not valid, juste update the input preview', () => {
        // @ts-ignore
        eventStub.target.parentElement.parentElement.id = 'r';
        // @ts-ignore
        eventStub.target.validity.valid = false;
        // @ts-ignore
        eventStub.target.value = '230';
        component.validateRgbaInput(eventStub);
        // @ts-ignore
        expect(eventStub.target.value).toEqual(String(component.color[eventStub.target.parentElement.parentElement.id]));
    });

    it('validateRgbaInput should do nothing the event target doesnt have parent', () => {
        component.color = expectedColor;
        const event: Event = ({ target: { value: '255' } } as unknown) as Event;
        component.validateRgbaInput(event);
        expect(component.color).toEqual(expectedColor);
        // @ts-ignore
        expect(event.target.value).toEqual('255');
    });

    it('validateHexInput should set the color attributes if the input value is valid', () => {
        const event: Event = ({ target: { value: '#000000', parentElement: { style: { borderColor: '#ffffff' } } } } as unknown) as Event;
        const spy = spyOn(component.color, 'setAttributes').and.stub();
        component.validateHexInput(event);
        // @ts-ignore
        expect(spy).toHaveBeenCalledWith(event.target.value);
    });

    it('validateHexInput should update input preview if value not valid and called with a change event', () => {
        const event: Event = ({
            target: { value: '########', parentElement: { style: { borderColor: '#ffffff' } } },
            type: 'change',
        } as unknown) as Event;
        component.color = expectedColor;
        const spy = spyOn(component.color, 'toHex').and.stub();
        // @ts-ignore
        component.validateHexInput(event);
        expect(spy).toHaveBeenCalled();
        // @ts-ignore
        expect(event.target.value).toEqual(component.color.toHex());
    });

    it('validateHexInput should do nothing if value is invalid', () => {
        const event: Event = ({ target: { value: '#%$%#@$%', parentElement: { style: { borderColor: '#ffffff' } } } } as unknown) as Event;
        component.color = expectedColor;
        spyOn(component.color, 'setAttributes').and.stub();
        spyOn(component.color, 'toHex').and.stub();
        // @ts-ignore
        component.validateHexInput(event);
        expect(component.color.toHex).not.toHaveBeenCalled();
        // @ts-ignore
        expect(event.target.value).toEqual('#%$%#@$%');
        // @ts-ignore
        expect(component.color.setAttributes).not.toHaveBeenCalled();
    });

    it('validateHexInput should do nothing if target has no parentElement', () => {
        const event: Event = ({ target: { value: '#%$%#@$%' } } as unknown) as Event;
        // @ts-ignore
        const matchSpy = spyOn(event.target.value, 'match').and.stub();
        component.validateHexInput(event);
        expect(matchSpy).not.toHaveBeenCalled();
    });

    it('validateLongRgbaInput should not set the color attributes if the input value is valid', () => {
        const event: Event = ({ target: { value: '240, 90, 124, 0.86', parentElement: { style: { borderColor: '#ffffff' } } } } as unknown) as Event;
        const spy = spyOn(component.color, 'setAttributes').and.stub();
        component.validateLongRgbaInput(event);
        // @ts-ignore
        expect(spy).toHaveBeenCalledWith(event.target.value);
    });

    it('validateLongRgbaInput should not set the color attributes if target has no parentElement', () => {
        const event: Event = ({ target: { value: '240, 90, 124, 0.86' } } as unknown) as Event;
        // @ts-ignore
        const matchSpy = spyOn(event.target.value, 'match').and.stub();
        component.validateLongRgbaInput(event);
        expect(matchSpy).not.toHaveBeenCalled();
    });

    it('validateLongRgbaInput update input preview if value not valid and called with a change event', () => {
        const event: Event = ({
            target: { value: '*-+89623', parentElement: { style: { borderColor: '#ffffff' } } },
            type: 'change',
        } as unknown) as Event;
        component.color = expectedColor;
        const spy = spyOn(component.color, 'toRgba').and.stub();
        component.validateLongRgbaInput(event);
        // @ts-ignore
        expect(spy).toHaveBeenCalled();
        // @ts-ignore
        expect(event.target.value).toEqual(component.color.toRgba(false));
    });

    it('validateLongRgbaInput should do nothing', () => {
        const event: Event = ({
            target: { value: '270, 90, 941, 0.86', parentElement: { style: { borderColor: '#ffffff' } } },
            type: 'input',
        } as unknown) as Event;
        spyOn(component.color, 'setAttributes').and.stub();
        spyOn(component.color, 'toRgba').and.stub();
        component.validateLongRgbaInput(event);
        // @ts-ignore
        expect(component.color.setAttributes).not.toHaveBeenCalledWith(event.target.value);
        // @ts-ignore
        expect(component.color.toRgba).not.toHaveBeenCalled();
        // @ts-ignore
        expect(event.target.value).toEqual('270, 90, 941, 0.86');
    });

    it('setColor should set the previous color to the new one if confirmed and update current one, emit it', () => {
        const colorStub = expectedColor;
        spyOn(component, 'emitColor').and.callThrough();
        component.setColor(colorStub, true);
        expect(component.previousColor).toEqual(expectedColor);
        expect(component.color).toEqual(expectedColor);
        expect(component.emitColor).toHaveBeenCalledWith(colorStub);
    });

    it('emitColor should emit a color with the color emitter, to a rgba format', () => {
        const colorStub = new Color();
        spyOn(colorStub, 'toRgba').and.callThrough();
        spyOn(component.colorEmitter, 'emit').and.callThrough();
        component.emitColor(colorStub);
        expect(colorStub.toRgba).toHaveBeenCalled();
        expect(component.colorEmitter.emit).toHaveBeenCalled();
    });
});

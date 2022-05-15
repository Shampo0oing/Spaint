import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { Color } from '@app/classes/color';
import { ColorPickerService } from '@app/services/tools/color-picker/color-picker.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements AfterViewInit, OnChanges {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;
    @ViewChild('colorChange-button') colorButton: ElementRef;
    @Input() popupTitle: string = 'Color Picker';
    @Input() initialColor: string;
    @Output() colorEmitter: EventEmitter<string> = new EventEmitter();
    @Output() popupOpened: EventEmitter<boolean> = new EventEmitter();
    @Output() rightClickHistory: EventEmitter<string> = new EventEmitter();
    @Output() leftClickHistory: EventEmitter<string> = new EventEmitter();

    constructor(public colorPickerService: ColorPickerService, protected toolSelector: ToolSelectorService) {}

    private popup: HTMLElement;

    color: Color = new Color(); // le noir est la couleur de base
    previousColor: Color = new Color(); // si on cancel dès le debut on revient au noir
    sliderColor: string;

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.initialColor) return;
        this.color.setAttributes(this.initialColor);
    }

    restorePreviousColor(): void {
        this.setColor(this.previousColor);
    }

    setSliderColor(color: string): void {
        this.sliderColor = color;
    }

    openColorPicker(): void {
        this.popupOpened.emit(true);
        this.popup.style.display = 'block';
    }

    closeColorPicker(): void {
        this.popup.style.display = 'none';
        this.restorePreviousColor();
    }

    cancelColor(): void {
        this.restorePreviousColor();
        this.popup.style.display = 'none';
    }

    confirmColor(): void {
        this.popup.style.display = 'none';
        const maxColor = 10;
        if (this.color.toHex() !== this.previousColor.toHex()) {
            if (this.colorPickerService.colorHistory.length >= maxColor) this.colorPickerService.colorHistory.pop();
            this.colorPickerService.colorHistory.unshift(new Color(this.color.r, this.color.g, this.color.b, this.color.a));
        }
        this.setColor(this.color, true);
    }

    validateRgbaSliderInput(event: MatSlider): void {
        const id = event._elementRef.nativeElement.parentElement.id as 'r' | 'g' | 'b' | 'a';
        this.color[id] = event.value as number;
        this.setColor(this.color);
    }

    validateRgbaInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (!target.parentElement?.parentElement?.id) return;

        const id = target.parentElement.parentElement.id as 'r' | 'g' | 'b' | 'a';
        if (target.validity.valid) this.color[id] = id === 'a' ? parseFloat(target.value) : parseInt(target.value, 10);
        else target.value = String(this.color[id]);
    }

    validateHexInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (!target.parentElement) return;
        const inputStyle = target.parentElement.style as CSSStyleDeclaration;
        // regular expression qui permet de n'accepter que des valeurs hexadecimales
        if (target.value.match(/^#([a-fA-F0-9]{6})$/)) {
            this.color.setAttributes(target.value);
            this.emitColor(this.color);
            inputStyle.borderColor = '#b8c1ec';
        } else if (event.type === 'change') {
            target.value = this.color.toHex();
            inputStyle.borderColor = '#b8c1ec';
        } else {
            inputStyle.borderColor = '#b53333';
        }
    }

    validateLongRgbaInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (!target.parentElement) return;

        const inputStyle = target.parentElement.style as CSSStyleDeclaration;
        // expression regulière qui permet de n'accepter que des valeurs de format rgba
        if (target.value.match(/^((1?\d{1,2}|2[0-4]\d|25[0-5]),\s){3}(1|0|0\.\d{1,2})$/)) {
            this.color.setAttributes(target.value);
            this.emitColor(this.color);
            inputStyle.borderColor = '#b8c1ec';
        } else if (event.type === 'change') {
            target.value = this.color.toRgba(false);
            inputStyle.borderColor = '#b8c1ec';
        } else {
            inputStyle.borderColor = '#b53333';
        }
    }

    setColor(color: Color, isConfirmed: boolean = false): void {
        if (isConfirmed) this.previousColor = new Color(color.r, color.g, color.b, color.a);
        this.color = color;
        this.emitColor(color);
    }

    emitColor(color: Color): void {
        this.colorEmitter.emit(color.toRgba());
    }
}

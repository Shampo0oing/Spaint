// ce component a été inspirer du tutoriel suivant : https://malcoded.com/posts/angular-color-picker/
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'app-color-slider',
    templateUrl: './color-slider.component.html',
    styleUrls: ['./color-slider.component.scss'],
})
export class ColorSliderComponent implements AfterViewInit {
    @ViewChild('sliderCanvas') sliderCanvas: ElementRef;
    @ViewChild('sliderCursor') sliderCursor: ElementRef;
    @Output() colorChange: EventEmitter<string> = new EventEmitter();

    private ctx: CanvasRenderingContext2D | null;
    private mouseDown: boolean = false;
    private selectedHeight: number; // on initialise a la hauteur minimal du curseur
    private width: number;
    private height: number;
    private cursor: HTMLElement;

    ngAfterViewInit(): void {
        this.width = this.sliderCanvas.nativeElement.width;
        this.height = this.sliderCanvas.nativeElement.height;
        this.selectedHeight = 1;
        this.displaySlider();
    }

    updateCurrentHeight(event: MouseEvent): void {
        this.selectedHeight = event.pageY - this.sliderCanvas.nativeElement.getBoundingClientRect().top - window.scrollY;
        // Verifier les limites du canvas pour empecher le curseur de sortir
        if (this.selectedHeight <= 0) this.selectedHeight = 1;
        // tslint:disable-next-line:no-magic-numbers
        else if (this.selectedHeight >= 250) this.selectedHeight = 249;
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(): void {
        this.mouseDown = false;
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.updateCurrentHeight(event);
            this.displaySelector();
            this.emitColor();
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = true;
        this.updateCurrentHeight(event);
        this.displaySelector();
        this.emitColor();
    }

    displaySlider(): void {
        if (!this.ctx) this.ctx = this.sliderCanvas.nativeElement.getContext('2d');

        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            const fade = this.ctx.createLinearGradient(0, 0, 0, this.height);
            fade.addColorStop(0, 'red');
            // tslint:disable-next-line:no-magic-numbers
            fade.addColorStop(0.17, 'yellow');
            // tslint:disable-next-line:no-magic-numbers
            fade.addColorStop(0.34, 'green');
            // tslint:disable-next-line:no-magic-numbers
            fade.addColorStop(0.51, 'cyan');
            // tslint:disable-next-line:no-magic-numbers
            fade.addColorStop(0.68, 'blue');
            // tslint:disable-next-line:no-magic-numbers
            fade.addColorStop(0.85, 'purple');
            fade.addColorStop(1, 'red');

            this.ctx.fillStyle = fade;
            this.ctx.beginPath();
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.closePath();

            this.displaySelector();
        }
    }

    displaySelector(): void {
        if (!this.cursor) this.cursor = this.sliderCursor.nativeElement;

        this.cursor.style.backgroundColor = this.getColorAtPoint();
        this.cursor.style.top = `${this.selectedHeight}px`;
    }

    emitColor(): void {
        this.colorChange.emit(this.getColorAtPoint());
    }

    getColorAtPoint(): string {
        if (this.ctx && this.selectedHeight) {
            const imageData = this.ctx.getImageData(this.width / 2, this.selectedHeight, 1, 1).data;
            const rgbColor = `${imageData[0]}, ${imageData[1]}, ${imageData[2]}`;
            return `rgba(${rgbColor}, 1)`;
        }
        return 'transparent';
    }
}

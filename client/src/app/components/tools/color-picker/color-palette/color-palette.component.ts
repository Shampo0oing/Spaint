// ce component a été inspirer du tutoriel suivant : https://malcoded.com/posts/angular-color-picker/
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Color } from '@app/classes/color';
import { Vec2 } from '@app/classes/vec2';

@Component({
    selector: 'app-color-palette',
    templateUrl: './color-palette.component.html',
    styleUrls: ['./color-palette.component.scss'],
})
export class ColorPaletteComponent implements AfterViewInit, OnChanges {
    @ViewChild('paletteCanvas') paletteCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('paletteCursor') paletteCursor: ElementRef;
    private ctx: CanvasRenderingContext2D | null;
    private mouseDown: boolean = false;
    private currentPosition: Vec2; // on initialise le curseur en haut a gauche de la palette
    private cursor: HTMLElement;
    @Input() color: string;
    @Output() colorChange: EventEmitter<Color> = new EventEmitter(true);

    ngAfterViewInit(): void {
        this.cursor = this.paletteCursor.nativeElement;
        this.currentPosition = { x: 249, y: 0 };
        this.displayPalette();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.color) {
            this.displayPalette();
        }
    }

    updateCurrentPosition(event: MouseEvent): void {
        this.currentPosition = {
            x: event.pageX - this.paletteCanvas.nativeElement.getBoundingClientRect().left - window.scrollX,
            y: event.pageY - this.paletteCanvas.nativeElement.getBoundingClientRect().top - window.scrollY,
        };
        // Verifier les limites du canvas pour empecher le curseur de sortir
        const taille = this.paletteCanvas.nativeElement.width;
        if (this.currentPosition.y < 0) this.currentPosition.y = 0;
        else if (this.currentPosition.y > taille) this.currentPosition.y = taille;
        if (this.currentPosition.x < 0) this.currentPosition.x = 0;
        else if (this.currentPosition.x >= taille) this.currentPosition.x = taille - 1;
    }

    onMouseDown(event: MouseEvent): void {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.mouseDown = true;
        this.updateCurrentPosition(event);
        this.displaySelector();
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(): void {
        this.cursor.style.cursor = 'context-menu';
        this.mouseDown = false;
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.updateCurrentPosition(event);
            this.displaySelector();
        }
    }

    displayPalette(): void {
        if (!this.ctx && this.paletteCanvas) this.ctx = this.paletteCanvas.nativeElement.getContext('2d');

        if (this.ctx) {
            const width = this.paletteCanvas.nativeElement.width;
            const height = this.paletteCanvas.nativeElement.height;
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(0, 0, width, height);

            const whiteFade = this.ctx.createLinearGradient(0, 0, width, 0);
            whiteFade.addColorStop(0, 'rgba(255, 255, 255, 1)');
            whiteFade.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = whiteFade;
            this.ctx.fillRect(0, 0, width, height);

            const blackFade = this.ctx.createLinearGradient(0, 0, 0, height);
            blackFade.addColorStop(0, 'rgba(0, 0, 0, 0)');
            blackFade.addColorStop(1, 'rgba(0, 0, 0, 1)');
            this.ctx.fillStyle = blackFade;
            this.ctx.fillRect(0, 0, width, height);
        }
        this.displaySelector();
    }

    displaySelector(): void {
        if (this.currentPosition && this.cursor) {
            const color = this.getColorAtPoint();
            this.cursor.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
            this.cursor.style.cursor = 'none';
            this.cursor.style.top = `${this.currentPosition.y}px`;
            this.cursor.style.left = `${this.currentPosition.x}px`;
            this.sendPositionColor();
        }
    }

    sendPositionColor(): void {
        this.colorChange.emit(this.getColorAtPoint());
    }

    getColorAtPoint(): Color {
        if (this.ctx && this.currentPosition) {
            const imageData = this.ctx.getImageData(this.currentPosition.x, this.currentPosition.y, 1, 1).data;
            return new Color(imageData[0], imageData[1], imageData[2], 1);
        }
        return new Color(0, 0, 0, 1);
    }
}

import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSliderChange } from '@angular/material/slider';
import { OPACITY_MAX, OPACITY_MIN, SQUARE_MAX_SIZE, SQUARE_MIN_SIZE } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
})
export class GridComponent extends GenericToolComponent implements AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;

    // ces constantes sont utilisées dans le html
    SQUARE_MIN_SIZE: number = SQUARE_MIN_SIZE;
    SQUARE_MAX_SIZE: number = SQUARE_MAX_SIZE;
    OPACITY_MIN: number = OPACITY_MIN;
    OPACITY_MAX: number = OPACITY_MAX;

    constructor(public drawingService: DrawingService, public toolSelector: ToolSelectorService) {
        super(toolSelector);
    }

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
        this.popup.style.display = 'none';
    }

    selectGrid(): void {
        if (this.popup.style.display === 'none' && !this.drawingService.mouseDown) this.openParametre();
    }

    changeOpacitySlider(event: MatSliderChange): void {
        this.drawingService.opacity = event.value ? event.value : OPACITY_MIN;
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
    }

    changeSquareSizeSlider(event: MatSliderChange): void {
        this.drawingService.squareSize = event.value ? event.value : SQUARE_MIN_SIZE;
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
    }

    toggle(event: MatSlideToggleChange): void {
        this.drawingService.showGrid = event.checked;
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
    }
}

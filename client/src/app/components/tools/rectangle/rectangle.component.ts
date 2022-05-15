import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { RECTANGLE_KEY } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-rectangle',
    templateUrl: './rectangle.component.html',
    styleUrls: ['./rectangle.component.scss'],
})
export class RectangleComponent extends GenericToolComponent implements OnInit, AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;
    rectangleWidth: number;
    // ces constantes sont utilisées dans le html
    RECTANGLE_MIN_WIDTH: number = 1;
    RECTANGLE_MAX_WIDTH: number = 50;

    constructor(private drawingService: DrawingService, public toolSelector: ToolSelectorService) {
        super(toolSelector);
        this.rectangleWidth = this.drawingService.rectangleWidth;
    }

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
    }

    ngOnInit(): void {
        const som = document.getElementById('typeSelector') as HTMLInputElement;
        som.value = String(this.drawingService.traceTypeRectangle);
    }

    selectRectangle(): void {
        this.toolSelector.setTool(RECTANGLE_KEY);
        if (this.popup.style.display === 'none' && this.getCurrentTool() === 'rectangle') this.openParametre();
        else this.closeParametre();
    }

    changeTraceType(value: number): void {
        this.drawingService.traceTypeRectangle = Number(value);
    }

    changeRectangleWidthSlider(event: MatSliderChange): void {
        this.rectangleWidth = event.value ? event.value : this.RECTANGLE_MIN_WIDTH;
        this.drawingService.rectangleWidth = this.rectangleWidth;
    }
}

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { LINE_KEY } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-line',
    templateUrl: './line.component.html',
    styleUrls: ['./line.component.scss'],
})
export class LineComponent extends GenericToolComponent implements OnInit, AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;
    lineWidth: number;
    pointWidth: number;

    // ces constantes sont utilisées dans le html
    LINE_MIN_WIDTH: number = 1;
    LINE_MAX_WIDTH: number = 60;
    POINT_MIN_WIDTH: number = 1;
    POINT_MAX_WIDTH: number = 60;

    constructor(private drawingService: DrawingService, public toolSelector: ToolSelectorService) {
        super(toolSelector);
        this.lineWidth = this.drawingService.lineWidth;
        this.pointWidth = this.drawingService.pointWidth;
    }

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
        this.popup.style.display = 'none';
    }

    ngOnInit(): void {
        const som = document.getElementById('typeSelector') as HTMLInputElement;
        som.value = String(this.drawingService.junctionType);
    }

    selectLine(): void {
        this.toolSelector.setTool(LINE_KEY);
        if (this.popup.style.display === 'none' && this.getCurrentTool() === 'line') this.openParametre();
        else this.closeParametre();
    }

    changeLineWidthSlider(event: MatSliderChange): void {
        this.lineWidth = event.value ? event.value : this.LINE_MIN_WIDTH;
        this.drawingService.lineWidth = this.lineWidth;
    }

    changePointWidthSlider(event: MatSliderChange): void {
        this.pointWidth = event.value ? event.value : this.POINT_MIN_WIDTH;
        this.drawingService.pointWidth = this.pointWidth;
    }

    changeJunctionType(value: number): void {
        this.drawingService.junctionType = Number(value);
    }
}

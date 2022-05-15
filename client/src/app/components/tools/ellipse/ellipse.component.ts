import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { ELLIPSE_KEY } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-ellipse',
    templateUrl: './ellipse.component.html',
    styleUrls: ['./ellipse.component.scss'],
})
export class EllipseComponent extends GenericToolComponent implements OnInit, AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;
    ellipseWidth: number;
    // ces constantes sont utilisées dans le html
    ELLIPSE_MIN_WIDTH: number = 1;
    ELLIPSE_MAX_WIDTH: number = 50;
    constructor(private drawingService: DrawingService, public toolSelector: ToolSelectorService) {
        super(toolSelector);
        this.ellipseWidth = this.drawingService.ellipseWidth;
    }

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
        this.popup.style.display = 'none';
    }

    ngOnInit(): void {
        const som = document.getElementById('typeSelector') as HTMLInputElement;
        som.value = String(this.drawingService.traceTypeEllipse);
    }

    selectEllipse(): void {
        this.toolSelector.setTool(ELLIPSE_KEY);
        if (this.popup.style.display === 'none' && this.getCurrentTool() === 'ellipse') this.openParametre();
        else this.closeParametre();
    }

    changeTraceType(value: number): void {
        this.drawingService.traceTypeEllipse = Number(value);
    }

    changeEllipseWidthSlider(event: MatSliderChange): void {
        this.ellipseWidth = event.value ? event.value : this.ELLIPSE_MIN_WIDTH;
        this.drawingService.ellipseWidth = this.ellipseWidth;
    }
}

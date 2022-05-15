import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { POLYGON_KEY } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-polygon',
    templateUrl: './polygon.component.html',
    styleUrls: ['./polygon.component.scss'],
})
export class PolygonComponent extends GenericToolComponent implements OnInit, AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;

    numberOfEdges: number;
    // ces constantes sont utilisées dans le html
    POLYGON_MAX_EDGE: number = 12;
    POLYGON_MIN_EDGE: number = 3;
    POLYGON_MIN_WIDTH: number = 1;
    POLYGON_MAX_WIDTH: number = 60;
    polygonWidth: number;

    constructor(private drawingService: DrawingService, public toolSelector: ToolSelectorService) {
        super(toolSelector);
        this.polygonWidth = this.drawingService.polygonWidth;
        this.numberOfEdges = this.drawingService.numberOfEdges;
    }

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
        this.popup.style.display = 'none';
    }

    ngOnInit(): void {
        const som = document.getElementById('typeSelector') as HTMLInputElement;
        som.value = String(this.drawingService.traceTypePolygon);
    }

    selectPolygon(): void {
        this.toolSelector.setTool(POLYGON_KEY);
        if (this.popup.style.display === 'none' && this.getCurrentTool() === 'polygon') this.openParametre();
        else this.closeParametre();
    }

    changeTraceType(value: number): void {
        this.drawingService.traceTypePolygon = Number(value);
    }

    changePolygonEdgeSlider(event: MatSliderChange): void {
        this.numberOfEdges = event.value ? event.value : this.POLYGON_MIN_EDGE;
        this.drawingService.numberOfEdges = this.numberOfEdges;
    }

    changePolygonWidthSlider(event: MatSliderChange): void {
        this.polygonWidth = event.value ? event.value : this.POLYGON_MIN_WIDTH;
        this.drawingService.polygonWidth = this.polygonWidth;
    }
}

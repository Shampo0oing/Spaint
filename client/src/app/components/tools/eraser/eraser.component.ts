import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { ERASER_KEY } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-eraser',
    templateUrl: './eraser.component.html',
    styleUrls: ['./eraser.component.scss'],
})
export class EraserComponent extends GenericToolComponent implements OnInit, AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;

    eraserWidth: number;
    // ces constantes sont utilisées dans le html
    ERASER_MIN_WIDTH: number = 5;
    ERASER_MAX_WIDTH: number = 100;

    constructor(private drawingService: DrawingService, public toolSelector: ToolSelectorService) {
        super(toolSelector);
    }

    ngOnInit(): void {
        this.eraserWidth = this.drawingService.eraserWidth;
    }

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
    }

    selectEraser(): void {
        this.toolSelector.setTool(ERASER_KEY);
        if (this.popup.style.display === 'none' && this.getCurrentTool() === 'eraser') this.openParametre();
        else this.closeParametre();
    }

    changeEraserWidthSlider(event: MatSliderChange): void {
        this.eraserWidth = event.value ? event.value : this.ERASER_MIN_WIDTH;
        this.drawingService.eraserWidth = this.eraserWidth;
    }
}

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { PENCIL_KEY } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-pencil',
    templateUrl: './pencil.component.html',
    styleUrls: ['./pencil.component.scss'],
})
export class PencilComponent extends GenericToolComponent implements OnInit, AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;
    pencilWidth: number;

    // ces constantes sont utilisées dans le html
    PENCIL_MIN_WIDTH: number = 1;
    PENCIL_MAX_WIDTH: number = 60;

    constructor(private drawingService: DrawingService, public toolSelector: ToolSelectorService) {
        super(toolSelector);
    }

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
        this.popup.style.display = 'none';
    }
    ngOnInit(): void {
        this.pencilWidth = this.drawingService.pencilWidth;
    }

    selectPencil(): void {
        this.toolSelector.setTool(PENCIL_KEY);
        if (this.popup.style.display === 'none' && this.getCurrentTool() === 'pencil') this.openParametre();
        else this.closeParametre();
    }

    changePencilWidthSlider(event: MatSliderChange): void {
        this.pencilWidth = event.value ? event.value : this.PENCIL_MIN_WIDTH;
        this.drawingService.pencilWidth = this.pencilWidth;
    }
}

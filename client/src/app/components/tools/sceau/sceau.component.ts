import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { SCEAU_KEY } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-sceau',
    templateUrl: './sceau.component.html',
    styleUrls: ['./sceau.component.scss'],
})
export class SceauComponent extends GenericToolComponent implements AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;

    // ces constantes sont utilisées dans le html
    SCEAU_MIN_TOL: number = 0;
    SCEAU_MAX_TOL: number = 100;

    constructor(public drawingService: DrawingService, public toolSelector: ToolSelectorService) {
        super(toolSelector);
    }

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
        this.popup.style.display = 'none';
    }

    selectSceau(): void {
        this.toolSelector.setTool(SCEAU_KEY);
        if (this.popup.style.display === 'none') this.openParametre();
        else this.closeParametre();
    }

    changeTolEcartSlider(event: MatSliderChange): void {
        this.drawingService.tolEcart = event.value ? event.value : 0;
    }
}

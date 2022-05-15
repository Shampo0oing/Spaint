import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { STAMP_KEY } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-stamp',
    templateUrl: './stamp.component.html',
    styleUrls: ['./stamp.component.scss'],
})
export class StampComponent extends GenericToolComponent implements AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;
    drawingService: DrawingService;
    popupDim: Vec2 = { x: 0, y: 0 };

    constructor(public toolSelector: ToolSelectorService, public stampService: StampService, drawingService: DrawingService) {
        super(toolSelector);
        this.drawingService = drawingService;
    }

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
        this.popup.style.display = 'none';
    }

    selectStamp(): void {
        this.toolSelector.setTool(STAMP_KEY);
        if (this.popup.style.display === 'none' && this.getCurrentTool() === 'stampe') this.openParametre();
        else this.closeParametre();
    }
}

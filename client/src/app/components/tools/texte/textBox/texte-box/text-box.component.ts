import { Component } from '@angular/core';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from '@app/services/tools/text/text.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-text-box',
    templateUrl: './text-box.component.html',
    styleUrls: ['./text-box.component.scss'],
})
export class TextBoxComponent extends GenericToolComponent {
    drawingService: DrawingService;
    textService: TextService;

    constructor(drawingService: DrawingService, public toolSelector: ToolSelectorService, textService: TextService) {
        super(toolSelector);
        this.drawingService = drawingService;
        this.textService = textService;
    }
}

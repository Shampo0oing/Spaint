import { Component } from '@angular/core';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizerService } from '@app/services/resizer/resizer.service';
import { SelectionRectangleService } from '@app/services/tools/selection/selection-rectangle.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-selection-rectangle',
    templateUrl: './selection-rectangle.component.html',
    styleUrls: ['./selection-rectangle.component.scss'],
})
export class SelectionRectangleComponent extends GenericToolComponent {
    constructor(
        public drawingService: DrawingService,
        public toolSelector: ToolSelectorService,
        public selectionRectangleService: SelectionRectangleService,
        public resizerService: ResizerService,
    ) {
        super(toolSelector);
    }
}

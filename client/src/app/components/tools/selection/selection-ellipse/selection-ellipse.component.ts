import { Component } from '@angular/core';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizerService } from '@app/services/resizer/resizer.service';
import { SelectionEllipseService } from '@app/services/tools/selection/selection-ellipse.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-selection-ellipse',
    templateUrl: './selection-ellipse.component.html',
    styleUrls: ['./selection-ellipse.component.scss'],
})
export class SelectionEllipseComponent extends GenericToolComponent {
    constructor(
        public drawingService: DrawingService,
        public toolSelector: ToolSelectorService,
        public selectionEllipseService: SelectionEllipseService,
        public resizerService: ResizerService,
        public selectionService: SelectionService,
    ) {
        super(toolSelector);
    }
}

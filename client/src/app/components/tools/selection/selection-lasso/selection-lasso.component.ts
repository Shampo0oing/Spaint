import { Component } from '@angular/core';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizerService } from '@app/services/resizer/resizer.service';
import { SelectionLassoService } from '@app/services/tools/selection/selection-lasso.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-selection-lasso',
    templateUrl: './selection-lasso.component.html',
    styleUrls: ['./selection-lasso.component.scss'],
})
export class SelectionLassoComponent extends GenericToolComponent {
    constructor(
        public drawingService: DrawingService,
        public toolSelector: ToolSelectorService,
        public selectionLassoService: SelectionLassoService,
        public resizerService: ResizerService,
    ) {
        super(toolSelector);
    }
}

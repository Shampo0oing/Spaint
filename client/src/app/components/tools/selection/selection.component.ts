import { Component } from '@angular/core';
import { SELECTELLIPSE_KEY, SELECTLASSO_KEY, SELECTRECT_KEY } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionRectangleService } from '@app/services/tools/selection/selection-rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-selection',
    templateUrl: './selection.component.html',
    styleUrls: ['./selection.component.scss'],
})
export class SelectionComponent extends GenericToolComponent {
    constructor(
        public toolSelector: ToolSelectorService,
        public drawingService: DrawingService,
        public annulerRefaireService: AnnulerRefaireService,
        public selectionService: SelectionService,
    ) {
        super(toolSelector);
    }

    selectSelectionRectangle(): void {
        this.toolSelector.setTool(SELECTRECT_KEY);
    }

    selectSelectionEllipse(): void {
        this.toolSelector.setTool(SELECTELLIPSE_KEY);
    }

    selectSelectionLasso(): void {
        this.toolSelector.setTool(SELECTLASSO_KEY);
    }

    undo(): void {
        this.annulerRefaireService.undo();
    }

    redo(): void {
        this.annulerRefaireService.redo();
    }

    selectAll(): void {
        this.toolSelector.setTool(SELECTRECT_KEY);
        const currentTool = this.toolSelector.currentTool as SelectionRectangleService;
        currentTool.selectAll();
    }
}

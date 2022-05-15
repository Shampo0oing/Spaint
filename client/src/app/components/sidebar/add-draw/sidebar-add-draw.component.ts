import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/classes/constantes';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { ResizerService } from '@app/services/resizer/resizer.service';

@Component({
    selector: 'app-sidebar-add-draw',
    templateUrl: './sidebar-add-draw.component.html',
})
export class SidebarAddDrawComponent {
    constructor(
        public dialog: MatDialog,
        private drawingService: DrawingService,
        private annulerRefaireService: AnnulerRefaireService,
        public indexService: IndexService,
        private resizerService: ResizerService,
    ) {}
    newDraw(createDraw: boolean): void {
        if (createDraw) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.baseCtx.fillStyle = '#ffffff';
            this.resizerService.resizeImage({ x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT });
            this.drawingService.baseCtx.fillRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
            this.drawingService.removeSavedCanvas();
            this.annulerRefaireService.updateImageData();
        }
        this.dialog.closeAll();
        this.drawingService.dialogOpen = false;
    }
}

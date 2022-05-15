import { Injectable } from '@angular/core';
import { ActionPencil } from '@app/classes/Actions/action-pencil';
import { MouseButton } from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    private pathData: Vec2[];
    constructor(protected drawingService: DrawingService, protected annulerRefaireService: AnnulerRefaireService) {
        super(drawingService, annulerRefaireService);
        this.clearPath();
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.mouseDown = event.button === MouseButton.Left;
        if (!this.drawingService.mouseDown) return;
        this.clearPath();
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.pathData.push(this.mouseDownCoord);
    }

    onMouseUp(event: MouseEvent): void {
        if (this.drawingService.mouseDown) {
            this.drawLine(this.drawingService.baseCtx, this.pathData);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.annulerRefaireService.addUndoAction(
                new ActionPencil(this.drawingService, this.pathData, this.drawingService.primaryColor, this.drawingService.pencilWidth),
            );
        }
        this.drawingService.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.drawingService.mouseDown) return;
        const mousePosition = this.getPositionFromMouse(event);
        this.pathData.push(mousePosition);
        // On dessine sur le sliderCanvas de prévisualisation et on l'efface à chaque déplacement de la souris
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawLine(this.drawingService.previewCtx, this.pathData);
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        this.drawingSetup(ctx);
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    drawingSetup(ctx: CanvasRenderingContext2D): void {
        ctx.lineWidth = this.drawingService.pencilWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.drawingService.primaryColor;
        ctx.lineJoin = 'round';
        ctx.beginPath();
    }

    private clearPath(): void {
        this.pathData = [];
    }

    getCurrentToolString(): string {
        return 'pencil';
    }
}

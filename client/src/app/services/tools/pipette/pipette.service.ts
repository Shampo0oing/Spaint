import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class PipetteService extends Tool {
    constructor(protected drawingService: DrawingService, protected annulerRefaireService: AnnulerRefaireService) {
        super(drawingService, annulerRefaireService);
    }

    wrapper: HTMLElement;
    magnifierCtx: CanvasRenderingContext2D;

    onMouseMove(event: MouseEvent): void {
        if (this.checkBoundaries(event)) {
            this.wrapper.style.opacity = '1';
            this.wrapper.style.transform = 'scale(1)';
        } else {
            this.wrapper.style.opacity = '0';
            this.wrapper.style.transform = 'scale(0.7)';
        }
        this.magnifierCtx.putImageData(this.getZoomedInImage(this.getPositionFromMouse(event)), 0, 0);
    }

    checkBoundaries(event: MouseEvent): boolean {
        const mousePos = this.getPositionFromMouse(event);

        return mousePos.x > 0 && mousePos.x < this.drawingService.canvas.width && mousePos.y > 0 && mousePos.y < this.drawingService.canvas.height;
    }

    onClick(event: MouseEvent): void {
        this.drawingService.primaryColor = this.getCurrentPixelColor(this.getPositionFromMouse(event)).toRgba();
    }

    onClickRight(event: MouseEvent): void {
        this.drawingService.secondaryColor = this.getCurrentPixelColor(this.getPositionFromMouse(event)).toRgba();
    }

    getCurrentPixelColor(mousePosition: Vec2): Color {
        const pixelData = this.drawingService.baseCtx.getImageData(mousePosition.x, mousePosition.y, 1, 1).data;
        return new Color(pixelData[0], pixelData[1], pixelData[2], 1);
    }

    getZoomedInImage(mousePosition: Vec2): ImageData {
        const halfCanvasSize = 5;
        const canvasZoomedSize = 300;
        return this.drawingService.baseCtx.getImageData(
            mousePosition.x - halfCanvasSize,
            mousePosition.y - halfCanvasSize,
            canvasZoomedSize,
            canvasZoomedSize,
        );
    }

    getCurrentToolString(): string {
        return 'pipette';
    }
}

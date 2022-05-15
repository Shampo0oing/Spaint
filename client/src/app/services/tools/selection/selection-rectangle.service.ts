import { Injectable } from '@angular/core';
import { ActionPaste } from '@app/classes/Actions/action-paste';
import { ActionSelectionRectangle } from '@app/classes/Actions/action-selection-rectangle';
import { LINE_DASH_MAX, LINE_DASH_MIN, SELECTRECT_KEY } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/tools/magnetism/magnetism.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionRectangleService extends SelectionService {
    constructor(
        protected drawingService: DrawingService,
        protected annulerRefaireService: AnnulerRefaireService,
        protected clipboardService: ClipboardService,
        protected magnetismService: MagnetismService,
        private rectangleService: RectangleService,
    ) {
        super(drawingService, annulerRefaireService, clipboardService, magnetismService);
    }
    squarePos: Vec2;

    drawSelectedZone(): void {
        if (this.shift) {
            this.squarePos = this.rectangleService.getSquarePos(this.lastMousePos, this.mouseDownCoord);
            this.drawOutline(this.squarePos, { x: this.rectangleService.min, y: this.rectangleService.min });
        } else {
            this.drawOutline(this.mouseDownCoord, { x: this.lastMousePos.x - this.mouseDownCoord.x, y: this.lastMousePos.y - this.mouseDownCoord.y });
        }
    }

    drawOutline(position: Vec2, dimensions: Vec2): void {
        this.drawingService.previewCtx.beginPath();
        this.drawingService.previewCtx.lineWidth = 1;
        this.drawingService.previewCtx.strokeStyle = '#000000';
        this.drawingService.previewCtx.lineCap = 'square';
        this.drawingService.previewCtx.lineJoin = 'miter';
        this.drawingService.previewCtx.setLineDash([LINE_DASH_MIN, LINE_DASH_MAX]);
        this.drawingService.previewCtx.rect(position.x, position.y, dimensions.x, dimensions.y);
        this.drawingService.previewCtx.stroke();
        this.drawingService.previewCtx.setLineDash([]);
    }

    drawRectOrSquare(): void {
        if (this.shift) {
            // square
            this.imageDataInitialPosition = { x: this.squarePos.x, y: this.squarePos.y };
            this.imageDataInitialDimension = { x: this.rectangleService.min, y: this.rectangleService.min };
        } else {
            // rect
            this.imageDataInitialPosition = {
                x: Math.min(this.mouseDownCoord.x, this.lastMousePos.x),
                y: Math.min(this.mouseDownCoord.y, this.lastMousePos.y),
            };
            this.imageDataInitialDimension = {
                x: Math.abs(this.lastMousePos.x - this.mouseDownCoord.x),
                y: Math.abs(this.lastMousePos.y - this.mouseDownCoord.y),
            };
        }
    }

    selectImage(): void {
        this.drawRectOrSquare();
        this.imageDataPosition = { x: this.imageDataInitialPosition.x, y: this.imageDataInitialPosition.y };
        this.imageDataDimension = { x: this.imageDataInitialDimension.x, y: this.imageDataInitialDimension.y };
        this.imageDataPositionClicked = { x: this.imageDataInitialPosition.x, y: this.imageDataInitialPosition.y };
        this.imageDataSelection = this.drawingService.baseCtx.getImageData(
            this.imageDataInitialPosition.x,
            this.imageDataInitialPosition.y,
            this.imageDataDimension.x,
            this.imageDataDimension.y,
        );
        this.boxResizerDimension = { x: this.imageDataInitialDimension.x, y: this.imageDataInitialDimension.y };
        this.boxResizerPosition = {
            x: this.imageDataInitialPosition.x,
            y: this.imageDataInitialPosition.y,
        };
        this.drawingService.baseCtx.fillStyle = '#ffffff';
        this.drawingService.baseCtx.fillRect(
            this.imageDataInitialPosition.x,
            this.imageDataInitialPosition.y,
            this.imageDataDimension.x,
            this.imageDataDimension.y,
        );
        this.drawingService.previewCtx.putImageData(this.imageDataSelection, this.imageDataPosition.x, this.imageDataPosition.y);
        this.image.src = this.drawingService.previewCtx.canvas.toDataURL();
    }

    confirmation(paste?: boolean): void {
        paste = paste !== undefined ? paste : true;
        this.drawingService.drawImageDataOnBaseCtx(this.imageDataPosition, this.imageDataDimension, this.imageDataSelection);
        if (this.lastActionIsPaste()) {
            const action = this.annulerRefaireService.undoActions[this.annulerRefaireService.undoActions.length - 1] as ActionPaste;
            action.position = { x: this.imageDataPosition.x, y: this.imageDataPosition.y };
        } else if (
            paste ||
            (this.imageDataInitialPosition.x !== this.imageDataPosition.x && this.imageDataInitialPosition.y !== this.imageDataPosition.y)
        ) {
            this.annulerRefaireService.addUndoAction(
                new ActionSelectionRectangle(
                    this.drawingService,
                    this.imageDataInitialPosition,
                    this.imageDataPosition,
                    this.imageDataInitialDimension,
                    this.imageDataDimension,
                    this.flipX,
                    this.flipY,
                ),
            );
        }
        this.flipX = false;
        this.flipY = false;
    }

    selectAll(): void {
        this.shift = false;
        this.mouseDownCoord = { x: 0, y: 0 };
        this.lastMousePos = { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height };
        this.selectImage();
        this.imageDataDimensionClicked = { x: Math.abs(this.imageDataDimension.x), y: Math.abs(this.imageDataDimension.y) };
        this.drawingService.selected = true;
    }

    getCurrentToolString(): string {
        return 'selectionRectangle';
    }

    copy(): void {
        this.clipboardService.copy(this.imageDataSelection, this.imageDataDimension, SELECTRECT_KEY);
    }
}

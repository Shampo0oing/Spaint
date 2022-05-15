import { Injectable } from '@angular/core';
import { ActionPaste } from '@app/classes/Actions/action-paste';
import { ActionSelectionEllipse } from '@app/classes/Actions/action-selection-ellipse';
import {
    BLUE,
    DETECTION_LIMIT,
    GREEN,
    LINE_DASH_MAX,
    LINE_DASH_MIN,
    OPACITY,
    PIXEL_SIZE,
    RED,
    SELECTELLIPSE_KEY,
    WHITE,
} from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { MagnetismService } from '@app/services/tools/magnetism/magnetism.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionEllipseService extends SelectionService {
    constructor(
        protected drawingService: DrawingService,
        protected annulerRefaireService: AnnulerRefaireService,
        protected clipboardService: ClipboardService,
        protected magnetismService: MagnetismService,
        private ellipseService: EllipseService,
    ) {
        super(drawingService, annulerRefaireService, clipboardService, magnetismService);
    }
    circlePos: Vec2;

    drawSelectedZone(): void {
        if (this.shift) {
            this.circlePos = this.ellipseService.getCirclePos(this.lastMousePos, this.mouseDownCoord);
            this.drawOutline(this.circlePos, { x: this.ellipseService.min, y: this.ellipseService.min });
        } else {
            this.drawOutline(
                {
                    x: (this.lastMousePos.x - this.mouseDownCoord.x) / 2 + this.mouseDownCoord.x,
                    y: (this.lastMousePos.y - this.mouseDownCoord.y) / 2 + this.mouseDownCoord.y,
                },
                { x: Math.abs((this.lastMousePos.x - this.mouseDownCoord.x) / 2), y: Math.abs((this.lastMousePos.y - this.mouseDownCoord.y) / 2) },
            );
        }
    }

    drawOutline(position: Vec2, dimensions: Vec2): void {
        this.drawingService.previewCtx.beginPath();
        this.drawingService.previewCtx.lineWidth = 1;
        this.drawingService.previewCtx.strokeStyle = '#000000';
        this.drawingService.previewCtx.lineCap = 'square';
        this.drawingService.previewCtx.lineJoin = 'miter';
        this.drawingService.previewCtx.setLineDash([LINE_DASH_MIN, LINE_DASH_MAX]);
        this.drawingService.previewCtx.ellipse(position.x, position.y, dimensions.x, dimensions.y, 0, 0, 2 * Math.PI);
        this.drawingService.previewCtx.stroke();
        this.drawingService.previewCtx.setLineDash([]);
    }

    drawEllipseOrCircle(): void {
        if (this.shift) {
            // circle
            this.imageDataInitialPosition = { x: this.circlePos.x - this.ellipseService.min, y: this.circlePos.y - this.ellipseService.min };
            this.imageDataInitialDimension = { x: this.imageDataDimension.x, y: this.imageDataDimension.y };
        } else {
            // ellipse
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

    makeInvisible(imageData: ImageData, dimensions: Vec2): ImageData {
        for (let y = 0; y < dimensions.y; y++) {
            for (let x = 0; x < dimensions.x; x++) {
                const i = x * PIXEL_SIZE + y * PIXEL_SIZE * dimensions.x;
                if (
                    Math.pow(x - Math.floor(dimensions.x / 2), 2) / Math.pow(dimensions.x / 2, 2) +
                        Math.pow(y - Math.floor(dimensions.y / 2), 2) / Math.pow(dimensions.y / 2, 2) >
                    1
                ) {
                    imageData.data[i + RED] = 0;
                    imageData.data[i + GREEN] = 0;
                    imageData.data[i + BLUE] = 0;
                    imageData.data[i + OPACITY] = 0;
                } else {
                    if (
                        imageData.data[i + RED] < DETECTION_LIMIT &&
                        imageData.data[i + GREEN] < DETECTION_LIMIT &&
                        imageData.data[i + BLUE] < DETECTION_LIMIT &&
                        imageData.data[i + OPACITY] < DETECTION_LIMIT
                    ) {
                        imageData.data[i + RED] = WHITE;
                        imageData.data[i + GREEN] = WHITE;
                        imageData.data[i + BLUE] = WHITE;
                        imageData.data[i + OPACITY] = WHITE;
                    }
                }
            }
        }
        return imageData;
    }

    selectImage(): void {
        this.drawEllipseOrCircle();
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

        this.imageDataSelection = this.makeInvisible(this.imageDataSelection, this.imageDataDimension);

        // imageData.data[x*4+y*width+3] pour l'opacité

        this.drawingService.baseCtx.beginPath();
        this.drawingService.baseCtx.fillStyle = '#ffffff';
        this.drawingService.baseCtx.ellipse(
            this.imageDataInitialPosition.x + this.imageDataDimension.x / 2,
            this.imageDataInitialPosition.y + this.imageDataDimension.y / 2,
            this.imageDataDimension.x / 2 - 1,
            this.imageDataDimension.y / 2 - 1,
            0,
            0,
            2 * Math.PI,
        );

        this.drawingService.baseCtx.fill();

        this.drawingService.previewCtx.putImageData(this.imageDataSelection, this.imageDataPosition.x, this.imageDataPosition.y);
    }

    confirmation(paste?: boolean): void {
        paste = paste !== undefined ? paste : true;
        this.drawingService.drawImageDataOnBaseCtx(this.imageDataPosition, this.imageDataDimension, this.imageDataSelection);
        if (this.lastActionIsPaste()) {
            const action = this.annulerRefaireService.undoActions[this.annulerRefaireService.undoActions.length - 1] as ActionPaste;
            action.position = { x: this.imageDataPosition.x, y: this.imageDataPosition.y };
        } else if (
            paste ||
            this.imageDataInitialPosition.x !== this.imageDataPosition.x ||
            this.imageDataInitialPosition.y !== this.imageDataPosition.y
        ) {
            this.annulerRefaireService.addUndoAction(
                new ActionSelectionEllipse(
                    this.drawingService,
                    this,
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

    getCurrentToolString(): string {
        return 'selectionEllipse';
    }

    copy(): void {
        this.clipboardService.copy(this.imageDataSelection, this.imageDataDimension, SELECTELLIPSE_KEY);
    }
}

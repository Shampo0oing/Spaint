import { Injectable } from '@angular/core';
import { ActionDelete } from '@app/classes/Actions/action-delete';
import { ActionPaste } from '@app/classes/Actions/action-paste';
import { ActionSelectionLasso } from '@app/classes/Actions/action-selection-lasso';
import { ActionStub } from '@app/classes/Actions/action-stub';
import { DISTANCE_20PX, LINE_DASH_MAX, LINE_DASH_MIN, NUMBER_POINTS, SELECTLASSO_KEY, SelectPos } from '@app/classes/constantes';
import { checkIfIntersect, findMax, findMin } from '@app/classes/fonctions';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from '@app/services/tools/line/line.service';
import { MagnetismService } from '@app/services/tools/magnetism/magnetism.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';

// tslint:disable:no-empty
@Injectable({
    providedIn: 'root',
})
export class SelectionLassoService extends SelectionService {
    private pathData: Vec2[] = [];
    private pathDataInitial: Vec2[] = [];
    private pathDataPercent: Vec2[] = [];
    drawingLine: boolean = false;
    private intersect: boolean = false;

    constructor(
        protected drawingService: DrawingService,
        protected annulerRefaireService: AnnulerRefaireService,
        protected clipboardService: ClipboardService,
        protected magnetismService: MagnetismService,
        private lineService: LineService,
    ) {
        super(drawingService, annulerRefaireService, clipboardService, magnetismService);
    }
    drawSelectedZone(): void {}
    drawOutline(postion: Vec2, dimensions: Vec2): void {}
    paste(): void {
        if (this.clipboardService.isEmpty()) return;
        if (this.drawingService.selected) this.confirmation(false);
        this.imageDataSelection = this.clipboardService.imageData;
        this.imageDataDimension = this.boxResizerDimension = this.clipboardService.imageDimensions;
        this.pathData = this.pathDataInitial = this.clipboardService.pathData;
        this.pathDataPercent = this.clipboardService.pathDataPercent;
        this.imageDataPosition = this.boxResizerPosition = { x: 0, y: 0 };
        this.changePathData2();
        this.drawingService.selected = true;
        this.drawingService.previewCtx.putImageData(this.imageDataSelection, this.imageDataPosition.x, this.imageDataPosition.y);
        this.drawLineDash(this.drawingService.previewCtx);
        this.annulerRefaireService.addUndoAction(
            new ActionPaste(this.drawingService, this.imageDataSelection, this.imageDataPosition, this.imageDataDimension),
        );
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
                new ActionSelectionLasso(
                    this.drawingService,
                    this,
                    this.imageDataInitialPosition,
                    this.imageDataPosition,
                    this.imageDataInitialDimension,
                    this.imageDataDimension,
                    this.pathDataInitial,
                    this.flipX,
                    this.flipY,
                ),
            );
        }
        this.flipX = false;
        this.flipY = false;
        this.clearPath();
    }
    copy(): void {
        this.clipboardService.copy(this.imageDataSelection, this.imageDataDimension, SELECTLASSO_KEY, this.pathData, this.pathDataPercent);
    }
    drawLineDash(ctx: CanvasRenderingContext2D): void {
        if (this.pathData.length === 0) return;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#82807f';
        ctx.setLineDash([LINE_DASH_MIN, LINE_DASH_MAX]);
        ctx.beginPath();
        if (!this.drawingLine) this.changePathData2();
        ctx.moveTo(this.pathData[0].x, this.pathData[0].y);
        for (let i = 1; i < this.pathData.length; i++) ctx.lineTo(this.pathData[i].x, this.pathData[i].y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    drawingSetup(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.fillStyle = ctx.strokeStyle = this.intersect ? '#ff0000' : '#000000'; // 14a2be
        ctx.lineJoin = 'round';
    }
    drawLines(): void {
        if (!this.drawingLine) return;
        this.drawingSetup(this.drawingService.previewCtx);
        this.lineService.drawWithoutStroke(this.drawingService.previewCtx, this.pathData, [this.mouseDownCoord], this.shift);
        this.drawingService.previewCtx.stroke();
        this.drawingService.previewCtx.setLineDash([]);
    }
    changePathData(): void {
        for (const point of this.pathData) {
            point.x = point.x - this.imageDataInitialPosition.x;
            point.y = point.y - this.imageDataInitialPosition.y;
            this.pathDataInitial.push({ x: point.x, y: point.y });
        }
    }
    changePathData2(): void {
        for (let i = 0; i < this.pathData.length; i++) {
            this.pathData[i].x =
                this.boxResizerPosition.x +
                (this.flipX ? (1 - this.pathDataPercent[i].x) * this.boxResizerDimension.x : +this.pathDataPercent[i].x * this.boxResizerDimension.x);
            this.pathData[i].y =
                this.boxResizerPosition.y +
                (this.flipY ? (1 - this.pathDataPercent[i].y) * this.boxResizerDimension.y : +this.pathDataPercent[i].y * this.boxResizerDimension.y);
        }
    }
    selectImage(): void {
        this.imageDataInitialPosition = { x: findMin(this.pathData).x, y: findMin(this.pathData).y };
        this.imageDataInitialDimension = {
            x: findMax(this.pathData).x - findMin(this.pathData).x,
            y: findMax(this.pathData).y - findMin(this.pathData).y,
        };
        this.imageDataPosition = { x: findMin(this.pathData).x, y: findMin(this.pathData).y };
        this.imageDataDimension = { x: findMax(this.pathData).x - findMin(this.pathData).x, y: findMax(this.pathData).y - findMin(this.pathData).y };
        this.imageDataPositionClicked = { x: findMin(this.pathData).x, y: findMin(this.pathData).y };
        this.imageDataDimensionClicked = {
            x: findMax(this.pathData).x - findMin(this.pathData).x,
            y: findMax(this.pathData).y - findMin(this.pathData).y,
        };
        this.imageDataSelection = this.drawingService.baseCtx.getImageData(
            this.imageDataInitialPosition.x,
            this.imageDataInitialPosition.y,
            this.imageDataDimension.x,
            this.imageDataDimension.y,
        );
        this.boxResizerDimension = { x: findMax(this.pathData).x - findMin(this.pathData).x, y: findMax(this.pathData).y - findMin(this.pathData).y };
        this.boxResizerPosition = {
            x: findMin(this.pathData).x,
            y: findMin(this.pathData).y,
        };
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.changePathData();
        this.imageDataSelection = this.drawingService.makeInvisible(
            this.imageDataSelection,
            this.imageDataInitialPosition,
            this.imageDataDimension,
            this.pathData,
        );
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.previewCtx.putImageData(this.imageDataSelection, this.imageDataPosition.x, this.imageDataPosition.y);
        this.image.src = this.drawingService.previewCtx.canvas.toDataURL();
        this.selectedImage();
    }
    selectedImage(): void {
        this.mouseDownCoord = this.pathData[0];
        this.pathData.push(this.pathData[0]);
        this.drawingService.previewCtx.setLineDash([LINE_DASH_MIN, LINE_DASH_MAX]);
        this.drawingLine = false;
        this.shift = false;
        this.drawingService.selected = true;
        this.drawingService.mouseDown = false;
        this.percentagePathData();
        this.drawLineDash(this.drawingService.previewCtx);
    }
    percentagePathData(): void {
        for (const point of this.pathData)
            this.pathDataPercent.push({
                x: point.x / this.imageDataInitialDimension.x,
                y: point.y / this.imageDataInitialDimension.y,
            });
    }
    onClick(event: MouseEvent): void {
        if (this.drawingService.selected) return;
        this.mouseDownCoord = this.getPositionFromMouse(event);
        if (this.pathData.length === 0 && this.status === SelectPos.NONE) {
            this.pathData.push(this.mouseDownCoord);
            this.drawingLine = true;
            this.drawingService.mouseDown = true;
        } else {
            if (
                this.lineService.calculateDistance(this.pathData, this.mouseDownCoord) < DISTANCE_20PX &&
                this.pathData.length >= NUMBER_POINTS &&
                !this.intersect &&
                this.drawingLine
            ) {
                this.selectImage();
                this.annulerRefaireService.addUndoAction(new ActionStub(this.drawingService));
            } else {
                this.drawLines();
                if (!this.intersect && this.drawingLine) this.pathData.push(this.mouseDownCoord);
            }
        }
    }
    onMouseMove(event: MouseEvent): void {
        this.lastMousePos = this.getPositionFromMouse(event);
        this.lastMousePos.x = Math.round(this.lastMousePos.x);
        this.lastMousePos.y = Math.round(this.lastMousePos.y);
        if (!this.drawingService.mouseDown) return;
        if (this.drawingLine) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.drawLines();
            this.intersect = checkIfIntersect(this.pathData, this.mouseDownCoord);
        } else if (this.insideSelected) {
            this.imageDataPosition = {
                x: this.imageDataPositionClicked.x + (this.lastMousePos.x - this.mouseDownCoord.x),
                y: this.imageDataPositionClicked.y + (this.lastMousePos.y - this.mouseDownCoord.y),
            };
            this.boxResizerPosition = {
                x: this.imageDataPositionClicked.x + (this.lastMousePos.x - this.mouseDownCoord.x),
                y: this.imageDataPositionClicked.y + (this.lastMousePos.y - this.mouseDownCoord.y),
            };
            if (this.drawingService.useMagnetism) {
                this.imageDataPosition = this.magnetismService.affectWithMagnestism(this.imageDataPosition, this.imageDataDimension);
                this.boxResizerPosition = this.magnetismService.affectWithMagnestism(this.boxResizerPosition, this.boxResizerDimension);
            }
            this.verificationOutside();
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawingService.previewCtx.putImageData(this.imageDataSelection, this.imageDataPosition.x, this.imageDataPosition.y);
        } else if (this.status !== SelectPos.NONE) this.resizeDrawing();
    }
    onMouseUp(): void {
        if (!this.drawingService.mouseDown || this.drawingLine) return;
        if (this.mouseDownCoord.x !== this.lastMousePos.x && this.mouseDownCoord.y !== this.lastMousePos.y && this.status === SelectPos.NONE) {
            if (this.drawingService.selected) {
                this.insideSelected = false;
                this.image.src = this.drawingService.previewCtx.canvas.toDataURL();
                this.imageDataSelection = this.drawingService.previewCtx.getImageData(
                    this.imageDataPosition.x,
                    this.imageDataPosition.y,
                    this.imageDataDimension.x,
                    this.imageDataDimension.y,
                );
                this.imageDataDimensionClicked = { x: Math.abs(this.imageDataDimension.x), y: Math.abs(this.imageDataDimension.y) };
                this.imageDataPositionClicked = { x: this.imageDataPosition.x, y: this.imageDataPosition.y };
                this.boxResizerDimension = { x: Math.abs(this.imageDataDimension.x), y: Math.abs(this.imageDataDimension.y) };
                this.boxResizerPosition = {
                    x: this.imageDataPosition.x,
                    y: this.imageDataPosition.y,
                };
                this.drawingService.previewCtx.putImageData(this.imageDataSelection, this.imageDataPosition.x, this.imageDataPosition.y);
                this.drawLineDash(this.drawingService.previewCtx);
            }
        } else if (this.status !== SelectPos.NONE) {
            this.image.src = this.drawingService.previewCtx.canvas.toDataURL();
            this.imageDataSelection = this.drawingService.previewCtx.getImageData(
                this.imageDataPosition.x,
                this.imageDataPosition.y,
                this.imageDataDimension.x,
                this.imageDataDimension.y,
            );
            if (this.imageDataDimension.x < 0) this.flipX = !this.flipX;
            if (this.imageDataDimension.y < 0) this.flipY = !this.flipY;
            this.imageDataDimensionClicked = { x: Math.abs(this.imageDataDimension.x), y: Math.abs(this.imageDataDimension.y) };
            this.imageDataPositionClicked = {
                x: Math.min(this.imageDataPosition.x + this.imageDataDimension.x, this.imageDataPosition.x),
                y: Math.min(this.imageDataPosition.y + this.imageDataDimension.y, this.imageDataPosition.y),
            };
            this.drawLineDash(this.drawingService.previewCtx);
            this.imageDataPosition = { x: this.boxResizerPosition.x, y: this.boxResizerPosition.y };
            this.imageDataDimension = { x: this.boxResizerDimension.x, y: this.boxResizerDimension.y };
        }
        this.status = SelectPos.NONE;
        this.drawingService.mouseDown = false;
    }
    escapeDown(): void {
        if (!this.drawingService.selected) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.clearPath();
            this.drawingLine = false;
            this.drawingService.mouseDown = false;
        } else if (this.status === SelectPos.NONE) {
            if (
                this.imageDataPosition.x === this.imageDataInitialPosition.x &&
                this.imageDataPosition.y === this.imageDataInitialPosition.y &&
                this.imageDataDimension.x === this.imageDataInitialDimension.x &&
                this.imageDataDimension.y === this.imageDataInitialDimension.y
            ) {
                this.annulerRefaireService.removeActionsStubs();
                this.drawingService.drawImageDataOnBaseCtx(this.imageDataPosition, this.imageDataDimension, this.imageDataSelection);
                this.clearPath();
            } else this.confirmation();
        }
    }
    shiftDown(): void {
        this.shift = true;
        if (this.drawingLine && this.mouseDownCoord !== this.pathData[this.pathData.length - 1]) this.drawLines();
        else if (this.drawingService.selected && this.status !== SelectPos.NONE) this.resizeDrawing();
    }
    shiftUp(): void {
        this.shift = false;
        if (this.drawingLine && !this.shift) this.drawLines();
        else if (this.drawingService.selected && this.status !== SelectPos.NONE) this.resizeDrawing();
    }
    backspaceDown(): void {
        if (this.pathData.length <= 1) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.pathData.pop();
        this.drawingService.previewCtx.beginPath();
        this.drawLines();
    }
    clearPath(): void {
        this.pathData = [];
        this.pathDataInitial = [];
        this.pathDataPercent = [];
    }
    onKeyDown(event: KeyboardEvent): void {
        event.preventDefault();
        if (event.key === 'Shift' || this.status !== SelectPos.NONE || !this.drawingService.selected) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.previewCtx.putImageData(this.imageDataSelection, this.imageDataPosition.x, this.imageDataPosition.y);
        this.drawLineDash(this.drawingService.previewCtx);
        this.moveWithArrows(event);
        this.manageClipBoard(event);
    }
    getCurrentToolString(): string {
        return 'selectionLasso';
    }
    delete(): void {
        this.drawingService.selected = false;
        this.drawingLine = false;
        this.clearPath();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.annulerRefaireService.addUndoAction(
            new ActionDelete(this.drawingService, this.imageDataInitialPosition, this.imageDataDimension, this.imageDataSelection),
        );
    }
}

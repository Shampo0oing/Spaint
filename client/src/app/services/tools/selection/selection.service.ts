import { Injectable } from '@angular/core';
import { ActionDelete } from '@app/classes/Actions/action-delete';
import { ActionPaste } from '@app/classes/Actions/action-paste';
import { ActionStub } from '@app/classes/Actions/action-stub';
import { DELAY_100, DELAY_500, MouseButton, SelectPos, TRANSITION_PIXEL } from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/tools/magnetism/magnetism.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard.service';

@Injectable({
    providedIn: 'root',
})
export abstract class SelectionService extends Tool {
    constructor(
        protected drawingService: DrawingService,
        protected annulerRefaireService: AnnulerRefaireService,
        protected clipboardService: ClipboardService,
        protected magnetismService: MagnetismService,
    ) {
        super(drawingService, annulerRefaireService);
    }
    imageDataSelection: ImageData;
    imageDataInitialDimension: Vec2 = { x: 0, y: 0 };
    imageDataDimension: Vec2 = { x: 0, y: 0 };
    imageDataDimensionClicked: Vec2 = { x: 0, y: 0 };
    imageDataInitialPosition: Vec2 = { x: 0, y: 0 };
    imageDataPosition: Vec2 = { x: 0, y: 0 };
    imageDataPositionClicked: Vec2 = { x: 0, y: 0 };
    boxResizerDimension: Vec2 = { x: 0, y: 0 };
    boxResizerPosition: Vec2 = { x: 0, y: 0 };
    lastMousePos: Vec2 = { x: 0, y: 0 };
    insideSelected: boolean = false;
    arrowUp: boolean = false;
    arrowRight: boolean = false;
    arrowLeft: boolean = false;
    arrowDown: boolean = false;
    fired: boolean = false;
    status: number = SelectPos.NONE;
    flipX: boolean = false;
    flipY: boolean = false;
    image: HTMLImageElement = new Image();

    abstract drawSelectedZone(): void;
    abstract drawOutline(postion: Vec2, dimensions: Vec2): void;
    abstract selectImage(): void;
    abstract confirmation(paste?: boolean): void;
    abstract copy(): void;
    // tslint:disable-next-line:no-empty
    drawLineDash(ctx: CanvasRenderingContext2D): void {}
    // tslint:disable-next-line:no-empty
    changePathData2(): void {}
    isInside(): boolean {
        return (
            this.mouseDownCoord.x < this.imageDataPosition.x + this.imageDataDimension.x &&
            this.mouseDownCoord.x > this.imageDataPosition.x &&
            this.mouseDownCoord.y < this.imageDataPosition.y + this.imageDataDimension.y &&
            this.mouseDownCoord.y > this.imageDataPosition.y
        );
    }
    updatePreviewCanvas(): void {
        if (!this.drawingService.mouseDown) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawSelectedZone();
    }
    clickedElseWhere(): void {
        if (!this.drawingService.selected) return;
        this.confirmation();
        this.arrowDown = this.arrowRight = this.arrowUp = this.arrowLeft = this.fired = false;
    }

    verificationOutside(): void {
        if (this.imageDataPosition.y > this.drawingService.canvas.height) this.imageDataPosition.y = this.drawingService.canvas.height;
        if (this.imageDataPosition.x > this.drawingService.canvas.width) this.imageDataPosition.x = this.drawingService.canvas.width;
        if (this.imageDataPosition.x + this.imageDataDimension.x < 0) this.imageDataPosition.x = -this.imageDataDimension.x;
        if (this.imageDataPosition.y + this.imageDataDimension.y < 0) this.imageDataPosition.y = -this.imageDataDimension.y;
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.mouseDown = event.button === MouseButton.Left;
        if (!this.drawingService.mouseDown) return;
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.mouseDownCoord.x = Math.round(this.mouseDownCoord.x);
        this.mouseDownCoord.y = Math.round(this.mouseDownCoord.y);
        if (this.drawingService.selected) {
            this.imageDataPositionClicked = { x: this.imageDataPosition.x, y: this.imageDataPosition.y };
            if (this.isInside()) {
                this.insideSelected = true;
            } else if (this.status === SelectPos.NONE) {
                this.insideSelected = false;
                if (
                    this.imageDataPosition.x === this.imageDataInitialPosition.x &&
                    this.imageDataPosition.y === this.imageDataInitialPosition.y &&
                    this.imageDataDimension.x === this.imageDataInitialDimension.x &&
                    this.imageDataDimension.y === this.imageDataInitialDimension.y
                ) {
                    this.annulerRefaireService.removeActionsStubs();
                    this.drawingService.drawImageDataOnBaseCtx(this.imageDataPosition, this.imageDataDimension, this.imageDataSelection);
                } else {
                    this.confirmation();
                }
            }
        }
    }
    verificationLastMousePos(): void {
        if (this.lastMousePos.x > this.drawingService.canvas.width) this.lastMousePos.x = this.drawingService.canvas.width;
        if (this.lastMousePos.y > this.drawingService.canvas.height) this.lastMousePos.y = this.drawingService.canvas.height;
        if (this.lastMousePos.x < 0) this.lastMousePos.x = 0;
        if (this.lastMousePos.y < 0) this.lastMousePos.y = 0;
    }

    onMouseMove(event: MouseEvent): void {
        this.lastMousePos = this.getPositionFromMouse(event);
        this.lastMousePos.x = Math.round(this.lastMousePos.x);
        this.lastMousePos.y = Math.round(this.lastMousePos.y);
        if (!this.drawingService.mouseDown) return;
        this.dragAndDrop();
        if (this.status !== SelectPos.NONE) this.resizeDrawing();
    }
    setStatus(status: number): void {
        this.status = status;
    }
    resizeDrawing(): void {
        const useMagnetismTemp = this.drawingService.useMagnetism as boolean;
        this.drawingService.useMagnetism = false;
        const translatePos = this.drawingService.changePositionAndDimensions(
            this.imageDataPosition,
            this.imageDataDimension,
            this.lastMousePos,
            this.status,
        );
        this.boxResizerDimension = { x: Math.abs(this.imageDataDimension.x), y: Math.abs(this.imageDataDimension.y) };
        this.boxResizerPosition.x = Math.min(this.imageDataPosition.x + this.imageDataDimension.x, this.imageDataPosition.x);
        this.boxResizerPosition.y = Math.min(this.imageDataPosition.y + this.imageDataDimension.y, this.imageDataPosition.y);
        if (this.shift && this.imageDataDimension.x !== 0 && this.imageDataDimension.y !== 0) {
            const min: number = Math.min(Math.abs(this.imageDataDimension.x), Math.abs(this.imageDataDimension.y));
            const sign: Vec2 = {
                x: this.imageDataDimension.x / Math.abs(this.imageDataDimension.x),
                y: this.imageDataDimension.y / Math.abs(this.imageDataDimension.y),
            };
            if (this.status === SelectPos.BOTTOMRIGHT) {
                this.boxResizerPosition.x = Math.min(this.imageDataPositionClicked.x + sign.x * min, this.imageDataPositionClicked.x);
                this.boxResizerPosition.y = Math.min(this.imageDataPositionClicked.y + sign.y * min, this.imageDataPositionClicked.y);
                this.boxResizerDimension = { x: min, y: min };
                this.imageDataDimension = { x: sign.x * min, y: sign.y * min };
            }
        } else if (!this.shift && this.imageDataDimension.x !== 0 && this.imageDataDimension.y !== 0) {
            this.boxResizerDimension = { x: Math.abs(this.imageDataDimension.x), y: Math.abs(this.imageDataDimension.y) };
        }
        this.drawingService.useMagnetism = useMagnetismTemp;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.previewCtx.save();
        this.drawingService.previewCtx.translate(translatePos.x, translatePos.y);
        const scale: Vec2 = {
            x: this.imageDataDimension.x / this.imageDataDimensionClicked.x,
            y: this.imageDataDimension.y / this.imageDataDimensionClicked.y,
        };
        this.drawingService.previewCtx.transform(scale.x, 0, 0, scale.y, 0, 0);
        this.drawingService.previewCtx.translate(-translatePos.x, -translatePos.y);
        this.drawingService.previewCtx.drawImage(this.image, 0, 0);
        this.drawingService.previewCtx.restore();
    }
    dragAndDrop(): void {
        if (!this.drawingService.selected) {
            this.verificationLastMousePos();
            this.updatePreviewCanvas();
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
        }
    }
    onMouseUp(): void {
        if (!this.drawingService.mouseDown) return;
        if (this.mouseDownCoord.x !== this.lastMousePos.x && this.mouseDownCoord.y !== this.lastMousePos.y) {
            if (this.status === SelectPos.NONE) {
                if (!this.drawingService.selected) {
                    this.drawingService.clearCanvas(this.drawingService.previewCtx);
                    this.selectImage();
                    this.drawingService.selected = true;
                    this.annulerRefaireService.addUndoAction(new ActionStub(this.drawingService));
                    this.image.src = this.drawingService.previewCtx.canvas.toDataURL();
                } else {
                    this.image.src = this.drawingService.previewCtx.canvas.toDataURL();
                    this.imageDataSelection = this.drawingService.previewCtx.getImageData(
                        this.imageDataPosition.x,
                        this.imageDataPosition.y,
                        this.imageDataDimension.x,
                        this.imageDataDimension.y,
                    );
                    this.insideSelected = false;
                }
                this.imageDataDimensionClicked = { x: Math.abs(this.imageDataDimension.x), y: Math.abs(this.imageDataDimension.y) };
                this.imageDataPositionClicked = { x: this.imageDataPosition.x, y: this.imageDataPosition.y };
                this.boxResizerDimension = { x: Math.abs(this.imageDataDimension.x), y: Math.abs(this.imageDataDimension.y) };
                this.boxResizerPosition = {
                    x: this.imageDataPosition.x,
                    y: this.imageDataPosition.y,
                };
            } else {
                this.image.src = this.drawingService.previewCtx.canvas.toDataURL();
                this.imageDataSelection = this.drawingService.previewCtx.getImageData(
                    this.imageDataPosition.x,
                    this.imageDataPosition.y,
                    this.imageDataDimension.x,
                    this.imageDataDimension.y,
                );
                this.boxResizerDimension = { x: Math.abs(this.imageDataDimension.x), y: Math.abs(this.imageDataDimension.y) };
                this.imageDataPosition = { x: this.boxResizerPosition.x, y: this.boxResizerPosition.y };
                if (this.imageDataDimension.x < 0) this.flipX = !this.flipX;
                if (this.imageDataDimension.y < 0) this.flipY = !this.flipY;
                this.imageDataDimension = { x: this.boxResizerDimension.x, y: this.boxResizerDimension.y };
                this.imageDataDimensionClicked = { x: Math.abs(this.imageDataDimension.x), y: Math.abs(this.imageDataDimension.y) };
                this.imageDataPositionClicked = {
                    x: Math.min(this.imageDataPositionClicked.x + this.imageDataDimension.x, this.imageDataPositionClicked.x),
                    y: Math.min(this.imageDataPosition.y + this.imageDataDimension.y, this.imageDataPositionClicked.y),
                };
            }
        }
        this.status = SelectPos.NONE;
        this.drawingService.mouseDown = false;
    }
    shiftUp(): void {
        this.shift = false;
        if (!this.drawingService.selected) this.updatePreviewCanvas();
        else if (this.drawingService.selected && this.drawingService.mouseDown) this.resizeDrawing();
    }
    shiftDown(): void {
        this.shift = true;
        if (!this.drawingService.selected) this.updatePreviewCanvas();
        else if (this.drawingService.selected && this.drawingService.mouseDown) this.resizeDrawing();
    }
    deplacement(): void {
        if (this.drawingService.useMagnetism)
            this.imageDataPosition = this.magnetismService.affectWithMagnestism(this.imageDataPosition, this.imageDataDimension);
        if (this.arrowUp && !this.arrowDown)
            this.imageDataPosition.y -= this.drawingService.useMagnetism ? this.drawingService.squareSize : TRANSITION_PIXEL;
        if (this.arrowRight && !this.arrowLeft)
            this.imageDataPosition.x += this.drawingService.useMagnetism ? this.drawingService.squareSize : TRANSITION_PIXEL;
        if (this.arrowLeft && !this.arrowRight)
            this.imageDataPosition.x -= this.drawingService.useMagnetism ? this.drawingService.squareSize : TRANSITION_PIXEL;
        if (this.arrowDown && !this.arrowUp)
            this.imageDataPosition.y += this.drawingService.useMagnetism ? this.drawingService.squareSize : TRANSITION_PIXEL;
        this.boxResizerPosition = { x: this.imageDataPosition.x, y: this.imageDataPosition.y };
        this.verificationOutside();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.previewCtx.putImageData(this.imageDataSelection, this.imageDataPosition.x, this.imageDataPosition.y);
        this.image.src = this.drawingService.previewCtx.canvas.toDataURL();
        this.drawLineDash(this.drawingService.previewCtx);
    }
    gestionDeplacement(): void {
        this.deplacement();
        window.setTimeout(() => {
            if (this.arrowUp || this.arrowRight || this.arrowLeft || this.arrowDown) this.gestionDeplacement();
        }, DELAY_100);
    }
    onKeyUp(event: KeyboardEvent): void {
        this.arrowUp = event.key === 'ArrowUp' ? false : this.arrowUp;
        this.arrowRight = event.key === 'ArrowRight' ? false : this.arrowRight;
        this.arrowLeft = event.key === 'ArrowLeft' ? false : this.arrowLeft;
        this.arrowDown = event.key === 'ArrowDown' ? false : this.arrowDown;
        if (!this.arrowUp && !this.arrowRight && !this.arrowLeft && !this.arrowDown) this.fired = false;
    }
    delete(): void {
        this.drawingService.selected = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.annulerRefaireService.addUndoAction(
            new ActionDelete(this.drawingService, this.imageDataInitialPosition, this.imageDataDimension, this.imageDataSelection),
        );
    }
    cut(): void {
        this.copy();
        this.delete();
    }
    paste(): void {
        if (this.clipboardService.isEmpty()) return;
        if (this.drawingService.selected) this.confirmation(false);
        this.imageDataSelection = this.clipboardService.imageData;
        this.imageDataDimension = this.boxResizerDimension = this.clipboardService.imageDimensions;
        this.imageDataPosition = this.boxResizerPosition = { x: 0, y: 0 };
        this.drawingService.selected = true;
        this.drawingService.previewCtx.putImageData(this.imageDataSelection, this.imageDataPosition.x, this.imageDataPosition.y);
        this.annulerRefaireService.addUndoAction(
            new ActionPaste(this.drawingService, this.imageDataSelection, this.imageDataPosition, this.imageDataDimension),
        );
    }

    manageClipBoard(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'c') this.copy();
        if (event.ctrlKey && event.key === 'x') this.cut();
        if (event.key === 'Delete') this.delete();
    }

    moveWithArrows(event: KeyboardEvent): void {
        event.preventDefault();
        this.arrowUp = event.key === 'ArrowUp' ? true : this.arrowUp;
        this.arrowRight = event.key === 'ArrowRight' ? true : this.arrowRight;
        this.arrowLeft = event.key === 'ArrowLeft' ? true : this.arrowLeft;
        this.arrowDown = event.key === 'ArrowDown' ? true : this.arrowDown;
        if (this.arrowUp || this.arrowRight || this.arrowLeft || this.arrowDown) {
            if (!this.fired) {
                this.fired = true;
                window.setTimeout(() => {
                    if (this.arrowUp || this.arrowRight || this.arrowLeft || this.arrowDown) this.gestionDeplacement();
                }, DELAY_500);
                this.deplacement();
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (!this.drawingService.selected || event.key === 'Shift' || this.status !== SelectPos.NONE) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.previewCtx.putImageData(this.imageDataSelection, this.imageDataPosition.x, this.imageDataPosition.y);
        this.drawLineDash(this.drawingService.previewCtx);
        this.moveWithArrows(event);
        this.manageClipBoard(event);
    }

    escapeDown(): void {
        if (this.drawingService.selected && this.status === SelectPos.NONE) this.confirmation();
    }

    lastActionIsPaste(): boolean {
        return this.annulerRefaireService.undoActions[this.annulerRefaireService.undoActions.length - 1] instanceof ActionPaste;
    }
}

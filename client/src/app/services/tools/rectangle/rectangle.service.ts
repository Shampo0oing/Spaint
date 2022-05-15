import { Injectable } from '@angular/core';
import { ActionRectangle } from '@app/classes/Actions/action-rectangle';
import { MouseButton } from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    lastMousePos: Vec2;
    min: number;
    constructor(protected drawingService: DrawingService, protected annulerRefaireService: AnnulerRefaireService) {
        super(drawingService, annulerRefaireService);
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.mouseDown = event.button === MouseButton.Left;
        if (!this.drawingService.mouseDown) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.mouseDownCoord = this.getPositionFromMouse(event);
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.drawingService.mouseDown) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (!this.shift) {
            const mousePos = this.getPositionFromMouse(event);
            this.drawRectangle(this.drawingService.baseCtx, mousePos);
            this.annulerRefaireService.addUndoAction(
                new ActionRectangle(
                    this.drawingService,
                    this.mouseDownCoord,
                    this.drawingService.primaryColor,
                    this.drawingService.secondaryColor,
                    mousePos.x - this.mouseDownCoord.x,
                    mousePos.y - this.mouseDownCoord.y,
                    this.drawingService.rectangleWidth,
                    this.drawingService.traceTypeRectangle,
                    this,
                ),
            );
        } else {
            this.drawSquare(this.drawingService.baseCtx, this.getPositionFromMouse(event));
            this.annulerRefaireService.addUndoAction(
                new ActionRectangle(
                    this.drawingService,
                    this.getSquarePos(this.lastMousePos, this.mouseDownCoord),
                    this.drawingService.primaryColor,
                    this.drawingService.secondaryColor,
                    this.min,
                    this.min,
                    this.drawingService.rectangleWidth,
                    this.drawingService.traceTypeRectangle,
                    this,
                ),
            );
        }
        this.drawingService.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.lastMousePos = this.getPositionFromMouse(event);
        if (!this.drawingService.mouseDown) return;
        if (this.shift) {
            this.drawSquare(this.drawingService.previewCtx, this.lastMousePos);
        } else {
            this.drawRectangle(this.drawingService.previewCtx, this.lastMousePos);
        }
    }

    shiftDown(): void {
        this.shift = true;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.drawingService.mouseDown) this.drawSquare(this.drawingService.previewCtx, this.lastMousePos);
    }

    shiftUp(): void {
        this.shift = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.drawingService.mouseDown) this.drawRectangle(this.drawingService.previewCtx, this.lastMousePos);
    }

    drawRectangle(ctx: CanvasRenderingContext2D, mousePos: Vec2): void {
        this.drawingSetup(ctx);
        ctx.rect(this.mouseDownCoord.x, this.mouseDownCoord.y, mousePos.x - this.mouseDownCoord.x, mousePos.y - this.mouseDownCoord.y);
        this.traceType(ctx, this.drawingService.traceTypeRectangle);
    }

    drawSquare(ctx: CanvasRenderingContext2D, mousePos: Vec2): void {
        this.drawingSetup(ctx);
        this.placeSquare(ctx, mousePos);
        this.traceType(ctx, this.drawingService.traceTypeRectangle);
    }

    getSquarePos(mousePos: Vec2, mouseDownCoord: Vec2): Vec2 {
        const width: number = mousePos.x - mouseDownCoord.x;
        const height: number = mousePos.y - mouseDownCoord.y;
        this.min = Math.min(Math.abs(width), Math.abs(height));
        let squarePoint: Vec2;
        if (width < 0 && height > 0) {
            squarePoint = { x: mouseDownCoord.x - this.min, y: mouseDownCoord.y };
        } else if (height < 0 && width > 0) {
            squarePoint = { x: mouseDownCoord.x, y: mouseDownCoord.y - this.min };
        } else if (height < 0 && width < 0) {
            squarePoint = { x: mouseDownCoord.x - this.min, y: mouseDownCoord.y - this.min };
        } else {
            squarePoint = { x: mouseDownCoord.x, y: mouseDownCoord.y };
        }
        return squarePoint;
    }

    placeSquare(ctx: CanvasRenderingContext2D, mousePos: Vec2): void {
        const squarePoint = this.getSquarePos(mousePos, this.mouseDownCoord);
        ctx.rect(squarePoint.x, squarePoint.y, this.min, this.min);
    }

    drawingSetup(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.lineWidth = this.drawingService.rectangleWidth;
        ctx.strokeStyle = this.drawingService.secondaryColor;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
    }

    getCurrentToolString(): string {
        return 'rectangle';
    }
}

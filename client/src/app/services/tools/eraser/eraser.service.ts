import { Injectable } from '@angular/core';
import { ActionEraser } from '@app/classes/Actions/action-eraser';
import { MouseButton } from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    private lastMousePos: Vec2;
    private mousePos2: Vec2;
    private pathData: Vec2[] = [];
    constructor(protected drawingService: DrawingService, protected annulerRefaireService: AnnulerRefaireService) {
        super(drawingService, annulerRefaireService);
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.mouseDown = event.button === MouseButton.Left;
        if (!this.drawingService.mouseDown) return;
        this.mousePos2 = this.getPositionFromMouse(event);
        this.drawingService.baseCtx.fillStyle = '#ffffff';
        this.drawingService.baseCtx.fillRect(
            this.mousePos2.x - this.drawingService.eraserWidth / 2,
            this.mousePos2.y - this.drawingService.eraserWidth / 2,
            this.drawingService.eraserWidth,
            this.drawingService.eraserWidth,
        );
        this.pathData.push({
            x: this.mousePos2.x - this.drawingService.eraserWidth / 2,
            y: this.mousePos2.y - this.drawingService.eraserWidth / 2,
        });
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.drawingService.mouseDown) return;
        this.annulerRefaireService.addUndoAction(new ActionEraser(this.drawingService, this.pathData, this.drawingService.eraserWidth, this));
        this.drawingService.mouseDown = false;
        this.pathData = [];
    }

    distance(pos1: Vec2, pos2: Vec2): number {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    }

    cursorEraser(pos: Vec2): void {
        this.drawingService.previewCtx.lineWidth = 1;
        this.drawingService.previewCtx.fillStyle = '#FFFFFF';
        this.drawingService.previewCtx.fillRect(pos.x, pos.y, this.drawingService.eraserWidth, this.drawingService.eraserWidth);
        this.drawingService.previewCtx.fillStyle = this.drawingService.primaryColor;
        this.drawingService.previewCtx.strokeStyle = '#000000';
        this.drawingService.previewCtx.strokeRect(pos.x, pos.y, this.drawingService.eraserWidth, this.drawingService.eraserWidth);
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.lastMousePos = this.getPositionFromMouse(event);
        const posX = this.lastMousePos.x - this.drawingService.eraserWidth / 2;
        const posY = this.lastMousePos.y - this.drawingService.eraserWidth / 2;
        this.cursorEraser({ x: posX, y: posY });
        if (!this.drawingService.mouseDown) return;
        this.drawingService.baseCtx.fillStyle = '#ffffff';
        this.drawingService.baseCtx.fillRect(posX, posY, this.drawingService.eraserWidth, this.drawingService.eraserWidth);
        this.pathData.push({
            x: posX,
            y: posY,
        } as Vec2);
        if (this.distance(this.mousePos2, this.lastMousePos) > 2) {
            this.completeLine(this.mousePos2, this.lastMousePos);
        }
        this.mousePos2 = this.lastMousePos;
    }

    drawCompleteLineX(pos1: Vec2, pos2: Vec2, variation: number, width: number): void {
        let x: number;
        let y: number;
        for (x = pos1.x, y = pos1.y; x < pos2.x; x++, y += variation)
            this.drawingService.baseCtx.fillRect(x - width / 2, y - width / 2, width, width);
    }

    drawCompleteLineY(pos1: Vec2, pos2: Vec2, variation: number, width: number): void {
        let x: number;
        let y: number;
        for (x = pos1.x, y = pos1.y; y < pos2.y; y++, x += variation)
            this.drawingService.baseCtx.fillRect(x - width / 2, y - width / 2, width, width);
    }

    completeLine(pos1: Vec2, pos2: Vec2): void {
        const varriationY: number = (pos2.y - pos1.y) / (pos2.x - pos1.x);
        const varriationX: number = (pos2.x - pos1.x) / (pos2.y - pos1.y);
        if (Math.abs(varriationY) <= Math.abs(varriationX)) {
            pos1.x < pos2.x
                ? this.drawCompleteLineX(pos1, pos2, varriationY, this.drawingService.eraserWidth)
                : this.drawCompleteLineX(pos2, pos1, varriationY, this.drawingService.eraserWidth);
        } else {
            pos1.y < pos2.y
                ? this.drawCompleteLineY(pos1, pos2, varriationX, this.drawingService.eraserWidth)
                : this.drawCompleteLineY(pos2, pos1, varriationX, this.drawingService.eraserWidth);
        }
    }

    getCurrentToolString(): string {
        return 'eraser';
    }
}

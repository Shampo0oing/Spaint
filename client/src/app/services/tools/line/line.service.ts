import { Injectable } from '@angular/core';
import { ActionLine } from '@app/classes/Actions/action-line';
import { ANGLE_180, ANGLE_270, ANGLE_360, ANGLE_90, DISTANCE_20PX, FACTEUR_45 } from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

export const enum Octan {
    Premier = 0,
    Deuxieme = 1,
    Troisieme = 2,
    Quatrieme = 3,
    Cinquieme = 4,
    Sixieme = 5,
    Septieme = 6,
    Huitieme = 7,
    Neuvieme = 8,
}

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    private pathData: Vec2[];
    private drawingLine: boolean = false;

    constructor(protected drawingService: DrawingService, protected annulerRefaireService: AnnulerRefaireService) {
        super(drawingService, annulerRefaireService);
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.drawingLine) return;
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.drawLines(this.drawingService.previewCtx);
        this.createJunction(this.drawingService.previewCtx);
    }

    onClick(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);

        if (this.pathData.length === 0) {
            this.pathData.push(this.mouseDownCoord);
            this.drawingService.mouseDown = true;
            this.drawingLine = true;
        } else {
            if (
                this.mouseDownCoord.x - this.pathData[this.pathData.length - 1].x !== 0 &&
                this.mouseDownCoord.y - this.pathData[this.pathData.length - 1].y !== 0
            ) {
                this.drawLines(this.drawingService.previewCtx);
                this.pathData.push(this.mouseDownCoord);
                this.createJunction(this.drawingService.previewCtx);
            }
        }
    }

    onDoubleClick(): void {
        this.drawingLine = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.mouseDown = false;
        if (this.calculateDistance(this.pathData, this.mouseDownCoord) < DISTANCE_20PX) {
            this.pathData.pop();
            this.pathData.push(this.pathData[0]);
        }
        this.drawLines(this.drawingService.baseCtx);
        this.createJunction(this.drawingService.baseCtx);
        this.annulerRefaireService.addUndoAction(
            new ActionLine(
                this.drawingService,
                this.pathData,
                this.drawingService.primaryColor,
                this.drawingService.lineWidth,
                this.drawingService.pointWidth,
                this.drawingService.junctionType ? true : false,
            ),
        );
        this.clearPath();
    }

    escapeDown(): void {
        if (this.pathData.length === 0) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.clearPath();
    }

    shiftDown(): void {
        if (!this.drawingLine || this.mouseDownCoord === this.pathData[this.pathData.length - 1]) return;
        this.shift = true;
        this.drawLines(this.drawingService.previewCtx);
    }

    shiftUp(): void {
        if (!this.drawingLine || !this.shift) return;
        this.shift = false;
        this.drawLines(this.drawingService.previewCtx);
    }

    backspaceDown(): void {
        if (this.pathData.length <= 1) return;
        this.pathData.pop();
        this.drawLines(this.drawingService.previewCtx);
    }

    drawWithoutStroke(ctx: CanvasRenderingContext2D, pathData: Vec2[], mouseDownCoord: Vec2[], shift: boolean): void {
        for (let i = 0; i < pathData.length; i++) {
            if (i === 0) ctx.moveTo(pathData[i].x, pathData[i].y);
            else ctx.lineTo(pathData[i].x, pathData[i].y);
        }
        if (this.calculateDistance(pathData, mouseDownCoord[0]) < DISTANCE_20PX && ctx === this.drawingService.baseCtx) {
            this.shift = false;
        } else if (shift) {
            const newPoint = this.calcNewPoint(pathData, mouseDownCoord[0]);
            ctx.lineTo(newPoint.x, newPoint.y);
            mouseDownCoord[0].x = newPoint.x;
            mouseDownCoord[0].y = newPoint.y;
        } else {
            ctx.lineTo(mouseDownCoord[0].x, mouseDownCoord[0].y);
        }
    }

    drawLines(ctx: CanvasRenderingContext2D): void {
        this.drawingSetup(ctx);
        this.drawWithoutStroke(ctx, this.pathData, [this.mouseDownCoord], this.shift);
        ctx.stroke();
    }

    drawingSetup(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();
        ctx.lineWidth = this.drawingService.lineWidth;
        ctx.lineCap = 'round';
        ctx.fillStyle = this.drawingService.primaryColor;
        ctx.strokeStyle = this.drawingService.primaryColor;
        ctx.lineJoin = 'round';
    }

    calculateDistance(pathData: Vec2[], mouseDownCoord: Vec2): number {
        return Math.sqrt(Math.pow(Math.abs(pathData[0].x - mouseDownCoord.x), 2) + Math.pow(Math.abs(pathData[0].y - mouseDownCoord.y), 2));
    }

    calculateAngle(pathData: Vec2[], mouseDownCoord: Vec2): number {
        let angle;
        const difX = mouseDownCoord.x - pathData[pathData.length - 1].x;
        const difY = mouseDownCoord.y - pathData[pathData.length - 1].y;
        if (difX === 0) {
            if (difY >= 0) angle = ANGLE_90;
            else angle = ANGLE_270;
        } else {
            // 1er Quadrant
            angle =
                (ANGLE_180 * Math.atan((pathData[pathData.length - 1].y - mouseDownCoord.y) / (mouseDownCoord.x - pathData[pathData.length - 1].x))) /
                Math.PI;
            // 2eme Quadrant ou 3eme quadrant
            if (difX < 0) {
                angle += ANGLE_180;
            }
            // 4eme Quadrant
            else if (difX > 0 && difY > 0) {
                angle += ANGLE_360;
            }
        }
        return angle;
    }

    calcNewPoint(pathData: Vec2[], mouseDownCoord: Vec2): Vec2 {
        const multiple = Math.round(this.calculateAngle(pathData, mouseDownCoord) / FACTEUR_45);
        let newPoint: Vec2;
        // tslint:disable:no-magic-numbers
        switch (multiple) {
            case Octan.Premier:
            case Octan.Cinquieme:
            case Octan.Neuvieme: {
                newPoint = { x: mouseDownCoord.x, y: pathData[pathData.length - 1].y };
                break;
            }
            case Octan.Deuxieme: {
                newPoint = {
                    x: mouseDownCoord.x,
                    y: pathData[pathData.length - 1].y - Math.tan(Math.PI / 4) * (mouseDownCoord.x - pathData[pathData.length - 1].x),
                };
                break;
            }
            case Octan.Troisieme:
            case Octan.Septieme: {
                newPoint = { x: pathData[pathData.length - 1].x, y: mouseDownCoord.y };
                break;
            }
            case Octan.Quatrieme: {
                newPoint = {
                    x: mouseDownCoord.x,
                    y: pathData[pathData.length - 1].y - Math.tan((3 * Math.PI) / 4) * (mouseDownCoord.x - pathData[pathData.length - 1].x),
                };
                break;
            }
            case Octan.Sixieme: {
                newPoint = {
                    x: mouseDownCoord.x,
                    y: pathData[pathData.length - 1].y - Math.tan((5 * Math.PI) / 4) * (mouseDownCoord.x - pathData[pathData.length - 1].x),
                };
                break;
            }
            case Octan.Huitieme: {
                newPoint = {
                    x: mouseDownCoord.x,
                    y: pathData[pathData.length - 1].y - Math.tan((7 * Math.PI) / 4) * (mouseDownCoord.x - pathData[pathData.length - 1].x),
                };
                break;
            }
            default:
                newPoint = { x: 0, y: 0 };
                break;
        }
        return newPoint;
    }

    clearPath(): void {
        this.pathData = [];
    }

    createJunction(ctx: CanvasRenderingContext2D): void {
        if (this.drawingService.junctionType !== 1) return;
        for (const point of this.pathData) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.drawingService.pointWidth, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    getCurrentToolString(): string {
        return 'line';
    }
}

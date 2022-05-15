import { Injectable } from '@angular/core';
import { ActionEllipse } from '@app/classes/Actions/action-ellipse';
import { DEFAULT_LINE_WIDTH, LINE_DASH_MAX, LINE_DASH_MIN, MouseButton } from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class EllipseService extends Tool {
    lastMousePos: Vec2;
    circlePoint: Vec2;
    min: number;
    constructor(protected drawingService: DrawingService, protected annulerRefaireService: AnnulerRefaireService) {
        super(drawingService, annulerRefaireService);
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.mouseDown = event.button === MouseButton.Left;
        if (!this.drawingService.mouseDown) return;
        this.mouseDownCoord = this.getPositionFromMouse(event);
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.drawingService.mouseDown) return;
        if (this.shift) {
            this.drawCircle(this.drawingService.baseCtx, this.getPositionFromMouse(event));
            this.annulerRefaireService.addUndoAction(
                new ActionEllipse(
                    this.drawingService,
                    this.getCirclePos(this.lastMousePos, this.mouseDownCoord),
                    { x: this.min, y: this.min },
                    this.drawingService.primaryColor,
                    this.drawingService.secondaryColor,
                    this.drawingService.ellipseWidth,
                    this.drawingService.traceTypeEllipse,
                    this,
                ),
            );
        } else {
            const mousePos = this.getPositionFromMouse(event);
            this.drawEllipse(this.drawingService.baseCtx, mousePos);
            this.annulerRefaireService.addUndoAction(
                new ActionEllipse(
                    this.drawingService,
                    {
                        x: (mousePos.x - this.mouseDownCoord.x) / 2 + this.mouseDownCoord.x,
                        y: (mousePos.y - this.mouseDownCoord.y) / 2 + this.mouseDownCoord.y,
                    },
                    { x: Math.abs((mousePos.x - this.mouseDownCoord.x) / 2), y: Math.abs((mousePos.y - this.mouseDownCoord.y) / 2) },
                    this.drawingService.primaryColor,
                    this.drawingService.secondaryColor,
                    this.drawingService.ellipseWidth,
                    this.drawingService.traceTypeEllipse,
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
            this.drawCircle(this.drawingService.previewCtx, this.lastMousePos);
            this.drawSquare(this.drawingService.previewCtx);
        } else {
            this.drawEllipse(this.drawingService.previewCtx, this.lastMousePos);
            this.drawRectangle(this.drawingService.previewCtx);
        }
    }

    shiftDown(): void {
        this.shift = true;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (!this.drawingService.mouseDown) return;
        this.drawCircle(this.drawingService.previewCtx, this.lastMousePos);
        this.drawSquare(this.drawingService.previewCtx);
    }

    shiftUp(): void {
        this.shift = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (!this.drawingService.mouseDown) return;
        this.drawEllipse(this.drawingService.previewCtx, this.lastMousePos);
        this.drawRectangle(this.drawingService.previewCtx);
    }

    private drawEllipse(ctx: CanvasRenderingContext2D, mousePos: Vec2): void {
        this.drawingSetup(ctx);
        ctx.ellipse(
            (mousePos.x - this.mouseDownCoord.x) / 2 + this.mouseDownCoord.x,
            (mousePos.y - this.mouseDownCoord.y) / 2 + this.mouseDownCoord.y,
            Math.abs((mousePos.x - this.mouseDownCoord.x) / 2),
            Math.abs((mousePos.y - this.mouseDownCoord.y) / 2),
            0,
            0,
            2 * Math.PI,
        );
        this.traceType(ctx, this.drawingService.traceTypeEllipse);
    }

    getCirclePos(mousePos: Vec2, mouseDownCoord: Vec2): Vec2 {
        let circlePos;
        this.min = Math.min(Math.abs(mouseDownCoord.x - mousePos.x) / 2, Math.abs(mousePos.y - mouseDownCoord.y) / 2);
        if (mousePos.x - mouseDownCoord.x < 0 && mousePos.y - mouseDownCoord.y > 0)
            circlePos = { x: mouseDownCoord.x - this.min, y: mouseDownCoord.y + this.min };
        else if (mousePos.y - mouseDownCoord.y < 0 && mousePos.x - mouseDownCoord.x > 0)
            circlePos = { x: mouseDownCoord.x + this.min, y: mouseDownCoord.y - this.min };
        else if (mousePos.y - mouseDownCoord.y < 0 && mousePos.x - mouseDownCoord.x < 0)
            circlePos = { x: mouseDownCoord.x - this.min, y: mouseDownCoord.y - this.min };
        else circlePos = { x: mouseDownCoord.x + this.min, y: mouseDownCoord.y + this.min };
        return circlePos;
    }

    private drawCircle(ctx: CanvasRenderingContext2D, mousePos: Vec2): void {
        this.drawingSetup(ctx);
        this.circlePoint = this.getCirclePos(mousePos, this.mouseDownCoord);
        ctx.ellipse(this.circlePoint.x, this.circlePoint.y, this.min, this.min, 0, 0, 2 * Math.PI);
        this.traceType(ctx, this.drawingService.traceTypeEllipse);
    }

    drawingSetup(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.strokeStyle = this.drawingService.secondaryColor;
        ctx.lineCap = 'round';
        ctx.lineWidth = this.drawingService.ellipseWidth;
    }

    private drawRectangle(ctx: CanvasRenderingContext2D): void {
        ctx.setLineDash([LINE_DASH_MIN, LINE_DASH_MAX]);
        this.drawingSetup(ctx);
        ctx.lineWidth = DEFAULT_LINE_WIDTH;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(
            this.mouseDownCoord.x,
            this.mouseDownCoord.y,
            this.lastMousePos.x - this.mouseDownCoord.x,
            this.lastMousePos.y - this.mouseDownCoord.y,
        );
        ctx.strokeStyle = this.drawingService.secondaryColor;
        ctx.setLineDash([]);
    }

    private drawSquare(ctx: CanvasRenderingContext2D): void {
        ctx.setLineDash([LINE_DASH_MIN, LINE_DASH_MAX]);
        this.drawingSetup(ctx);
        ctx.lineWidth = DEFAULT_LINE_WIDTH;
        this.mouseDownCoord = this.mouseDownCoord;
        ctx.strokeStyle = '#000000';
        const width: number = this.lastMousePos.x - this.mouseDownCoord.x;
        const height: number = this.lastMousePos.y - this.mouseDownCoord.y;
        const min = Math.min(Math.abs(width), Math.abs(height));
        if (width < 0 && height > 0) {
            ctx.rect(this.mouseDownCoord.x - min, this.mouseDownCoord.y, min, min);
        } else if (height < 0 && width > 0) {
            ctx.rect(this.mouseDownCoord.x, this.mouseDownCoord.y - min, min, min);
        } else if (height < 0 && width < 0) {
            ctx.rect(this.mouseDownCoord.x - min, this.mouseDownCoord.y - min, min, min);
        } else {
            ctx.rect(this.mouseDownCoord.x, this.mouseDownCoord.y, min, min);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    getCurrentToolString(): string {
        return 'ellipse';
    }
}

import { Injectable } from '@angular/core';
import { ActionPolygon } from '@app/classes/Actions/action-polygon';
import { DEFAULT_LINE_WIDTH, LINE_DASH_MAX, LINE_DASH_MIN } from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

export enum Edge {
    triangle = 3,
    square,
    pentagon,
    hexagon,
    heptagon,
    octagon,
    enneagone,
    decagon,
    hendecagon,
    dodecagon,
}

@Injectable({
    providedIn: 'root',
})
// tslint:disable:no-magic-numbers
export class PolygonService extends Tool {
    constructor(protected drawingService: DrawingService, protected annulerRefaireService: AnnulerRefaireService) {
        super(drawingService, annulerRefaireService);
    }
    private lastMousePos: Vec2;
    newPoint: Vec2 = { x: 0, y: 0 };
    private width: number;
    private height: number;
    min: number;

    onMouseMove(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.lastMousePos = this.getPositionFromMouse(event);
        if (!this.drawingService.mouseDown) return;
        this.placeCircle(this.drawingService.previewCtx);
        this.updateAndDraw(this.drawingService.previewCtx);
    }

    onMouseDown(event: MouseEvent): void {
        if (this.drawingService.mouseDown) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.drawingService.mouseDown = true;
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.drawingService.mouseDown) return;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.updateAndDraw(this.drawingService.baseCtx);
        this.annulerRefaireService.addUndoAction(
            new ActionPolygon(
                this.drawingService,
                this.min,
                { x: this.newPoint.x, y: this.newPoint.y },
                this.drawingService.polygonWidth,
                this.drawingService.primaryColor,
                this.drawingService.secondaryColor,
                this.drawingService.traceTypePolygon,
                this.drawingService.numberOfEdges,
                this,
            ),
        );
        this.drawingService.mouseDown = false;
    }

    updateAndDraw(ctx: CanvasRenderingContext2D): void {
        this.updateMin();
        this.drawPolygon(ctx);
    }

    drawPolygon(ctx: CanvasRenderingContext2D): void {
        this.drawingSetup(ctx);
        switch (this.drawingService.numberOfEdges) {
            case Edge.triangle:
                this.drawPolygon_3Edges(ctx);
                break;
            case Edge.square:
                this.drawPolygon_4Edges(ctx);
                break;
            case Edge.pentagon:
                this.drawPolygon_5Edges(ctx);
                break;
            case Edge.hexagon:
                this.drawPolygon_6Edges(ctx);
                break;
            case Edge.heptagon:
                this.drawPolygon_7Edges(ctx);
                break;
            case Edge.octagon:
                this.drawPolygon_8Edges(ctx);
                break;
            case Edge.enneagone:
                this.drawPolygon_9Edges(ctx);
                break;
            case Edge.decagon:
                this.drawPolygon_10Edges(ctx);
                break;
            case Edge.hendecagon:
                this.drawPolygon_11Edges(ctx);
                break;
            case Edge.dodecagon:
                this.drawPolygon_12Edges(ctx);
                break;
        }
        this.traceType(ctx, this.drawingService.traceTypePolygon);
    }

    updateMin(): void {
        this.width = this.lastMousePos.x - this.mouseDownCoord.x;
        this.height = this.lastMousePos.y - this.mouseDownCoord.y;
        this.min = Math.min(Math.abs(this.width), Math.abs(this.height));
        this.setNewPoint();
    }

    setNewPoint(): void {
        this.newPoint.x = this.width < 0 ? this.mouseDownCoord.x - this.min / 2 : this.mouseDownCoord.x + this.min / 2;
        this.newPoint.y = this.height < 0 ? this.mouseDownCoord.y - this.min / 2 : this.mouseDownCoord.y + this.min / 2;
    }

    drawPolygon_3Edges(ctx: CanvasRenderingContext2D): void {
        const x1: number = ((this.min / 2) * Math.sin((2 * Math.PI) / 3)) / Math.sin(Math.PI / 6);
        const x2: number = Math.cos(Math.PI / 3) * x1;
        const x3: number = Math.tan(Math.PI / 6) * x2;
        ctx.moveTo(this.newPoint.x, this.newPoint.y - this.min / 2);
        ctx.lineTo(this.newPoint.x + x2, this.newPoint.y + x3);
        ctx.lineTo(this.newPoint.x - x2, this.newPoint.y + x3);
        ctx.closePath();
    }

    drawPolygon_4Edges(ctx: CanvasRenderingContext2D): void {
        const x1: number = Math.cos(Math.PI / 4) * (this.min / 2);
        ctx.moveTo(this.newPoint.x + x1, this.newPoint.y - x1);
        ctx.lineTo(this.newPoint.x + x1, this.newPoint.y + x1);
        ctx.lineTo(this.newPoint.x - x1, this.newPoint.y + x1);
        ctx.lineTo(this.newPoint.x - x1, this.newPoint.y - x1);
        ctx.closePath();
    }

    drawPolygon_5Edges(ctx: CanvasRenderingContext2D): void {
        const x1: number = (Math.sin((2 / 5) * Math.PI) * (this.min / 2)) / Math.sin((3 / 10) * Math.PI);
        const x2: number = x1 / 2 / Math.tan(Math.PI / 5);
        const x3: number = x1 * Math.sin((3 / 10) * Math.PI);
        const x4: number = x3 / Math.tan((2 / 5) * Math.PI);

        ctx.moveTo(this.newPoint.x, this.newPoint.y - this.min / 2);
        ctx.lineTo(this.newPoint.x + x3, this.newPoint.y - x4);
        ctx.lineTo(this.newPoint.x + x1 / 2, this.newPoint.y + x2);
        ctx.lineTo(this.newPoint.x - x1 / 2, this.newPoint.y + x2);
        ctx.lineTo(this.newPoint.x - x3, this.newPoint.y - x4);
        ctx.closePath();
    }

    drawPolygon_6Edges(ctx: CanvasRenderingContext2D): void {
        const x1: number = Math.cos(Math.PI / 6) * (this.min / 2);

        ctx.moveTo(this.newPoint.x, this.newPoint.y - this.min / 2);
        ctx.lineTo(this.newPoint.x + x1, this.newPoint.y - this.min / 4);
        ctx.lineTo(this.newPoint.x + x1, this.newPoint.y + this.min / 4);
        ctx.lineTo(this.newPoint.x, this.newPoint.y + this.min / 2);
        ctx.lineTo(this.newPoint.x - x1, this.newPoint.y + this.min / 4);
        ctx.lineTo(this.newPoint.x - x1, this.newPoint.y - this.min / 4);
        ctx.closePath();
    }

    drawPolygon_7Edges(ctx: CanvasRenderingContext2D): void {
        const x1: number = (this.min / 2) * Math.sin((2 / 7) * Math.PI);
        const x2: number = x1 / Math.tan((5 / 14) * Math.PI);
        const x3: number = (this.min / 2) * Math.cos((3 / 7) * Math.PI);
        const x4: number = (this.min / 2) * Math.sin((3 / 7) * Math.PI);
        const x5: number = (this.min / 2) * Math.sin(Math.PI / 7);
        const x6: number = (this.min / 2) * Math.cos(Math.PI / 7);

        ctx.moveTo(this.newPoint.x, this.newPoint.y - this.min / 2);
        ctx.lineTo(this.newPoint.x + x1, this.newPoint.y - this.min / 2 + x2);
        ctx.lineTo(this.newPoint.x + x4, this.newPoint.y + x3);
        ctx.lineTo(this.newPoint.x + x5, this.newPoint.y + x6);
        ctx.lineTo(this.newPoint.x - x5, this.newPoint.y + x6);
        ctx.lineTo(this.newPoint.x - x4, this.newPoint.y + x3);
        ctx.lineTo(this.newPoint.x - x1, this.newPoint.y - this.min / 2 + x2);
        ctx.closePath();
    }

    drawPolygon_8Edges(ctx: CanvasRenderingContext2D): void {
        const x1: number = Math.sin(Math.PI / 4) * (this.min / 2);
        const x2: number = Math.cos(Math.PI / 4) * (this.min / 2);

        ctx.moveTo(this.newPoint.x, this.newPoint.y - this.min / 2);
        ctx.lineTo(this.newPoint.x + x1, this.newPoint.y - x2);
        ctx.lineTo(this.newPoint.x + this.min / 2, this.newPoint.y);
        ctx.lineTo(this.newPoint.x + x1, this.newPoint.y + x2);
        ctx.lineTo(this.newPoint.x, this.newPoint.y + this.min / 2);
        ctx.lineTo(this.newPoint.x - x1, this.newPoint.y + x2);
        ctx.lineTo(this.newPoint.x - this.min / 2, this.newPoint.y);
        ctx.lineTo(this.newPoint.x - x1, this.newPoint.y - x2);
        ctx.closePath();
    }

    drawPolygon_9Edges(ctx: CanvasRenderingContext2D): void {
        const x1: number = ((this.min / 2) * Math.sin((2 / 9) * Math.PI)) / Math.sin((7 / 18) * Math.PI);
        const x2: number = (this.min / 2) * Math.sin((2 / 9) * Math.PI);
        const x3: number = (this.min / 2) * Math.cos((2 / 9) * Math.PI);
        const x4: number = (this.min / 2) * Math.sin((4 / 9) * Math.PI);
        const x5: number = (this.min / 2) * Math.cos((4 / 9) * Math.PI);
        const x6: number = (this.min / 2) * Math.sin(Math.PI / 3);
        const x7: number = (this.min / 2) * Math.cos(Math.PI / 3);
        const x8: number = (this.min / 2) * Math.sin((7 / 18) * Math.PI);

        ctx.moveTo(this.newPoint.x, this.newPoint.y - this.min / 2);
        ctx.lineTo(this.newPoint.x + x2, this.newPoint.y - x3);
        ctx.lineTo(this.newPoint.x + x4, this.newPoint.y - x5);
        ctx.lineTo(this.newPoint.x + x6, this.newPoint.y + x7);
        ctx.lineTo(this.newPoint.x + x1 / 2, this.newPoint.y + x8);
        ctx.lineTo(this.newPoint.x - x1 / 2, this.newPoint.y + x8);
        ctx.lineTo(this.newPoint.x - x6, this.newPoint.y + x7);
        ctx.lineTo(this.newPoint.x - x4, this.newPoint.y - x5);
        ctx.lineTo(this.newPoint.x - x2, this.newPoint.y - x3);
        ctx.closePath();
    }

    drawPolygon_10Edges(ctx: CanvasRenderingContext2D): void {
        const x1: number = (Math.sin(Math.PI / 4) * (this.min / 2)) / Math.sin((3 * Math.PI) / 8);
        const x2: number = Math.cos(Math.PI / 10) * (this.min / 2);
        const x3: number = Math.sin(Math.PI / 5) * (this.min / 2);
        const x4: number = Math.cos(Math.PI / 5) * (this.min / 2);

        ctx.moveTo(this.newPoint.x, this.newPoint.y - this.min / 2);
        ctx.lineTo(this.newPoint.x + x3, this.newPoint.y - x4);
        ctx.lineTo(this.newPoint.x + x2, this.newPoint.y - x1 / 2);
        ctx.lineTo(this.newPoint.x + x2, this.newPoint.y + x1 / 2);
        ctx.lineTo(this.newPoint.x + x3, this.newPoint.y + x4);
        ctx.lineTo(this.newPoint.x, this.newPoint.y + this.min / 2);
        ctx.lineTo(this.newPoint.x - x3, this.newPoint.y + x4);
        ctx.lineTo(this.newPoint.x - x2, this.newPoint.y + x1 / 2);
        ctx.lineTo(this.newPoint.x - x2, this.newPoint.y - x1 / 2);
        ctx.lineTo(this.newPoint.x - x3, this.newPoint.y - x4);
        ctx.closePath();
    }

    drawPolygon_11Edges(ctx: CanvasRenderingContext2D): void {
        const x1: number = ((this.min / 2) * Math.sin((2 / 11) * Math.PI)) / Math.sin((5 / 11) * Math.PI);
        const x2: number = (this.min / 2) * Math.cos((2 / 11) * Math.PI);
        const x3: number = (this.min / 2) * Math.sin((2 / 11) * Math.PI);
        const x4: number = (this.min / 2) * Math.sin((4 / 11) * Math.PI);
        const x5: number = (this.min / 2) * Math.cos((4 / 11) * Math.PI);
        const x6: number = (this.min / 2) * Math.sin((5 / 11) * Math.PI);
        const x7: number = (this.min / 2) * Math.cos((5 / 11) * Math.PI);
        const x8: number = (this.min / 2) * Math.sin((3 / 11) * Math.PI);
        const x9: number = (this.min / 2) * Math.cos((3 / 11) * Math.PI);
        const x10: number = (this.min / 2) * Math.cos(Math.PI / 11);

        ctx.moveTo(this.newPoint.x, this.newPoint.y - this.min / 2);
        ctx.lineTo(this.newPoint.x + x3, this.newPoint.y - x2);
        ctx.lineTo(this.newPoint.x + x4, this.newPoint.y - x5);
        ctx.lineTo(this.newPoint.x + x6, this.newPoint.y + x7);
        ctx.lineTo(this.newPoint.x + x8, this.newPoint.y + x9);
        ctx.lineTo(this.newPoint.x + x1 / 2, this.newPoint.y + x10);
        ctx.lineTo(this.newPoint.x - x1 / 2, this.newPoint.y + x10);
        ctx.lineTo(this.newPoint.x - x8, this.newPoint.y + x9);
        ctx.lineTo(this.newPoint.x - x6, this.newPoint.y + x7);
        ctx.lineTo(this.newPoint.x - x4, this.newPoint.y - x5);
        ctx.lineTo(this.newPoint.x - x3, this.newPoint.y - x2);
        ctx.closePath();
    }

    drawPolygon_12Edges(ctx: CanvasRenderingContext2D): void {
        const x1: number = Math.sin(Math.PI / 6) * (this.min / 2);
        const x2: number = Math.cos(Math.PI / 6) * (this.min / 2);

        ctx.moveTo(this.newPoint.x, this.newPoint.y - this.min / 2);
        ctx.lineTo(this.newPoint.x + x1, this.newPoint.y - x2);
        ctx.lineTo(this.newPoint.x + x2, this.newPoint.y - x1);
        ctx.lineTo(this.newPoint.x + this.min / 2, this.newPoint.y);
        ctx.lineTo(this.newPoint.x + x2, this.newPoint.y + x1);
        ctx.lineTo(this.newPoint.x + x1, this.newPoint.y + x2);
        ctx.lineTo(this.newPoint.x, this.newPoint.y + this.min / 2);
        ctx.lineTo(this.newPoint.x - x1, this.newPoint.y + x2);
        ctx.lineTo(this.newPoint.x - x2, this.newPoint.y + x1);
        ctx.lineTo(this.newPoint.x - this.min / 2, this.newPoint.y);
        ctx.lineTo(this.newPoint.x - x2, this.newPoint.y - x1);
        ctx.lineTo(this.newPoint.x - x1, this.newPoint.y - x2);
        ctx.closePath();
    }

    placeCircle(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.strokeStyle = '#000000';
        ctx.setLineDash([LINE_DASH_MIN, LINE_DASH_MAX]);
        ctx.lineWidth = DEFAULT_LINE_WIDTH;
        this.updateMin();
        ctx.ellipse(
            this.newPoint.x,
            this.newPoint.y,
            this.min / 2 + this.drawingService.polygonWidth,
            this.min / 2 + this.drawingService.polygonWidth,
            0,
            0,
            2 * Math.PI,
        );
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawingSetup(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.lineWidth = this.drawingService.polygonWidth;
        ctx.strokeStyle = this.drawingService.secondaryColor;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
    }

    getCurrentToolString(): string {
        return 'polygon';
    }
}

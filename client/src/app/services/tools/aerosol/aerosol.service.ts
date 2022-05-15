import { Injectable } from '@angular/core';
import { ActionAerosol } from '@app/classes/Actions/action-aerosol';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

const nbOfPoints = 50;
const timeMS = 1000;

@Injectable({
    providedIn: 'root',
})
export class AerosolService extends Tool {
    constructor(protected drawingService: DrawingService, protected annulerRefaireService: AnnulerRefaireService) {
        super(drawingService, annulerRefaireService);
    }
    private dist: Vec2;
    private lastMousePos: Vec2;
    private timer: number;
    private pathData: Vec2[] = [];

    onMouseDown(): void {
        this.drawingService.mouseDown = true;
        this.timer = window.setInterval(() => this.sprayPaint(this.drawingService.baseCtx), timeMS / this.drawingService.emission);
    }

    onMouseMove(event: MouseEvent): void {
        this.lastMousePos = this.getPositionFromMouse(event);
    }

    onMouseUp(): void {
        if (!this.drawingService.mouseDown) return;
        window.clearInterval(this.timer);
        this.annulerRefaireService.addUndoAction(
            new ActionAerosol(this.drawingService, this.pathData, this.drawingService.primaryColor, this.drawingService.dropletDiameter),
        );
        this.pathData = [];
        this.drawingService.mouseDown = false;
    }

    sprayPaint(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.drawingService.primaryColor;
        for (let i = 0; i < nbOfPoints; i++) {
            do {
                this.dist = {
                    x: Math.cos(Math.random() * Math.PI * 2) * (this.drawingService.sprayDiameter / 2) * Math.random(),
                    y: Math.sin(Math.random() * Math.PI * 2) * (this.drawingService.sprayDiameter / 2) * Math.random(),
                };
            } while (Math.pow(this.dist.x, 2) + Math.pow(this.dist.y, 2) > Math.pow(this.drawingService.sprayDiameter / 2, 2));
            const point: Vec2 = { x: this.lastMousePos.x + this.dist.x, y: this.lastMousePos.y + this.dist.y };
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.drawingService.dropletDiameter / 2, 0, Math.PI * 2);
            this.pathData.push(point);
            ctx.fill();
        }
    }

    getCurrentToolString(): string {
        return 'aerosol';
    }
}

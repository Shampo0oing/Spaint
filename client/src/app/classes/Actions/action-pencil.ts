import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';

export class ActionPencil extends Action {
    pathData: Vec2[];
    color: string;
    lineWidth: number;

    constructor(drawingService: DrawingService, pathData: Vec2[], color: string, lineWidth: number) {
        super(drawingService);
        this.pathData = pathData;
        this.color = color;
        this.lineWidth = lineWidth;
    }

    draw(): void {
        const ctx = this.drawingService.baseCtx;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.color;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(this.pathData[0].x, this.pathData[0].y);
        for (const element of this.pathData) ctx.lineTo(element.x, element.y);
        ctx.stroke();
    }
}

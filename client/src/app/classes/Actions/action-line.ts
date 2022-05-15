import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';

export class ActionLine extends Action {
    pathData: Vec2[];
    color: string;
    lineWidth: number;
    pointWidth: number;
    junctionType: boolean;

    constructor(drawingService: DrawingService, pathData: Vec2[], color: string, lineWidth: number, pointWidth: number, junctionType: boolean) {
        super(drawingService);
        this.pathData = pathData;
        this.color = color;
        this.lineWidth = lineWidth;
        this.pointWidth = pointWidth;
        this.junctionType = junctionType;
    }

    draw(): void {
        const ctx = this.drawingService.baseCtx;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i < this.pathData.length; i++) {
            ctx.lineTo(this.pathData[i].x, this.pathData[i].y);
            ctx.stroke();
            if (this.junctionType && i !== 0 && i !== this.pathData.length - 1) {
                ctx.beginPath();
                ctx.arc(this.pathData[i].x, this.pathData[i].y, this.pointWidth, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(this.pathData[i].x, this.pathData[i].y);
            }
        }
    }
}

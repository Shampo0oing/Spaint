import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';

export class ActionAerosol extends Action {
    pathData: Vec2[];
    color: string;
    lineWidth: number;
    dropletDiameter: number;

    constructor(drawingService: DrawingService, pathData: Vec2[], color: string, dropletDiameter: number) {
        super(drawingService);
        this.pathData = pathData;
        this.color = color;
        this.dropletDiameter = dropletDiameter;
    }

    draw(): void {
        const ctx = this.drawingService.baseCtx;
        ctx.fillStyle = this.color;
        for (const point of this.pathData) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.dropletDiameter / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';
import { EraserService } from '@app/services/tools/eraser/eraser.service';

export class ActionEraser extends Action {
    pathData: Vec2[];
    color: string = '#ffffff';
    eraserWidth: number;

    constructor(drawingService: DrawingService, pathData: Vec2[], eraserWidth: number, private eraserService: EraserService) {
        super(drawingService);
        this.pathData = pathData;
        this.eraserWidth = eraserWidth;
    }

    draw(): void {
        const ctx = this.drawingService.baseCtx;
        this.drawingService.eraserWidth = this.eraserWidth;
        ctx.fillStyle = this.color;
        for (let i = 0; i < this.pathData.length; i++) {
            ctx.fillRect(this.pathData[i].x, this.pathData[i].y, this.eraserWidth, this.eraserWidth);
            if (i !== this.pathData.length - 1)
                if (this.eraserService.distance(this.pathData[i], this.pathData[i + 1]) > 2) {
                    this.eraserService.completeLine(
                        { x: this.pathData[i].x + this.eraserWidth / 2, y: this.pathData[i].y + this.eraserWidth / 2 },
                        { x: this.pathData[i + 1].x + this.eraserWidth / 2, y: this.pathData[i + 1].y + this.eraserWidth / 2 },
                    );
                }
        }
    }
}

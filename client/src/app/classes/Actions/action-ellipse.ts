import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';

export class ActionEllipse extends Action {
    circle: boolean;
    mousePos: Vec2;
    mouseDownCoord: Vec2;
    primaryColor: string;
    secondaryColor: string;
    ellipseWidth: number;
    traceTypeEllipse: number;

    constructor(
        drawingService: DrawingService,
        mousePos: Vec2,
        mouseDownCoord: Vec2,
        primaryColor: string,
        secondaryColor: string,
        ellipseWidth: number,
        traceTypeEllipse: number,
        private ellipseService: EllipseService,
    ) {
        super(drawingService);
        this.mousePos = mousePos;
        this.mouseDownCoord = mouseDownCoord;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.ellipseWidth = ellipseWidth;
        this.traceTypeEllipse = traceTypeEllipse;
    }

    draw(): void {
        const ctx = this.drawingService.baseCtx;
        ctx.beginPath();
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineCap = 'round';
        ctx.lineWidth = this.ellipseWidth;
        this.drawingService.traceTypeEllipse = this.traceTypeEllipse;
        this.drawingService.primaryColor = this.primaryColor;
        this.drawingService.secondaryColor = this.secondaryColor;
        ctx.ellipse(this.mousePos.x, this.mousePos.y, this.mouseDownCoord.x, this.mouseDownCoord.y, 0, 0, 2 * Math.PI);
        this.ellipseService.traceType(ctx, this.drawingService.traceTypeEllipse);
    }
}

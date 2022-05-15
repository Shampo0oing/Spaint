import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';

export class ActionRectangle extends Action {
    point: Vec2;
    width: number;
    height: number;
    primaryColor: string;
    secondaryColor: string;
    rectangleWidth: number;
    traceType: number;

    constructor(
        drawingService: DrawingService,
        point: Vec2,
        primaryColor: string,
        secondaryColor: string,
        width: number,
        height: number,
        rectangleWidth: number,
        traceType: number,
        private rectangleService: RectangleService,
    ) {
        super(drawingService);
        this.point = point;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.rectangleWidth = rectangleWidth;
        this.width = width;
        this.height = height;
        this.traceType = traceType;
    }

    draw(): void {
        const ctx = this.drawingService.baseCtx;
        ctx.beginPath();
        ctx.lineWidth = this.rectangleWidth;
        ctx.strokeStyle = this.secondaryColor;
        ctx.fillStyle = this.primaryColor;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        this.drawingService.traceTypeRectangle = this.traceType;
        this.drawingService.primaryColor = this.primaryColor;
        this.drawingService.secondaryColor = this.secondaryColor;
        ctx.rect(this.point.x, this.point.y, this.width, this.height);
        this.rectangleService.traceType(ctx, this.drawingService.traceTypeRectangle);
    }
}

import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';

export class ActionPolygon extends Action {
    min: number;
    newPoint: Vec2;
    polygonWidth: number;
    primaryColor: string;
    secondaryColor: string;
    traceTypePolygon: number;
    numberOfEdges: number;
    constructor(
        drawingService: DrawingService,
        min: number,
        newPoint: Vec2,
        polygonWidth: number,
        primaryColor: string,
        secondaryColor: string,
        traceTypePolygon: number,
        numberOfEdges: number,
        private polygonService: PolygonService,
    ) {
        super(drawingService);
        this.min = min;
        this.newPoint = newPoint;
        this.polygonWidth = polygonWidth;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.traceTypePolygon = traceTypePolygon;
        this.numberOfEdges = numberOfEdges;
    }

    draw(): void {
        const ctx = this.drawingService.baseCtx;
        this.drawingService.primaryColor = this.primaryColor;
        this.drawingService.secondaryColor = this.secondaryColor;
        this.drawingService.traceTypePolygon = this.traceTypePolygon;
        this.drawingService.polygonWidth = this.polygonWidth;
        this.polygonService.newPoint = { x: this.newPoint.x, y: this.newPoint.y };
        this.polygonService.min = this.min;
        this.drawingService.numberOfEdges = this.numberOfEdges;
        this.polygonService.drawPolygon(ctx);
    }
}

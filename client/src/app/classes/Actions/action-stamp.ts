import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';
import { StampService } from '@app/services/tools/stamp/stamp.service';

export class ActionStamp extends Action {
    lastMousePos: Vec2 = { x: 0, y: 0 };
    image: HTMLImageElement = new Image();
    stampAngle: number = 0;
    stampScale: number = 0;
    links: string[] = [];
    constructor(
        drawingService: DrawingService,
        lastMousePos: Vec2,
        src: string,
        stampAngle: number,
        stampScale: number,
        links: string[],
        private stampService: StampService,
    ) {
        super(drawingService);
        this.lastMousePos = lastMousePos;
        this.image.src = src;
        this.stampAngle = stampAngle;
        this.stampScale = stampScale;
        this.links = links;
    }

    draw(): void {
        const ctx = this.drawingService.baseCtx;
        this.stampService.lastMousePos = { x: this.lastMousePos.x, y: this.lastMousePos.y };
        this.drawingService.image = this.image;
        this.stampService.stampAngle = this.stampAngle;
        this.drawingService.stampScale = this.stampScale;
        this.stampService.links = this.links;
        this.stampService.rotateImage(ctx);
    }
}

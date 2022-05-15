import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';
import { SceauService } from '@app/services/tools/sceau/sceau.service';

export class ActionSceauContigus extends Action {
    position: Vec2;
    currentColor: number[];
    newColor: number[];
    tolEcart: number;

    constructor(drawingService: DrawingService, position: Vec2, currentColor: number[], newColor: number[], private sceauService: SceauService) {
        super(drawingService);
        this.position = { x: position.x, y: position.y };
        this.currentColor = currentColor;
        this.newColor = newColor;
        this.tolEcart = this.drawingService.tolEcart as number;
    }

    draw(): void {
        const imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        const data = imageData.data;

        this.sceauService.fillPixelsContigus(data, this.position, this.currentColor, this.newColor, this.tolEcart);
        this.drawingService.baseCtx.putImageData(imageData, 0, 0);
    }
}

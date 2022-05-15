import { Action, DrawingService } from '@app/classes/Actions/action';
import { SceauService } from '@app/services/tools/sceau/sceau.service';

export class ActionSceauNonContigus extends Action {
    currentColor: number[];
    newColor: number[];
    tolEcart: number;

    constructor(drawingService: DrawingService, currentColor: number[], newColor: number[], private sceauService: SceauService) {
        super(drawingService);
        this.currentColor = currentColor;
        this.newColor = newColor;
        this.tolEcart = this.drawingService.tolEcart as number;
    }

    draw(): void {
        const imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        const data = imageData.data;

        this.sceauService.fillPixelsNContigus(data, this.currentColor, this.newColor, this.tolEcart);
        this.drawingService.baseCtx.putImageData(imageData, 0, 0);
    }
}

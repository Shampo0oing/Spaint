import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';

export class ActionPaste extends Action {
    imageData: ImageData;
    position: Vec2;
    dimension: Vec2;

    constructor(drawingService: DrawingService, imageData: ImageData, position: Vec2, dimension: Vec2) {
        super(drawingService);
        this.imageData = imageData;
        this.position = position;
        this.dimension = dimension;
    }

    draw(): void {
        this.drawingService.drawImageDataOnBaseCtx(this.position, this.dimension, this.imageData);
    }
}

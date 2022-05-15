import { Action, DrawingService } from '@app/classes/Actions/action';
import { BLUE, GREEN, OPACITY, PIXEL_SIZE, RED, WHITE } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';

export class ActionDelete extends Action {
    imageData: ImageData;
    position: Vec2;
    dimension: Vec2;

    constructor(drawingService: DrawingService, position: Vec2, dimension: Vec2, imageData: ImageData) {
        super(drawingService);
        this.imageData = imageData;
        this.position = position;
        this.dimension = dimension;
    }

    draw(): void {
        const imageDataTemp = this.drawingService.baseCtx.createImageData(this.dimension.x, this.dimension.y);
        for (let y = 0; y < this.dimension.y; y++) {
            for (let x = 0; x < this.dimension.x; x++) {
                const i = x * PIXEL_SIZE + y * PIXEL_SIZE * this.dimension.x;
                if (
                    !(
                        this.imageData.data[i + RED] === 0 &&
                        this.imageData.data[i + GREEN] === 0 &&
                        this.imageData.data[i + BLUE] === 0 &&
                        this.imageData.data[i + OPACITY] === 0
                    )
                ) {
                    imageDataTemp.data[i + RED] = imageDataTemp.data[i + GREEN] = imageDataTemp.data[i + BLUE] = imageDataTemp.data[
                        i + OPACITY
                    ] = WHITE;
                }
            }
        }

        this.drawingService.drawImageDataOnBaseCtx(this.position, this.dimension, imageDataTemp);
    }
}

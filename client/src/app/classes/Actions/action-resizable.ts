import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';
import { ResizerService } from '@app/services/resizer/resizer.service';

export class ActionResizer extends Action {
    dimensions: Vec2;

    constructor(drawingService: DrawingService, private resizerService: ResizerService, dimensions: Vec2) {
        super(drawingService);
        this.dimensions = dimensions;
    }

    draw(): void {
        this.resizerService.resizeImage(this.dimensions);
    }
}

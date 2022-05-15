import { DrawingService } from '@app/services/drawing/drawing.service';
export { DrawingService } from '@app/services/drawing/drawing.service';

export abstract class Action {
    constructor(protected drawingService: DrawingService) {}

    abstract draw(): void;
}

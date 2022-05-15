import { Action, DrawingService } from '@app/classes/Actions/action';

export class ActionStub extends Action {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    // tslint:disable-next-line:no-empty
    draw(): void {}
}

import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class MagnetismService {
    constructor(private drawingService: DrawingService) {}
    translationPointX: number = 0;
    translationPointY: number = 0;

    affectWithMagnestism(position: Vec2, dimension: Vec2): Vec2 {
        const pos: Vec2 = { x: 0, y: 0 };
        pos.x =
            Math.round((position.x + dimension.x * this.translationPointX) / this.drawingService.squareSize) * this.drawingService.squareSize -
            dimension.x * this.translationPointX;
        pos.y =
            Math.round((position.y + dimension.y * this.translationPointY) / this.drawingService.squareSize) * this.drawingService.squareSize -
            dimension.y * this.translationPointY;
        return pos;
    }
}

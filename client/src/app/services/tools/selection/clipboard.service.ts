import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    imageData: ImageData;
    imageDimensions: Vec2 = { x: 0, y: 0 };
    selectedTool: string;
    pathData: Vec2[];
    pathDataPercent: Vec2[];

    copy(image: ImageData, dimensions: Vec2, selectedTool: string, pathData?: Vec2[], pathDataPercent?: Vec2[]): void {
        this.imageData = image;
        this.imageDimensions = dimensions;
        this.selectedTool = selectedTool;
        if (pathData) this.pathData = pathData;
        else this.pathData = [];
        if (pathDataPercent) this.pathDataPercent = pathDataPercent;
        else this.pathDataPercent = [];
    }

    isEmpty(): boolean {
        return this.imageDimensions.x === 0 && this.imageDimensions.y === 0;
    }
}

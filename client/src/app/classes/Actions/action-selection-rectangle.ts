import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';

export class ActionSelectionRectangle extends Action {
    positionDepart: Vec2;
    positionFinal: Vec2;
    dimensionsDepart: Vec2;
    dimensionsFinal: Vec2;
    flipX: boolean;
    flipY: boolean;
    constructor(
        drawingService: DrawingService,
        positionDepart: Vec2,
        positionFinal: Vec2,
        dimensionsDepart: Vec2,
        dimensionsFinal: Vec2,
        flipX: boolean,
        flipY: boolean,
    ) {
        super(drawingService);
        this.positionDepart = positionDepart;
        this.positionFinal = positionFinal;
        this.dimensionsDepart = dimensionsDepart;
        this.dimensionsFinal = dimensionsFinal;
        this.flipX = flipX;
        this.flipY = flipY;
    }

    draw(): void {
        const imageData = this.drawingService.baseCtx.getImageData(
            this.positionDepart.x,
            this.positionDepart.y,
            this.dimensionsDepart.x,
            this.dimensionsDepart.y,
        );
        const scale = {
            x: this.flipX ? -this.dimensionsFinal.x / this.dimensionsDepart.x : this.dimensionsFinal.x / this.dimensionsDepart.x,
            y: this.flipY ? -this.dimensionsFinal.y / this.dimensionsDepart.y : this.dimensionsFinal.y / this.dimensionsDepart.y,
        };
        const hidden = document.createElement('canvas') as HTMLCanvasElement;
        const hiddenCtx = hidden.getContext('2d') as CanvasRenderingContext2D;
        const hidden2 = document.createElement('canvas') as HTMLCanvasElement;
        const hiddenCtx2 = hidden2.getContext('2d') as CanvasRenderingContext2D;
        hidden.setAttribute('width', this.dimensionsDepart.x.toString());
        hidden.setAttribute('height', this.dimensionsDepart.y.toString());
        hidden2.setAttribute('width', this.dimensionsFinal.x.toString());
        hidden2.setAttribute('height', this.dimensionsFinal.y.toString());

        hiddenCtx.putImageData(imageData, 0, 0);

        hiddenCtx2.translate(this.flipX ? this.dimensionsFinal.x : 0, this.flipY ? this.dimensionsFinal.y : 0);
        hiddenCtx2.scale(scale.x, scale.y);
        hiddenCtx2.drawImage(hidden, 0, 0);
        hiddenCtx2.scale(1 / scale.x, 1 / scale.y);
        hiddenCtx2.translate(this.flipX ? -this.dimensionsFinal.x : 0, this.flipY ? -this.dimensionsFinal.y : 0);

        const imageData2 = hiddenCtx2.getImageData(0, 0, this.dimensionsFinal.x, this.dimensionsFinal.y);

        this.drawingService.baseCtx.fillStyle = '#ffffff';
        this.drawingService.baseCtx.fillRect(this.positionDepart.x, this.positionDepart.y, this.dimensionsDepart.x, this.dimensionsDepart.y);
        this.drawingService.baseCtx.putImageData(imageData2, this.positionFinal.x, this.positionFinal.y);
        hidden.remove();
        hidden2.remove();
    }
}

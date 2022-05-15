import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';
import { SelectionEllipseService } from '@app/services/tools/selection/selection-ellipse.service';

export class ActionSelectionEllipse extends Action {
    positionDepart: Vec2;
    positionFinal: Vec2;
    dimensionsDepart: Vec2;
    dimensionsFinal: Vec2;
    flipX: boolean;
    flipY: boolean;
    selectionEllipseService: SelectionEllipseService;
    constructor(
        drawingService: DrawingService,
        selectionEllipseService: SelectionEllipseService,
        positionDepart: Vec2,
        positionFinal: Vec2,
        dimensionsDepart: Vec2,
        dimensionsFinal: Vec2,
        flipX: boolean,
        flipY: boolean,
    ) {
        super(drawingService);
        this.selectionEllipseService = selectionEllipseService;
        this.positionDepart = positionDepart;
        this.positionFinal = positionFinal;
        this.dimensionsDepart = dimensionsDepart;
        this.dimensionsFinal = dimensionsFinal;
        this.flipX = flipX;
        this.flipY = flipY;
    }

    draw(): void {
        let imageData = this.drawingService.baseCtx.getImageData(
            this.positionDepart.x,
            this.positionDepart.y,
            this.dimensionsDepart.x,
            this.dimensionsDepart.y,
        );
        const scale = {
            x: this.flipX ? -this.dimensionsFinal.x / this.dimensionsDepart.x : this.dimensionsFinal.x / this.dimensionsDepart.x,
            y: this.flipY ? -this.dimensionsFinal.y / this.dimensionsDepart.y : this.dimensionsFinal.y / this.dimensionsDepart.y,
        };
        imageData = this.selectionEllipseService.makeInvisible(imageData, this.dimensionsDepart);

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

        this.drawingService.baseCtx.fillStyle = '#ffffff';
        this.drawingService.baseCtx.beginPath();
        this.drawingService.baseCtx.ellipse(
            this.positionDepart.x + this.dimensionsDepart.x / 2,
            this.positionDepart.y + this.dimensionsDepart.y / 2,
            this.dimensionsDepart.x / 2,
            this.dimensionsDepart.y / 2,
            0,
            0,
            2 * Math.PI,
        );
        this.drawingService.baseCtx.fill();
        this.drawingService.baseCtx.drawImage(hidden2, this.positionFinal.x, this.positionFinal.y);
        hidden.remove();
        hidden2.remove();
    }
}

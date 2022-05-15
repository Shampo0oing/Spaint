import { Trace } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Tool {
    mouseDownCoord: Vec2;
    shift: boolean = false;
    mouseClick: boolean = false;
    mouseDoubleClick: boolean = false;

    constructor(protected drawingService: DrawingService, protected annulerRefaireService: AnnulerRefaireService) {}

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onDoubleClick(): void {}

    onClick(event: MouseEvent): void {}

    onClickRight(event: MouseEvent): void {}

    shiftDown(): void {}

    shiftUp(): void {}

    escapeDown(): void {}

    backspaceDown(): void {}

    deleteDown(): void {}

    enterDown(): void {}

    drawingSetup(ctx: CanvasRenderingContext2D): void {}

    clickedElseWhere(): void {}

    onKeyDown(event: KeyboardEvent): void {}

    onKeyUp(event: KeyboardEvent): void {}

    onScrollDown(): void {}

    onScrollUp(): void {}

    abstract getCurrentToolString(): string;

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return {
            x: event.pageX - this.drawingService.canvas.getBoundingClientRect().left - window.scrollX,
            y: event.pageY - this.drawingService.canvas.getBoundingClientRect().top - window.scrollY,
        };
    }

    traceType(ctx: CanvasRenderingContext2D, traceType: number): void {
        switch (traceType) {
            case Trace.Contour: {
                ctx.stroke();
                break;
            }
            case Trace.Plein: {
                ctx.fillStyle = this.drawingService.primaryColor;
                ctx.fill();
                break;
            }
            case Trace.Plein_Coutour: {
                ctx.fillStyle = this.drawingService.primaryColor;
                ctx.fill();
                ctx.strokeStyle = this.drawingService.secondaryColor;
                ctx.stroke();
                break;
            }
        }
    }
}

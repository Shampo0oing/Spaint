import { Injectable } from '@angular/core';
import { Action } from '@app/classes/Actions/action';
import { ActionStub } from '@app/classes/Actions/action-stub';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizerService } from '@app/services/resizer/resizer.service';

enum proprietyPosition {
    PRIMARY_COLOR = 0,
    SECONDARY_COLOR,
    NUMBER_OF_EDGES,
    ELLIPSE_TRACE_TYPE,
    RECTANGLE_TRACE_TYPE,
    POLYGON_TRACE_TYPE,
    ERASER_WIDTH,
    IMAGE_SRC,
    POLYGON_WIDTH,
}

@Injectable({
    providedIn: 'root',
})
export class AnnulerRefaireService {
    constructor(protected drawingService: DrawingService, private resizerService: ResizerService) {}
    // tableau contenant les parametres du drawingService qui seront modifier lors d'un draw d'une action
    savedParameters: (string | number)[] = [];
    undoActions: Action[] = new Array<Action>();
    redoActions: Action[] = new Array<Action>();
    initialDimensions: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private imageData: ImageData = new ImageData(DEFAULT_WIDTH, DEFAULT_HEIGHT);

    private isActionStub(action: Action): boolean {
        return action instanceof ActionStub;
    }

    addUndoAction(action: Action): void {
        if (this.undoActions.length !== 0) {
            const lastAction = this.undoActions.pop() as Action;
            if (!this.isActionStub(lastAction)) {
                this.undoActions.push(lastAction);
            }
        }
        this.redoActions = [];
        this.undoActions.push(action);
        this.drawingService.autoSave();
    }

    undo(): void {
        if (this.undoActions.length === 0 || this.drawingService.mouseDown) return;
        this.drawingService.selected = false;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const ctx = this.drawingService.baseCtx;
        ctx.fillStyle = '#ffffff';
        this.resizerService.resizeImage(this.initialDimensions);
        ctx.fillRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        ctx.putImageData(this.imageData, 0, 0);
        const lastAction = this.undoActions.pop() as Action;
        if (!this.isActionStub(lastAction)) {
            this.redoActions.push(lastAction);
        } else {
            this.drawingService.selected = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const ctx2 = this.drawingService.baseCtx;
            ctx2.fillStyle = '#ffffff';
            this.resizerService.resizeImage(this.initialDimensions);
            ctx2.fillRect(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
            ctx2.putImageData(this.imageData, 0, 0);
            this.saveParameter();
            this.undoActions.forEach((element) => element.draw());
            this.restoreParameter();
            this.drawingService.autoSave();
        }
        this.saveParameter();
        this.undoActions.forEach((element) => element.draw());
        this.restoreParameter();
    }

    redo(): void {
        if (this.redoActions.length > 0 && !this.drawingService.mouseDown) {
            const lastAction = this.redoActions.pop() as Action;
            this.saveParameter();
            this.undoActions.push(lastAction);
            lastAction.draw();
            this.restoreParameter();
            this.drawingService.autoSave();
        }
    }

    saveParameter(): void {
        this.savedParameters[proprietyPosition.PRIMARY_COLOR] = this.drawingService.primaryColor;
        this.savedParameters[proprietyPosition.SECONDARY_COLOR] = this.drawingService.secondaryColor;
        this.savedParameters[proprietyPosition.NUMBER_OF_EDGES] = this.drawingService.numberOfEdges;
        this.savedParameters[proprietyPosition.ELLIPSE_TRACE_TYPE] = this.drawingService.traceTypeEllipse;
        this.savedParameters[proprietyPosition.RECTANGLE_TRACE_TYPE] = this.drawingService.traceTypeRectangle;
        this.savedParameters[proprietyPosition.POLYGON_TRACE_TYPE] = this.drawingService.traceTypePolygon;
        this.savedParameters[proprietyPosition.ERASER_WIDTH] = this.drawingService.eraserWidth;
        this.savedParameters[proprietyPosition.IMAGE_SRC] = this.drawingService.image.src;
        this.savedParameters[proprietyPosition.POLYGON_WIDTH] = this.drawingService.polygonWidth;
    }

    restoreParameter(): void {
        this.drawingService.primaryColor = this.savedParameters[proprietyPosition.PRIMARY_COLOR] as string;
        this.drawingService.secondaryColor = this.savedParameters[proprietyPosition.SECONDARY_COLOR] as string;
        this.drawingService.numberOfEdges = this.savedParameters[proprietyPosition.NUMBER_OF_EDGES] as number;
        this.drawingService.traceTypeEllipse = this.savedParameters[proprietyPosition.ELLIPSE_TRACE_TYPE] as number;
        this.drawingService.traceTypeRectangle = this.savedParameters[proprietyPosition.RECTANGLE_TRACE_TYPE] as number;
        this.drawingService.traceTypePolygon = this.savedParameters[proprietyPosition.POLYGON_TRACE_TYPE] as number;
        this.drawingService.eraserWidth = this.savedParameters[proprietyPosition.ERASER_WIDTH] as number;
        const image = new Image();
        image.src = this.savedParameters[proprietyPosition.IMAGE_SRC] as string;
        this.drawingService.image = image;
        this.drawingService.polygonWidth = this.savedParameters[proprietyPosition.POLYGON_WIDTH] as number;
    }

    removeActionsStubs(): void {
        if (this.isActionStub(this.undoActions[this.undoActions.length - 1])) this.undoActions.pop();
    }

    emptyBothActionArray(): void {
        this.redoActions = [];
        this.undoActions = [];
    }

    updateImageData(): void {
        this.imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        this.initialDimensions = { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height };
        this.emptyBothActionArray();
    }
}

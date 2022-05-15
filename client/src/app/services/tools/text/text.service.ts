import { Injectable } from '@angular/core';
import { ActionText } from '@app/classes/Actions/action-text';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

const DEFAULT_BOX_WIDTH = 100;

@Injectable({
    providedIn: 'root',
})
export class TextService extends Tool {
    textInitialCoord: Vec2 = { x: 0, y: 0 };
    textCoord: Vec2 = { x: 0, y: 0 };
    textDimension: Vec2 = { x: 0, y: 0 };
    textString: string = '';
    textContainer: string[] = [];
    writing: boolean = false;
    policeSize: number = 0;
    index: Vec2 = { x: 0, y: 0 };
    textSize: number = 0;
    maxWidthBox: number = 0;
    verticalArrow: boolean = false;
    indicatorX: number = 0;

    constructor(protected drawingService: DrawingService, protected annulerRefaireService: AnnulerRefaireService) {
        super(drawingService, annulerRefaireService);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.textString = '';
        if (this.writing && this.clickOutsideBox()) {
            this.clickedElseWhere();
        } else if (!this.writing) {
            this.textInitialCoord = { x: this.mouseDownCoord.x, y: this.mouseDownCoord.y };
            this.textCoord = { x: this.mouseDownCoord.x, y: this.mouseDownCoord.y };
            this.writing = true;
            this.textSetup(this.drawingService.previewCtx);
            this.textContainer = [];
            this.textString = '';
            this.maxWidthBox = DEFAULT_BOX_WIDTH;
            this.textContainer.push(this.textString);
            this.putTextIndicator();
            this.textDimension = { x: DEFAULT_BOX_WIDTH, y: this.policeSize };
            this.index = { x: 0, y: 0 };
            this.onMouseMove(event);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.mouseDown = !(this.getPositionFromMouse(event).x < 0 || !this.writing);
    }

    clickedElseWhere(): void {
        if (!this.writing) return;
        this.annulerRefaireService.addUndoAction(
            new ActionText(
                this.drawingService,
                { x: this.textInitialCoord.x, y: this.textInitialCoord.y },
                this.textContainer,
                this.drawingService.policeSize,
                this.drawingService.primaryColor,
                this.drawingService.textAlign,
                this.drawingService.font,
                this.drawingService.fontStyle,
                this,
            ),
        );
        this.writing = false;
        this.writeAllText(this.drawingService.baseCtx);
        this.maxWidthBox = DEFAULT_BOX_WIDTH;
        this.textContainer = [];
        this.textString = '';
        this.index = { x: 0, y: 0 };
        this.drawingService.mouseDown = false;
    }

    clickOutsideBox(): boolean {
        return (
            this.mouseDownCoord.x < this.textInitialCoord.x ||
            this.mouseDownCoord.x > this.textInitialCoord.x + this.textDimension.x ||
            this.mouseDownCoord.y < this.textInitialCoord.y ||
            this.mouseDownCoord.y > this.textInitialCoord.y + this.textDimension.y
        );
    }

    enterDown(): void {
        this.textContainer[this.index.y] = this.textContainer[this.index.y].substring(0, this.index.x);
        this.textString = this.textString.substring(this.index.x);
        this.textCoord.y += this.policeSize;
        this.textDimension.y += this.policeSize;
        this.index.x = 0;
        this.index.y++;
        this.textContainer.splice(this.index.y, 0, this.textString);
        this.textSize = 0;
        this.writeAllText(this.drawingService.previewCtx);
        this.putTextIndicator();
    }

    backspaceDown(): void {
        if (this.index.x > 0) {
            this.index.x--;
            this.textString = this.textString.substring(0, this.index.x) + this.textString.substring(this.index.x + 1);
            this.textContainer[this.index.y] = this.textString;
            this.writeText(this.drawingService.previewCtx);
        } else if (this.index.y > 0) {
            this.drawingService.previewCtx.clearRect(0, this.textCoord.y, this.drawingService.canvas.width, this.policeSize);
            this.textContainer.splice(this.index.y, 1);
            this.index.y--;
            this.textString = this.textContainer[this.index.y] + this.textString.substring(this.index.x);
            this.index.x = this.textContainer[this.index.y].length;
            this.textContainer[this.index.y] = this.textString;
            this.textCoord.y -= this.policeSize;
            this.textDimension.y -= this.policeSize;
            this.writeAllText(this.drawingService.previewCtx);
            this.putTextIndicator();
        }
    }

    deleteDown(): void {
        this.textString = this.textString.substring(0, this.index.x) + this.textString.substring(this.index.x + 1);
        this.textContainer[this.index.y] = this.textString;
        this.writeText(this.drawingService.previewCtx);
    }

    escapeDown(): void {
        this.maxWidthBox = DEFAULT_BOX_WIDTH;
        this.writing = false;
        this.textContainer = [];
        this.textString = '';
        this.index = { x: 0, y: 0 };
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.mouseDown = false;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft') {
            if (this.index.x !== 0) {
                this.index.x--;
            }
            this.writeText(this.drawingService.previewCtx);
        } else if (event.key === 'ArrowRight') {
            if (this.index.x < this.textContainer[this.index.y].length) {
                this.index.x++;
            }
            this.writeText(this.drawingService.previewCtx);
        } else if (event.key === 'ArrowUp') {
            if (this.index.y > 0) {
                this.index.y--;
                if (this.index.x > this.textContainer[this.index.y].length) {
                    this.index.x = this.textContainer[this.index.y].length;
                }
                this.verticalArrow = true;
                this.writeText(this.drawingService.previewCtx);
                this.textCoord.y -= this.policeSize;
                this.textString = this.textContainer[this.index.y];
                this.writeText(this.drawingService.previewCtx);
                this.putTextIndicator();
            }
        } else if (event.key === 'ArrowDown') {
            if (this.index.y < this.textContainer.length - 1) {
                this.index.y++;
                if (this.index.x > this.textContainer[this.index.y].length) {
                    this.index.x = this.textContainer[this.index.y].length;
                }
                this.verticalArrow = true;
                this.writeText(this.drawingService.previewCtx);
                this.textCoord.y += this.policeSize;
                this.textString = this.textContainer[this.index.y];
                this.writeText(this.drawingService.previewCtx);
                this.putTextIndicator();
            }
        } else if (
            this.writing &&
            event.key.length === 1 &&
            this.textInitialCoord.x + this.textSize < this.drawingService.canvas.width &&
            this.textInitialCoord.y + this.textDimension.y < this.drawingService.canvas.height
        ) {
            this.textString = this.textString.substring(0, this.index.x) + event.key + this.textString.substring(this.index.x);
            this.textContainer.splice(this.index.y, 1, this.textString);
            this.index.x++;
            this.writeAllText(this.drawingService.previewCtx);
            this.putTextIndicator();
        }
        this.verticalArrow = false;
    }

    putTextIndicator(): void {
        this.drawingService.previewCtx.beginPath();
        if (this.textSize >= this.textDimension.x || this.drawingService.textAlign === 'left') {
            this.drawingService.previewCtx.moveTo(
                this.textInitialCoord.x +
                    this.drawingService.previewCtx.measureText(this.textContainer[this.index.y].substring(0, this.index.x)).width,
                this.textCoord.y,
            );
            this.drawingService.previewCtx.lineTo(
                this.textInitialCoord.x +
                    this.drawingService.previewCtx.measureText(this.textContainer[this.index.y].substring(0, this.index.x)).width,
                this.textCoord.y + this.policeSize,
            );
        } else if (this.drawingService.textAlign === 'center') {
            this.drawingService.previewCtx.moveTo(
                this.textInitialCoord.x +
                    this.textDimension.x / 2 -
                    this.drawingService.previewCtx.measureText(this.textContainer[this.index.y]).width / 2 +
                    this.drawingService.previewCtx.measureText(this.textContainer[this.index.y].substring(0, this.index.x)).width,
                this.textCoord.y,
            );
            this.drawingService.previewCtx.lineTo(
                this.textInitialCoord.x +
                    this.textDimension.x / 2 -
                    this.drawingService.previewCtx.measureText(this.textContainer[this.index.y]).width / 2 +
                    this.drawingService.previewCtx.measureText(this.textContainer[this.index.y].substring(0, this.index.x)).width,
                this.textCoord.y + this.policeSize,
            );
        } else if (this.drawingService.textAlign === 'right') {
            this.drawingService.previewCtx.moveTo(
                this.textInitialCoord.x +
                    this.textDimension.x -
                    this.drawingService.previewCtx.measureText(this.textContainer[this.index.y]).width +
                    this.drawingService.previewCtx.measureText(this.textContainer[this.index.y].substring(0, this.index.x)).width,
                this.textCoord.y,
            );
            this.drawingService.previewCtx.lineTo(
                this.textInitialCoord.x +
                    this.textDimension.x -
                    this.drawingService.previewCtx.measureText(this.textContainer[this.index.y]).width +
                    this.drawingService.previewCtx.measureText(this.textContainer[this.index.y].substring(0, this.index.x)).width,
                this.textCoord.y + this.policeSize,
            );
        }
        this.drawingService.previewCtx.stroke();
    }

    writeAllText(ctx: CanvasRenderingContext2D): void {
        this.textCoord.y = this.textInitialCoord.y;
        this.resizeBox(ctx);
        this.textSetup(ctx);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        for (const lineText of this.textContainer) {
            ctx.fillText(lineText, this.textCoord.x, this.textCoord.y);
            this.textCoord.y += this.policeSize;
            if (ctx.measureText(lineText).width > this.maxWidthBox) this.maxWidthBox = ctx.measureText(lineText).width;
        }
        this.textCoord.y = this.textInitialCoord.y + this.policeSize * this.index.y;
        if (this.textDimension.y < this.textContainer.length * this.policeSize) this.textDimension.y = this.textContainer.length * this.policeSize;
    }

    writeText(ctx: CanvasRenderingContext2D): void {
        this.resizeBox(ctx);
        this.textSetup(ctx);
        this.drawingService.previewCtx.clearRect(0, this.textCoord.y, this.drawingService.canvas.width, this.policeSize);
        if (!this.verticalArrow) {
            this.putTextIndicator();
        }
        ctx.fillText(this.textString, this.textCoord.x, this.textCoord.y);
    }

    resizeBox(ctx: CanvasRenderingContext2D): void {
        if (ctx.measureText(this.textString).width > this.maxWidthBox) this.maxWidthBox = ctx.measureText(this.textString).width;
        if (this.maxWidthBox > this.textDimension.x) this.textDimension.x = this.maxWidthBox;
    }

    textSetup(ctx: CanvasRenderingContext2D): void {
        ctx.lineWidth = 2;
        ctx.fillStyle = this.drawingService.primaryColor;
        ctx.textBaseline = 'top';
        ctx.textAlign = this.drawingService.textAlign;
        this.textSize = ctx.measureText(this.textString.substring(0, this.index.x)).width;
        switch (this.drawingService.textAlign) {
            case 'left':
                this.textCoord.x = this.textInitialCoord.x;
                break;
            case 'center':
                this.textCoord.x = this.textInitialCoord.x + this.textDimension.x / 2;
                break;
            case 'right':
                this.textCoord.x = this.textInitialCoord.x + this.textDimension.x;
                break;
        }
        this.policeSize = this.drawingService.policeSize;
        ctx.font = this.drawingService.fontStyle + ' ' + this.policeSize + 'px ' + this.drawingService.font;
        ctx.fillStyle = this.drawingService.primaryColor;
    }

    getCurrentToolString(): string {
        return 'text';
    }
}

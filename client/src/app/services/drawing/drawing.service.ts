import { Injectable } from '@angular/core';
import { BLUE, GREEN, OPACITY, PIXEL_SIZE, RED, SelectPos, WHITE } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';

export const DEFAULT_ELLIPSE_WIDTH = 2;
export const DEFAULT_RECTANGLE_WIDTH = 2;
export const DEFAULT_POLYGON_WIDTH = 2;
export const DEFAULT_POLYGON_EDGE = 3;
export const DEFAULT_ERASER_WIDTH = 5;
export const DEFAULT_LINE_WIDTH = 10;
export const DEFAULT_PENCIL_WIDTH = 10;
export const DEFAULT_POINT_WIDTH = 15;
export const DEFAULT_EMISSION = 500;
export const DEFAULT_DROPLET_DIAMETER = 1;
export const DEFAULT_SPRAY_DIAMETER = 50;
export const DEFAULT_SQUARE_SIZE = 30;
export const DEFAULT_OPACITY = 100;
export const POURCENTAGE = 100;
export const DEFAULT_STAMP_ANGLE = 0;
export const DEFAULT_STAMP_SCALE = 100;
export const DEFAULT_POLICE_SIZE = 25;
export const DEFAULT_TOL = 50;

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    gridCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    mouseDown: boolean = false;
    selected: boolean = false;
    primaryColor: string = 'rgba(0, 0, 0, 1)';
    secondaryColor: string = 'rgba(255, 255, 255, 1)';
    traceTypeEllipse: number = 0;
    traceTypeRectangle: number = 0;
    traceTypePolygon: number = 0;
    junctionType: number = 0;
    pointWidth: number = DEFAULT_POINT_WIDTH;
    lineWidth: number = DEFAULT_LINE_WIDTH;
    pencilWidth: number = DEFAULT_PENCIL_WIDTH;
    rectangleWidth: number = DEFAULT_RECTANGLE_WIDTH;
    ellipseWidth: number = DEFAULT_ELLIPSE_WIDTH;
    eraserWidth: number = DEFAULT_ERASER_WIDTH;
    policeSize: number = DEFAULT_POLICE_SIZE;
    polygonWidth: number = DEFAULT_POLYGON_WIDTH;
    numberOfEdges: number = DEFAULT_POLYGON_EDGE;
    stampScale: number = DEFAULT_STAMP_SCALE;
    stampAngle: number = DEFAULT_STAMP_ANGLE;
    emission: number = DEFAULT_EMISSION;
    dropletDiameter: number = DEFAULT_DROPLET_DIAMETER;
    sprayDiameter: number = DEFAULT_SPRAY_DIAMETER;
    dialogOpen: boolean = false;
    squareSize: number = DEFAULT_SQUARE_SIZE;
    opacity: number = DEFAULT_OPACITY;
    showGrid: boolean = false;
    useMagnetism: boolean = false;
    tolEcart: number = DEFAULT_TOL;
    lastScrollTop: number = 0;
    localStorage: Storage = window.localStorage;
    font: string = 'Arial';
    fontStyle: string = '';
    textAlign: CanvasTextAlign = 'left';
    image: HTMLImageElement = new Image();

    drawGrid(): void {
        this.gridCtx.strokeStyle = '#000000';
        this.gridCtx.globalAlpha = this.opacity / POURCENTAGE;
        this.gridCtx.lineWidth = 1;

        this.gridCtx.beginPath();
        for (let x = this.squareSize; x < this.canvas.width; x += this.squareSize) {
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, this.canvas.height);
        }
        for (let y = this.squareSize; y < this.canvas.height; y += this.squareSize) {
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(this.canvas.width, y);
        }

        this.gridCtx.stroke();
        this.gridCtx.globalAlpha = 1;
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.showGrid && context === this.gridCtx) this.drawGrid();
    }

    swapColors(): void {
        const tmp = this.primaryColor;
        this.primaryColor = this.secondaryColor;
        this.secondaryColor = tmp;
    }

    drawImageDataOnBaseCtx(position: Vec2, dimension: Vec2, selectionImageData: ImageData): void {
        this.selected = false;
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = dimension.x;
        canvasTemp.height = dimension.y;
        const ctx = canvasTemp.getContext('2d') as CanvasRenderingContext2D;
        this.clearCanvas(this.previewCtx);
        this.previewCtx.putImageData(selectionImageData, position.x, position.y);
        ctx.putImageData(this.previewCtx.getImageData(position.x, position.y, dimension.x, dimension.y), 0, 0);
        this.baseCtx.drawImage(canvasTemp, position.x, position.y);
        this.clearCanvas(this.previewCtx);
        canvasTemp.remove();
    }

    makeInvisible(imageDataSelection: ImageData, imagePosition: Vec2, imageDimension: Vec2, pathData: Vec2[]): ImageData {
        this.clearCanvas(this.previewCtx);
        this.previewCtx.fillStyle = this.previewCtx.strokeStyle = '#000000';
        this.previewCtx.beginPath();
        this.previewCtx.moveTo(pathData[0].x + imagePosition.x, pathData[0].y + imagePosition.y);
        for (let i = 1; i < pathData.length; i++) this.previewCtx.lineTo(pathData[i].x + imagePosition.x, pathData[i].y + imagePosition.y);
        this.previewCtx.closePath();
        this.previewCtx.fill();
        const mask = this.previewCtx.getImageData(imagePosition.x, imagePosition.y, imageDimension.x, imageDimension.y);
        for (let j = 0; j < mask.data.length; j += PIXEL_SIZE) {
            if (mask.data[j + RED] === 0 && mask.data[j + GREEN] === 0 && mask.data[j + BLUE] === 0 && mask.data[j + OPACITY] === WHITE) {
                mask.data[j + RED] = imageDataSelection.data[j + RED];
                mask.data[j + GREEN] = imageDataSelection.data[j + GREEN];
                mask.data[j + BLUE] = imageDataSelection.data[j + BLUE];
                mask.data[j + OPACITY] = imageDataSelection.data[j + OPACITY];
                imageDataSelection.data[j + RED] = imageDataSelection.data[j + GREEN] = imageDataSelection.data[j + BLUE] = imageDataSelection.data[
                    j + OPACITY
                ] = WHITE;
            } else mask.data[j + RED] = mask.data[j + GREEN] = mask.data[j + BLUE] = mask.data[j + OPACITY] = 0;
        }
        this.baseCtx.putImageData(imageDataSelection, imagePosition.x, imagePosition.y);
        this.clearCanvas(this.previewCtx);
        return mask;
    }

    changePositionAndDimensions(imageDataPosition: Vec2, imageDataDimension: Vec2, lastMousePos: Vec2, status: number): Vec2 {
        const dx = lastMousePos.x - imageDataPosition.x;
        const dy = lastMousePos.y - imageDataPosition.y;
        let translatePos: Vec2 = { x: 0, y: 0 };
        switch (status) {
            case SelectPos.UPPERLEFT:
                imageDataPosition.y += dy;
                imageDataDimension.y -= dy;
                imageDataPosition.x += dx;
                imageDataDimension.x -= dx;
                translatePos = {
                    x: imageDataPosition.x + imageDataDimension.x,
                    y: imageDataPosition.y + imageDataDimension.y,
                };
                break;
            case SelectPos.UPPERMIDDLE:
                imageDataPosition.y += dy;
                imageDataDimension.y -= dy;
                translatePos = {
                    x: imageDataPosition.x + imageDataDimension.x / 2,
                    y: imageDataPosition.y + imageDataDimension.y,
                };
                break;
            case SelectPos.UPPERRIGHT:
                imageDataPosition.y += dy;
                imageDataDimension.y -= dy;
                imageDataDimension.x = dx;
                translatePos = {
                    x: imageDataPosition.x,
                    y: imageDataPosition.y + imageDataDimension.y,
                };
                break;
            case SelectPos.MIDDLELEFT:
                imageDataPosition.x += dx;
                imageDataDimension.x -= dx;
                translatePos = {
                    x: imageDataPosition.x + imageDataDimension.x,
                    y: imageDataPosition.y + imageDataDimension.y / 2,
                };
                break;
            case SelectPos.MIDDLERIGHT:
                imageDataDimension.x = dx;
                translatePos = {
                    x: imageDataPosition.x,
                    y: imageDataPosition.y + imageDataDimension.y / 2,
                };
                break;
            case SelectPos.BOTTOMLEFT:
                imageDataPosition.x += dx;
                imageDataDimension.x -= dx;
                imageDataDimension.y = dy;
                translatePos = {
                    x: imageDataPosition.x + imageDataDimension.x,
                    y: imageDataPosition.y,
                };
                break;
            case SelectPos.BOTTOMMIDDLE:
                imageDataDimension.y = dy;
                translatePos = {
                    x: imageDataPosition.x + imageDataDimension.x / 2,
                    y: imageDataPosition.y,
                };
                break;
            case SelectPos.BOTTOMRIGHT:
                imageDataDimension.x = dx;
                imageDataDimension.y = dy;
                translatePos = {
                    x: imageDataPosition.x,
                    y: imageDataPosition.y,
                };
                break;
        }
        return translatePos;
    }

    autoSave(): void {
        this.localStorage.setItem('savedCanvas', this.canvas.toDataURL('image/jpeg'));
    }

    getSavedCanvas(): string | null {
        return this.localStorage.getItem('savedCanvas');
    }

    removeSavedCanvas(): void {
        this.localStorage.removeItem('savedCanvas');
    }
}

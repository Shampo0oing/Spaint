import { Injectable } from '@angular/core';
import { DrawingService } from '@app/classes/Actions/action';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, DragPos, MAX_HEIGHT, MAX_WIDTH, MIN_HEIGHT, MIN_WIDTH } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class ResizerService {
    width: number;
    height: number;
    offset: Vec2;
    constructor(private drawingService: DrawingService) {
        this.width = DEFAULT_WIDTH;
        this.height = DEFAULT_HEIGHT;
    }

    verificationMinimum(): void {
        this.width = this.width < MIN_WIDTH ? MIN_WIDTH : this.width;
        this.width = this.width > MAX_WIDTH ? MAX_WIDTH : this.width;
        this.height = this.height < MIN_HEIGHT ? MIN_HEIGHT : this.height;
        this.height = this.height > MAX_HEIGHT ? MAX_HEIGHT : this.height;
    }

    resize(status: DragPos, mouse: Vec2): void {
        switch (status) {
            case DragPos.CORNER: {
                this.width = mouse.x - this.offset.x;
                this.height = mouse.y - this.offset.y;
                break;
            }
            case DragPos.BOTTOM: {
                this.height = mouse.y - this.offset.y;
                break;
            }
            case DragPos.RIGHT: {
                this.width = mouse.x - this.offset.x;
                break;
            }
        }
        this.verificationMinimum();
    }

    resizeImage(size?: Vec2): void {
        if (size) {
            this.width = size.x;
            this.height = size.y;
            this.verificationMinimum();
        }
        const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
        const oldWidth = parseInt(canvas.getAttribute('width') as string, 10);
        const oldHeight = parseInt(canvas.getAttribute('height') as string, 10);
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const imageData = ctx.getImageData(0, 0, oldWidth, oldHeight) as ImageData;
        canvas.setAttribute('width', this.width.toString());
        canvas.setAttribute('height', this.height.toString());
        const previewCanvas = document.getElementById('previewLayer') as HTMLCanvasElement;
        const gridCanvas = document.getElementById('gridLayer') as HTMLCanvasElement;
        previewCanvas.setAttribute('width', this.width.toString());
        previewCanvas.setAttribute('height', this.height.toString());
        gridCanvas.setAttribute('width', this.width.toString());
        gridCanvas.setAttribute('height', this.height.toString());
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.putImageData(imageData, 0, 0);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.clearCanvas(this.drawingService.gridCtx);
    }
}

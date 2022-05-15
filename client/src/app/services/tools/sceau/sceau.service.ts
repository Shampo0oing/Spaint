import { Injectable } from '@angular/core';
import { ActionSceauContigus } from '@app/classes/Actions/action-sceau-contigus';
import { ActionSceauNonContigus } from '@app/classes/Actions/action-sceau-non-contigus';
import { BLUE, GREEN, OPACITY, PERCENTAGE, PIXEL_SIZE, RED, WHITE } from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class SceauService extends Tool {
    currentColor: number[];
    newColor: number[];

    constructor(protected drawingService: DrawingService, protected annulerRefaireService: AnnulerRefaireService) {
        super(drawingService, annulerRefaireService);
    }

    onClick(event: MouseEvent): void {
        const mouseDownCoords = this.getPositionFromMouse(event);
        this.currentColor = this.getCurrentPixelColor(mouseDownCoords);
        this.newColor = this.getRGBArray(this.drawingService.primaryColor);
        const imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        const data = imageData.data;

        this.fillPixelsContigus(data, mouseDownCoords, this.currentColor, this.newColor, this.drawingService.tolEcart);
        this.drawingService.baseCtx.putImageData(imageData, 0, 0);
        this.annulerRefaireService.addUndoAction(
            new ActionSceauContigus(this.drawingService, mouseDownCoords, this.currentColor, this.newColor, this),
        );
    }

    onClickRight(event: MouseEvent): void {
        this.currentColor = this.getCurrentPixelColor(this.getPositionFromMouse(event));
        this.newColor = this.getRGBArray(this.drawingService.primaryColor);
        const imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        const data = imageData.data;

        this.fillPixelsNContigus(data, this.currentColor, this.newColor, this.drawingService.tolEcart);
        this.drawingService.baseCtx.putImageData(imageData, 0, 0);
        this.annulerRefaireService.addUndoAction(new ActionSceauNonContigus(this.drawingService, this.currentColor, this.newColor, this));
    }

    fillPixelsContigus(imagePixels: Uint8ClampedArray, position: Vec2, currentColor: number[], newColor: number[], tolEcart: number): void {
        // References https://github.com/williammalone/HTML5-Paint-Bucket-Tool
        const pixelStack = [{ x: position.x, y: position.y } as Vec2];
        while (pixelStack.length) {
            const newPos = pixelStack.pop() as Vec2;
            const currentX = Math.floor(newPos.x);
            let currentY = Math.floor(newPos.y);

            // On se place au point et on monte au maximum
            let pixelPos = (currentY * this.drawingService.canvas.width + currentX) * PIXEL_SIZE;
            while (currentY-- >= 0 && this.checkValidity(imagePixels, pixelPos, currentColor, tolEcart))
                pixelPos -= this.drawingService.canvas.width * PIXEL_SIZE;

            // On descend pour commencer le coloriage
            pixelPos += this.drawingService.canvas.width * PIXEL_SIZE;
            ++currentY;

            // On regarde à gauche et à droite du pixel actuel
            let reachLeft = false;
            let reachRight = false;

            while (currentY++ < this.drawingService.canvas.height - 1 && this.checkValidity(imagePixels, pixelPos, currentColor, tolEcart)) {
                this.setPixels(imagePixels, pixelPos, newColor);

                if (currentX > 0)
                    if (this.checkValidity(imagePixels, pixelPos - PIXEL_SIZE, currentColor, tolEcart)) {
                        if (!reachLeft) {
                            pixelStack.push({ x: currentX - 1, y: currentY });
                            reachLeft = true;
                        }
                    } else if (reachLeft) reachLeft = false;

                if (currentX < this.drawingService.canvas.width - 1)
                    if (this.checkValidity(imagePixels, pixelPos + PIXEL_SIZE, currentColor, tolEcart)) {
                        if (!reachRight) {
                            pixelStack.push({ x: currentX + 1, y: currentY });
                            reachRight = true;
                        }
                    } else if (reachRight) reachRight = false;

                pixelPos += this.drawingService.canvas.width * PIXEL_SIZE;
            }
        }
    }

    fillPixelsNContigus(imagePixels: Uint8ClampedArray, currentColor: number[], newColor: number[], tolEcart: number): void {
        for (let i = 0; i < imagePixels.length; i += PIXEL_SIZE)
            if (this.checkValidity(imagePixels, i, currentColor, tolEcart)) this.setPixels(imagePixels, i, newColor);
    }

    getCurrentPixelColor(mousePosition: Vec2): number[] {
        const pixelData = this.drawingService.baseCtx.getImageData(mousePosition.x, mousePosition.y, 1, 1).data;
        return [pixelData[0], pixelData[1], pixelData[2], 1];
    }

    getRGBArray(color: string): number[] {
        const match = (color.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d*)?)\))?/) as unknown) as string;
        return [parseFloat(match[RED + 1]), parseFloat(match[GREEN + 1]), parseFloat(match[BLUE + 1]), parseFloat(match[OPACITY + 1])];
    }

    checkValidity(imagePixels: Uint8ClampedArray, index: number, currentColor: number[], tolEcart: number): boolean {
        if (this.sameColor(imagePixels, index, this.newColor)) return false;
        if (
            this.compareValue(imagePixels[index + RED], currentColor[RED], tolEcart) &&
            this.compareValue(imagePixels[index + GREEN], currentColor[GREEN], tolEcart) &&
            this.compareValue(imagePixels[index + BLUE], currentColor[BLUE], tolEcart) &&
            this.compareValue(imagePixels[index + OPACITY], currentColor[OPACITY] * WHITE, tolEcart)
        )
            return true;
        return false;
    }

    sameColor(imagePixels: Uint8ClampedArray, index: number, currentColor: number[]): boolean {
        return (
            this.compareValue(imagePixels[index + RED], currentColor[RED], 0) &&
            this.compareValue(imagePixels[index + GREEN], currentColor[GREEN], 0) &&
            this.compareValue(imagePixels[index + BLUE], currentColor[BLUE], 0) &&
            this.compareValue(imagePixels[index + OPACITY], currentColor[OPACITY] * WHITE, 0)
        );
    }

    setPixels(imagePixels: Uint8ClampedArray, index: number, newColor: number[]): void {
        imagePixels[index + RED] = newColor[RED];
        imagePixels[index + GREEN] = newColor[GREEN];
        imagePixels[index + BLUE] = newColor[BLUE];
        imagePixels[index + OPACITY] = newColor[OPACITY] * WHITE;
    }

    compareValue(source: number, ref: number, tolEcart: number): boolean {
        const diff = (tolEcart / PERCENTAGE) * ref;
        let lowerLimit;
        let upperLimit;

        lowerLimit = ref - diff;

        upperLimit = ref + diff > WHITE ? WHITE : ref + diff;

        if (source < ref) return source >= lowerLimit;
        else if (source > ref) return source <= upperLimit;

        return true;
    }

    getCurrentToolString(): string {
        return 'sceau';
    }
}

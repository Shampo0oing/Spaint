import { Injectable } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { ActionStamp } from '@app/classes/Actions/action-stamp';
import { ANGLE_180, ANGLE_360, SCALE, SCALE_SCROLL, STEP_SCROLL } from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    private isShiftDown: boolean;
    constructor(protected drawingService: DrawingService, protected annulerRefaire: AnnulerRefaireService) {
        super(drawingService, annulerRefaire);
        this.stampScale = this.drawingService.stampScale;
        this.stampAngle = this.drawingService.stampAngle;
    }

    imageDimension: Vec2 = { x: 0, y: 0 };
    lastMousePos: Vec2 = { x: 0, y: 0 };
    clickIcon: boolean = false;
    stepScroll: number = STEP_SCROLL;
    stampScale: number = 0;
    stampAngle: number = 0;
    links: string[] = [
        'assets/stamp/startup.svg', // Icons made by https://www.freepik.com from "https://www.flaticon.com/"
        'assets/stamp/launch.svg', // Icons made by Icongeek26 from "https://www.flaticon.com/"
        'assets/stamp/astronaut.svg', // Icons made by photo3idea_studio from "https://www.flaticon.com/"
        'assets/stamp/ufo.svg', // Icons made by Icongeek26 from "https://www.flaticon.com/"
        'assets/stamp/meteor.svg', // Icons made by https://www.freepik.com from "https://www.flaticon.com/"
        'assets/stamp/planet.svg', // Icons made by https://www.freepik.com from "https://www.flaticon.com/"
        'assets/stamp/moon.svg', // Icons made by https://www.freepik.com from "https://www.flaticon.com/"
        'assets/stamp/blackhole.svg', // Icons made by Roundicons from "https://www.flaticon.com/"
    ];

    // ces constantes sont utilisées dans le html du component stamp
    STAMP_MAX_SCALE: number = 500;
    STAMP_MIN_SCALE: number = 50;
    STAMP_MAX_ANGLE: number = 360;
    STAMP_MIN_ANGLE: number = 0;

    onMouseMove(event: MouseEvent): void {
        this.lastMousePos = this.getPositionFromMouse(event);
        if (this.clickIcon && this.isInsideCanvas()) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.rotateImage(this.drawingService.previewCtx);
        } else if (!this.isInsideCanvas()) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
    }

    onMouseDown(event: MouseEvent): void {
        if (this.isInsideCanvas()) {
            this.rotateImage(this.drawingService.baseCtx);
            this.annulerRefaire.addUndoAction(
                new ActionStamp(
                    this.drawingService,
                    { x: this.lastMousePos.x, y: this.lastMousePos.y },
                    this.drawingService.image.src,
                    this.stampAngle,
                    this.stampScale,
                    this.links,
                    this,
                ),
            );
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Alt') this.stepScroll = 1;
    }

    shiftDown(): void {
        this.isShiftDown = true;
    }

    shiftUp(): void {
        this.isShiftDown = false;
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Alt') this.stepScroll = STEP_SCROLL;
    }

    onScrollDown(): void {
        if (this.isShiftDown) {
            this.changeStampScaleSlider(this.stampScale - SCALE_SCROLL);
        } else {
            this.stampAngle -= this.stepScroll;
            this.stampAngle = (this.stampAngle + ANGLE_360) % ANGLE_360;
            this.drawingService.stampAngle = this.stampAngle;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.rotateImage(this.drawingService.previewCtx);
    }

    onScrollUp(): void {
        if (this.isShiftDown) {
            this.changeStampScaleSlider(this.stampScale + SCALE_SCROLL);
        } else {
            this.stampAngle += this.stepScroll;
            this.stampAngle = this.stampAngle % ANGLE_360;
            this.drawingService.stampAngle = this.stampAngle;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.rotateImage(this.drawingService.previewCtx);
    }

    isInsideCanvas(): boolean {
        return (
            this.lastMousePos.x >= 0 &&
            this.lastMousePos.y >= 0 &&
            this.lastMousePos.x <= this.drawingService.canvas.width &&
            this.lastMousePos.y <= this.drawingService.canvas.height
        );
    }

    rotateImage(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.lastMousePos.x, this.lastMousePos.y);
        ctx.rotate((this.stampAngle * Math.PI) / ANGLE_180);
        ctx.translate(-this.lastMousePos.x, -this.lastMousePos.y);
        this.drawStamp(ctx);
        ctx.restore();
    }

    drawStamp(ctx: CanvasRenderingContext2D): void {
        this.stampSetup();
        ctx.drawImage(
            this.drawingService.image,
            this.lastMousePos.x - this.imageDimension.x / 2,
            this.lastMousePos.y - this.imageDimension.y / 2,
            this.imageDimension.x,
            this.imageDimension.y,
        );
        this.drawingService.autoSave();
    }

    stampSetup(): void {
        this.imageDimension = {
            x: this.drawingService.image.width * (this.drawingService.stampScale / SCALE),
            y: this.drawingService.image.height * (this.drawingService.stampScale / SCALE),
        };
    }

    updateImage(link: string): void {
        this.clickIcon = true;
        this.drawingService.image.src = link;
        this.drawingService.image.setAttribute('crossOrigin', '');
    }

    changeStampScaleSlider(value: number): void {
        if (value < this.STAMP_MIN_SCALE) this.stampScale = this.STAMP_MIN_SCALE;
        else if (value > this.STAMP_MAX_SCALE) this.stampScale = this.STAMP_MAX_SCALE;
        else this.stampScale = value;
        this.drawingService.stampScale = this.stampScale;
    }

    changeStampAngleSlider(event: MatSliderChange): void {
        this.stampAngle = event.value ? event.value : this.STAMP_MIN_ANGLE;
        this.drawingService.stampAngle = this.stampAngle;
    }

    getCurrentToolString(): string {
        return 'stamp';
    }
}

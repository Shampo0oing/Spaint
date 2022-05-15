import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActionResizer } from '@app/classes/Actions/action-resizable';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, DragPos } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizerService } from '@app/services/resizer/resizer.service';
export { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-resizable',
    templateUrl: './resizable.component.html',
    styleUrls: ['./resizable.component.scss'],
})
export class ResizableComponent implements OnInit {
    @ViewChild('box') box: ElementRef;
    private mouse: Vec2;
    status: DragPos = DragPos.NONE;
    resizerService: ResizerService;
    drawingService: DrawingService;
    constructor(drawingService: DrawingService, resizerService: ResizerService, private annulerRefaireService: AnnulerRefaireService) {
        this.resizerService = resizerService;
        this.drawingService = drawingService;
    }

    ngOnInit(): void {
        this.resizerService.width = DEFAULT_WIDTH;
        this.resizerService.height = DEFAULT_HEIGHT;
    }

    setStatus(status: number): void {
        this.status = status;
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.mouse = { x: event.pageX, y: event.pageY };
        if (this.status === DragPos.NONE) return;
        this.resizerService.offset = {
            x: this.box.nativeElement.getBoundingClientRect().left,
            y: this.box.nativeElement.getBoundingClientRect().top,
        };
        this.resizerService.resize(this.status, this.mouse);
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (this.status === DragPos.NONE) return;
        this.resizerService.resizeImage();
        this.annulerRefaireService.addUndoAction(
            new ActionResizer(this.drawingService, this.resizerService, { x: this.resizerService.width, y: this.resizerService.height }),
        );
        this.setStatus(DragPos.NONE);
    }
}

import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, JUMP_PX_5, MouseButton, SELECTRECT_KEY, SQUARE_MAX_SIZE, SQUARE_MIN_SIZE } from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizerService } from '@app/services/resizer/resizer.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard.service';
import { SelectionLassoService } from '@app/services/tools/selection/selection-lasso.service';
import { SelectionRectangleService } from '@app/services/tools/selection/selection-rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    private canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(
        private drawingService: DrawingService,
        private toolSelector: ToolSelectorService,
        private annulerRefaireService: AnnulerRefaireService,
        private clipboardService: ClipboardService,
        private resizerService: ResizerService,
    ) {}

    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.baseCtx.fillStyle = '#ffffff';
        this.baseCtx.fillRect(0, 0, this.canvasSize.x, this.canvasSize.y);
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.gridCtx = this.gridCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
        this.openSavedCanvas().then(() => this.annulerRefaireService.updateImageData());
    }

    get currentTool(): Tool {
        return this.toolSelector.currentTool;
    }

    set currentTool(tool: Tool) {
        this.toolSelector.currentTool = tool;
    }

    async openSavedCanvas(): Promise<void> {
        const canvasUrl = this.drawingService.getSavedCanvas();
        if (!canvasUrl) return;
        const image = new Image();
        image.src = canvasUrl;
        await image.decode();
        this.resizerService.resizeImage({ x: image.width, y: image.height });
        this.baseCtx.drawImage(image, 0, 0);
    }

    validateSquareSize(): void {
        this.drawingService.squareSize = this.drawingService.squareSize < SQUARE_MIN_SIZE ? SQUARE_MIN_SIZE : this.drawingService.squareSize;
        this.drawingService.squareSize = this.drawingService.squareSize > SQUARE_MAX_SIZE ? SQUARE_MAX_SIZE : this.drawingService.squareSize;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    gridAndMagnetism(event: KeyboardEvent): void {
        if (event.key === 'm' && !this.drawingService.mouseDown) {
            this.drawingService.useMagnetism = !this.drawingService.useMagnetism;
            const gridComponent = document.getElementById('gridComponent') as HTMLElement;
            gridComponent.click();
        }
        if (event.key === 'g' && !this.drawingService.mouseDown) {
            this.drawingService.showGrid = !this.drawingService.showGrid;
            this.drawingService.clearCanvas(this.drawingService.gridCtx);
            const gridComponent = document.getElementById('gridComponent') as HTMLElement;
            gridComponent.click();
        }

        if (event.key === '+' || event.key === '=') {
            this.drawingService.squareSize = (Math.floor(this.drawingService.squareSize / JUMP_PX_5) + 1) * JUMP_PX_5;
            this.validateSquareSize();
        }
        if (event.key === '-') {
            this.drawingService.squareSize = (Math.ceil(this.drawingService.squareSize / JUMP_PX_5) - 1) * JUMP_PX_5;
            this.validateSquareSize();
        }
    }

    clipboardAndUndo(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 'z') {
            event.preventDefault();
            this.annulerRefaireService.undo();
            if (this.toolSelector.currentTool.getCurrentToolString() === 'selectionLasso') {
                const currentTool = this.toolSelector.currentTool as SelectionLassoService;
                currentTool.drawingLine = false;
                this.drawingService.selected = this.drawingService.mouseDown = false;
                currentTool.clearPath();
            }
        }
        if (event.ctrlKey && event.key === 'Z') {
            event.preventDefault();
            this.annulerRefaireService.redo();
        }
        if (event.ctrlKey && event.key === 'a') {
            event.preventDefault();

            this.toolSelector.setTool(SELECTRECT_KEY);
            const currentTool = this.toolSelector.currentTool as SelectionRectangleService;
            currentTool.selectAll();
        }
        if (event.ctrlKey && event.key === 'v') {
            event.preventDefault();
            this.toolSelector.setTool(this.clipboardService.selectedTool);
            const currentTool = this.toolSelector.currentTool as SelectionService;
            currentTool.paste();
        }
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.toolSelector.currentTool.onMouseMove(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        if (event.button === MouseButton.Left) {
            event.preventDefault();
            this.toolSelector.currentTool.onMouseDown(event);
        }
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.toolSelector.currentTool.onMouseUp(event);
    }

    @HostListener('dblclick', ['$event'])
    onDoubleClick(): void {
        this.toolSelector.currentTool.onDoubleClick();
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent): void {
        if (event.button === MouseButton.Left) {
            this.toolSelector.currentTool.onClick(event);
        }
    }

    @HostListener('contextmenu', ['$event'])
    onContextMenu(event: MouseEvent): void {
        event.preventDefault();
        this.toolSelector.currentTool.onClickRight(event);
    }

    @HostListener('document:keydown', ['$event'])
    keyDown(event: KeyboardEvent): void {
        if (this.drawingService.dialogOpen) return;

        if (event.key === 'Shift') this.toolSelector.currentTool.shiftDown();
        if (event.key === 'Escape') this.toolSelector.currentTool.escapeDown();
        if (event.key === 'Backspace') this.toolSelector.currentTool.backspaceDown();
        if (event.key === 'Escape') this.toolSelector.currentTool.escapeDown();
        if (event.key === 'Delete') this.toolSelector.currentTool.deleteDown();
        if (event.key === 'Enter') this.toolSelector.currentTool.enterDown();

        this.toolSelector.currentTool.onKeyDown(event);
        if (!event.ctrlKey) this.toolSelector.setTool(event.key);
        this.clipboardAndUndo(event);
        this.gridAndMagnetism(event);
    }

    @HostListener('document:keyup', ['$event'])
    keyUp(event: KeyboardEvent): void {
        event.preventDefault();
        if (event.key === 'Shift') this.toolSelector.currentTool.shiftUp();
        this.toolSelector.currentTool.onKeyUp(event);
    }

    @HostListener('window:mousewheel', ['$event'])
    scroll(event: WheelEvent): void {
        if (event.deltaY > 0) {
            this.toolSelector.currentTool.onScrollDown();
        } else {
            this.toolSelector.currentTool.onScrollUp();
        }
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}

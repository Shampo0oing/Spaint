import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-clipboard',
    templateUrl: './clipboard.component.html',
    styleUrls: ['./clipboard.component.scss'],
})
export class ClipboardComponent implements AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;
    @Input() popupTitle: string = 'Presse-papiers';
    clipboardService: ClipboardService;
    drawingService: DrawingService;
    constructor(clipboardService: ClipboardService, drawingService: DrawingService, private toolSelectorService: ToolSelectorService) {
        this.clipboardService = clipboardService;
        this.drawingService = drawingService;
    }

    private currentTool: SelectionService;
    private popup: HTMLElement;

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
        this.popup.style.display = 'none';
    }

    openClipBoard(): void {
        this.popup.style.display = 'block';
    }

    closeClipBoard(): void {
        this.popup.style.display = 'none';
    }

    copy(): void {
        this.currentTool = this.toolSelectorService.currentTool as SelectionService;
        this.currentTool.copy();
    }

    paste(): void {
        this.toolSelectorService.setTool(this.clipboardService.selectedTool);
        this.currentTool = this.toolSelectorService.currentTool as SelectionService;
        this.currentTool.paste();
    }

    delete(): void {
        this.currentTool = this.toolSelectorService.currentTool as SelectionService;
        this.currentTool.delete();
    }

    cut(): void {
        this.currentTool = this.toolSelectorService.currentTool as SelectionService;
        this.currentTool.cut();
    }
}

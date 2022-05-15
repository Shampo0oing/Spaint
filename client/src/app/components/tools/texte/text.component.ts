import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { TEXTE_KEY } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from '@app/services/tools/text/text.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-text',
    templateUrl: './text.component.html',
    styleUrls: ['./text.component.scss'],
})
export class TextComponent extends GenericToolComponent implements AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;
    @ViewChild('fontSelector') fontSelector: ElementRef;
    @ViewChild('fontStyleSelector') fontStyleSelector: ElementRef;
    @ViewChild('alignSelector') alignSelector: ElementRef;
    textService: TextService;
    policeSize: number;
    POLICE_MIN_SIZE: number = 5;
    POLICE_MAX_SIZE: number = 50;
    constructor(private drawingService: DrawingService, public toolSelector: ToolSelectorService, texteService: TextService) {
        super(toolSelector);
        this.textService = texteService;
        this.policeSize = this.drawingService.policeSize;
    }

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
        this.popup.style.display = 'none';
    }
    selectText(): void {
        this.toolSelector.setTool(TEXTE_KEY);
        if (this.popup.style.display === 'none') this.openParametre();
        else this.closeParametre();
    }
    changePoliceSizeSlider(event: MatSliderChange): void {
        this.policeSize = event.value ? event.value : this.POLICE_MIN_SIZE;
        this.drawingService.policeSize = this.policeSize;
        if (this.textService.writing) {
            this.textService.writeAllText(this.drawingService.previewCtx);
            this.textService.putTextIndicator();
        }
    }

    changeFont(value: string): void {
        this.drawingService.font = value;
        this.fontSelector.nativeElement.blur();
        if (this.textService.writing) {
            this.textService.writeAllText(this.drawingService.previewCtx);
            this.textService.putTextIndicator();
        }
    }

    changeFontStyle(value: string): void {
        this.drawingService.fontStyle = value;
        this.fontStyleSelector.nativeElement.blur();
        if (this.textService.writing) {
            this.textService.writeAllText(this.drawingService.previewCtx);
            this.textService.putTextIndicator();
        }
    }

    changeAlign(value: CanvasTextAlign): void {
        this.drawingService.textAlign = value;
        this.alignSelector.nativeElement.blur();
        if (this.textService.writing) {
            this.textService.writeAllText(this.drawingService.previewCtx);
            this.textService.putTextIndicator();
        }
    }
}

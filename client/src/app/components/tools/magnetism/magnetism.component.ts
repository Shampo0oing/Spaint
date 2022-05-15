import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatRadioButton } from '@angular/material/radio';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { NUMBER_POINTS } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/tools/magnetism/magnetism.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-magnetism',
    templateUrl: './magnetism.component.html',
    styleUrls: ['./magnetism.component.scss'],
})
export class MagnetismComponent extends GenericToolComponent implements AfterViewInit {
    constructor(public drawingService: DrawingService, public toolSelector: ToolSelectorService, private magnetismService: MagnetismService) {
        super(toolSelector);
    }
    @ViewChild('radiobutton') radioButton: ElementRef<HTMLElement>;

    changeMagnetismPoint(value: number): void {
        const chiffre = Number(value) as number;
        this.magnetismService.translationPointX = (chiffre % NUMBER_POINTS) / 2;
        this.magnetismService.translationPointY = Math.floor(chiffre / NUMBER_POINTS) / 2;
    }

    toggle(event: MatSlideToggleChange): void {
        this.drawingService.useMagnetism = event.checked;
    }

    ngAfterViewInit(): void {
        const radio = (this.radioButton.nativeElement.firstChild as unknown) as MatRadioButton;
        radio.checked = true;
    }
}

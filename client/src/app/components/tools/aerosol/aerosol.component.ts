import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { AEROSOL_KEY } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-aerosol',
    templateUrl: './aerosol.component.html',
    styleUrls: ['./aerosol.component.scss'],
})
export class AerosolComponent extends GenericToolComponent implements AfterViewInit {
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLElement>;

    emission: number;
    sprayDiameter: number;
    dropletDiameter: number;

    // ces constantes sont utilisées dans le html
    AEROSOL_MAX_EMISSION: number = 1000;
    AEROSOL_MIN_EMISSION: number = 100;
    AEROSOL_MAX_SPRAY: number = 200;
    AEROSOL_MIN_SPRAY: number = 20;
    AEROSOL_MAX_DROPLET: number = 5;
    AEROSOL_MIN_DROPLET: number = 1;

    constructor(private drawingService: DrawingService, public toolSelector: ToolSelectorService) {
        super(toolSelector);
        this.emission = this.drawingService.emission;
        this.sprayDiameter = this.drawingService.sprayDiameter;
        this.dropletDiameter = this.drawingService.dropletDiameter;
    }

    ngAfterViewInit(): void {
        this.popup = this.popupHtml.nativeElement;
        this.popup.style.display = 'none';
    }

    selectAerosol(): void {
        this.toolSelector.setTool(AEROSOL_KEY);
        if (this.popup.style.display === 'none' && this.getCurrentTool() === 'aerosol') this.openParametre();
        else this.closeParametre();
    }

    changeEmissionSlider(event: MatSliderChange): void {
        this.emission = event.value ? event.value : this.AEROSOL_MIN_EMISSION;
        this.drawingService.emission = this.emission;
    }

    changeSpraySlider(event: MatSliderChange): void {
        this.sprayDiameter = event.value ? event.value : this.AEROSOL_MIN_SPRAY;
        this.drawingService.sprayDiameter = this.sprayDiameter;
    }

    changeDropletSlider(event: MatSliderChange): void {
        this.dropletDiameter = event.value ? event.value : this.AEROSOL_MIN_DROPLET;
        this.drawingService.dropletDiameter = this.dropletDiameter;
    }
}

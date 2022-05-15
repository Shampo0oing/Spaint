import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { PIPETTE_KEY } from '@app/classes/constantes';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-pipette',
    templateUrl: './pipette.component.html',
    styleUrls: ['./pipette.component.scss'],
})
export class PipetteComponent extends GenericToolComponent implements AfterViewInit {
    @ViewChild('magnifier') magnifier: ElementRef;
    @ViewChild('popup', { static: false }) popupHtml: ElementRef<HTMLCanvasElement>;
    @ViewChild('magnifierWrapper') wrapper: ElementRef<HTMLElement>;

    constructor(public toolSelector: ToolSelectorService, private pipetteService: PipetteService) {
        super(toolSelector);
    }

    ngAfterViewInit(): void {
        this.pipetteService.magnifierCtx = this.magnifier.nativeElement.getContext('2d');
        this.pipetteService.wrapper = this.wrapper.nativeElement;
        this.popup = this.popupHtml.nativeElement;
        this.popup.style.display = 'none';
    }

    selectPipette(): void {
        this.toolSelector.setTool(PIPETTE_KEY);
        if (this.popup.style.display === 'none' && this.getCurrentTool() === 'pipette') this.openParametre();
        else this.closeParametre();
    }
}

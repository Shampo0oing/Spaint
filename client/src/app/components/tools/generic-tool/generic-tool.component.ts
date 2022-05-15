import { Component } from '@angular/core';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

@Component({
    selector: 'app-generic-tool',
    templateUrl: './generic-tool.component.html',
    styleUrls: ['./generic-tool.component.scss'],
})
export class GenericToolComponent {
    constructor(public toolSelector: ToolSelectorService) {}
    protected popup: HTMLElement;

    closeParametre(): void {
        this.popup.style.display = 'none';
    }

    openParametre(): void {
        this.popup.style.display = 'block';
    }

    getCurrentTool(): string {
        return this.toolSelector.currentTool ? this.toolSelector.currentTool.getCurrentToolString() : 'vide';
    }
}

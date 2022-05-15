import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NUMBER_POINTS } from '@app/classes/constantes';
import { SidebarAddDrawComponent } from '@app/components/sidebar/add-draw/sidebar-add-draw.component';
import { ExportDialogComponent } from '@app/components/sidebar/export-drawing/export-dialog.component';
import { SaveDrawComponent } from '@app/components/sidebar/save-draw/save-draw.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CarouselComponent } from './carousel/carousel.component';

export enum Dialog {
    add,
    export,
    save,
    carousel,
}

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    private callOnce: boolean = false;
    @ViewChild('colorPickers') colorPickers: ElementRef;
    constructor(public dialog: MatDialog, public drawingService: DrawingService) {}

    @HostListener('document:keydown', ['$event'])
    keyDown(event: KeyboardEvent): void {
        event.stopPropagation();
        if (event.ctrlKey && event.key === 'o') {
            event.preventDefault();
            if (!this.callOnce) this.openDialog(0);
        } else if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            if (!this.callOnce) this.openDialog(1);
        } else if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            if (!this.callOnce) this.openDialog(2);
        } else if (event.ctrlKey && event.key === 'g') {
            event.preventDefault();
            if (!this.callOnce) this.openDialog(NUMBER_POINTS);
        }
    }

    @HostListener('contextmenu', ['$event'])
    onContextMenu(event: MouseEvent): void {
        event.preventDefault();
    }

    openDialog(component: number): void {
        this.drawingService.dialogOpen = true;
        this.callOnce = true;
        let dialogRef;
        const config = { autoFocus: false, dialog: closed, disableClose: true };
        switch (component) {
            case Dialog.add:
                dialogRef = this.dialog.open(SidebarAddDrawComponent, config);
                break;
            case Dialog.export:
                dialogRef = this.dialog.open(ExportDialogComponent, config);
                break;
            case Dialog.save:
                dialogRef = this.dialog.open(SaveDrawComponent, config);
                break;
            case Dialog.carousel:
                dialogRef = this.dialog.open(CarouselComponent, config);
                break;
        }
        // tslint:disable-next-line: deprecation
        dialogRef?.afterClosed().subscribe(() => {
            this.callOnce = false;
        });
    }

    closeAllColorPickers(): void {
        const colorPickerList = this.colorPickers.nativeElement.children[0].children;
        for (const c of colorPickerList) if (c.tagName === 'DIV') c.children[0].children.popup.style.display = 'none';
    }
}

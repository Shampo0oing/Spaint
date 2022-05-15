import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Drawing } from '@app/classes/Database/drawing';
import { Vec2 } from '@app/classes/vec2';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';
import { ResizerService } from '@app/services/resizer/resizer.service';

@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements AfterViewInit, OnInit {
    constructor(
        private dialog: MatDialog,
        public indexService: IndexService,
        private drawingService: DrawingService,
        private resizerService: ResizerService,
        private annulerRefaireService: AnnulerRefaireService,
        private snackBar: MatSnackBar,
    ) {}

    @ViewChild('carousel') carousel: ElementRef<HTMLElement>;
    @ViewChild('errorMessage') errorMessageRef: ElementRef<HTMLElement>;
    @ViewChild('loading') loadingRef: ElementRef<HTMLElement>;
    @ViewChild('confirm') confirm: ElementRef<HTMLElement>;
    tags: string[] = [];
    readonly separatorKeysCodes: number[] = [ENTER, SPACE];
    loading: HTMLElement;
    errorMessage: HTMLElement;
    previewWidth: number = 266;
    drawings: Drawing[] = [];
    filteredDrawings: Drawing[] | null = null;
    currentDrawing: Drawing;
    message: string = 'Une erreur est survenue';
    httpServerErrors: Vec2 = { x: 500, y: 599 };
    maxTags: number = 10;

    nameSearchFormControl: FormControl = new FormControl('', [Validators.pattern('^[a-zA-Z0-9]+$')]);

    nameSaveFormControl: FormControl = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+$')]);

    tagFormControl: FormControl = new FormControl('', [Validators.pattern('^[a-zA-Z0-9]+$')]);

    closeDialog(): void {
        this.drawingService.dialogOpen = false;
        this.dialog.closeAll();
    }

    ngOnInit(): void {
        // this.getAllDrawings();
    }

    ngAfterViewInit(): void {
        this.loading = this.loadingRef.nativeElement;
        this.errorMessage = this.errorMessageRef.nativeElement;
        this.show(this.loading);
        this.getAllDrawings();
    }

    @HostListener('document:keydown', ['$event'])
    keyDown(event: KeyboardEvent): void {
        event.stopPropagation();
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            this.scrollDown(this.carousel.nativeElement, 'initial');
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            this.scrollUp(this.carousel.nativeElement, 'initial');
        }
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            if (!this.tags.includes(value.trim()) && this.tags.length < this.maxTags && value.match(/^([a-zA-Z0-9])+$/)) {
                this.tags.push(value.trim());
            }
        }

        if (input && value.match(/^([a-zA-Z0-9])+$/)) {
            input.value = '';
        }
    }

    remove(tags: string): void {
        const index = this.tags.indexOf(tags);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    selectDrawing(event: MouseEvent, carousel: HTMLDivElement): void {
        const drawingsNumberPerSlide = 3;
        if (this.drawings.length > drawingsNumberPerSlide) {
            const secondImage = carousel.children[1] as HTMLElement;
            const imageOffset = secondImage.offsetLeft;
            const target = event.target as HTMLElement;
            const element = target.parentElement as HTMLElement;
            carousel.style.scrollBehavior = 'smooth';
            carousel.scrollTo(element.offsetLeft - imageOffset, 0);
        }
    }

    scrollDown(carousel: HTMLElement, scrollType: string = 'smooth'): void {
        if (carousel.scrollLeft - this.previewWidth < 0) {
            carousel.style.scrollBehavior = 'initial';
            carousel.scrollTo(this.drawings.length * this.previewWidth, 0);
            // tslint:disable-next-line:no-magic-numbers
        } else {
            carousel.style.scrollBehavior = scrollType;
            carousel.scrollTo(carousel.scrollLeft - this.previewWidth, 0);
        }
    }

    scrollUp(carousel: HTMLElement, scrollType: string = 'smooth'): void {
        // tslint:disable-next-line:no-magic-numbers
        if (carousel.scrollLeft + this.previewWidth > (this.drawings.length - 3) * this.previewWidth) {
            carousel.style.scrollBehavior = 'initial';
            carousel.scrollTo(0, 0);
        } else {
            carousel.style.scrollBehavior = scrollType;
            carousel.scrollTo(carousel.scrollLeft + this.previewWidth, 0);
        }
    }

    getAllDrawings(): void {
        const albumHash = this.drawingService.localStorage.getItem('imgur/album');
        if (albumHash) {
            this.indexService.getAllImages(albumHash).subscribe(
                (res) => {
                    this.drawings = res.reverse();
                },
                (error) => {
                    this.message = 'Le serveur est actuellement indisponible';
                    this.sendError(error);
                },
                () => {
                    this.sendWarningMessage();
                },
            );
        } else {
            this.sendWarningMessage();
        }
    }

    searchDrawings(name: string = '', tags: string[] = []): void {
        if (name !== '') {
            if (tags.length !== 0) {
                this.filteredDrawings = this.drawings.filter((draw) => {
                    return draw.name.toLowerCase().startsWith(name.toLowerCase()) && tags.every((tag) => draw.tags.includes(tag));
                });
            } else this.filteredDrawings = this.drawings.filter((draw) => draw.name.toLowerCase().startsWith(name.toLowerCase()));
        } else if (tags.length !== 0) {
            this.filteredDrawings = this.drawings.filter((draw) => tags.every((tag) => draw.tags.includes(tag)));
        } else this.filteredDrawings = null;
    }

    tryOpeningDrawing(): void {
        if (!(document.activeElement && document.activeElement.id === 'drawing-card')) {
            this.openSnackbar("Selectionner un dessin avant de vouloir en ouvrire un (●'◡'●)");
        } else if (this.annulerRefaireService.undoActions.length) {
            this.show(this.confirm.nativeElement);
        } else {
            this.openDrawing();
        }
    }

    openDrawing(): void {
        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.src = this.currentDrawing.link;
        image.onload = () => {
            this.resizerService.resizeImage({ x: image.width, y: image.height });
            this.drawingService.baseCtx.drawImage(image, 0, 0);
            this.annulerRefaireService.updateImageData();
            this.drawingService.autoSave();
            this.closeDialog();
        };
    }

    deleteOne(): void {
        if (!(document.activeElement && document.activeElement.id === 'drawing-card')) {
            this.openSnackbar("Selectionner un dessin avant de vouloir en supprimer un (●'◡'●)");
        } else {
            this.show(this.loading);
            this.indexService.deleteImage(this.currentDrawing.id).subscribe(
                () => {
                    this.openSnackbar('Votre dessin a bien été supprimé');
                },
                (err) => {
                    this.message = "Le dessin n'a pas pu être supprimé car le serveur est actuellement indisponible";
                    this.sendError(err);
                },
                () => {
                    this.drawings = this.drawings.filter((d) => d.id !== this.currentDrawing.id);
                    this.sendWarningMessage();
                },
            );
        }
    }

    deleteAll(): void {
        if (this.drawings.length === 0) {
            this.openSnackbar("Sauvegarder des dessins avant de vouloir tous les supprimer (●'◡'●)");
        } else {
            this.hide(this.errorMessage);
            this.show(this.loading);
            const ids = this.drawings.map((draw) => draw.id).join();
            this.indexService.deleteAllImages(ids).subscribe(
                () => {
                    this.drawings = [];
                    this.openSnackbar('Tout vos dessins on bien été supprimés');
                },
                (error) => {
                    this.message = "Les dessins n'ont pas pu être supprimés car le serveur est actuellement indisponible";
                    this.sendError(error);
                },
                () => {
                    this.sendWarningMessage();
                },
            );
        }
    }

    show(elem: HTMLElement): void {
        elem.style.display = 'flex';
    }

    hide(elem: HTMLElement): void {
        elem.style.display = 'none';
    }

    sendError(error: Error): void {
        this.hide(this.loading);
        this.show(this.errorMessage);
        this.openSnackbar(error.message);
    }

    sendWarningMessage(message: string = "Vous n'avez aucun dessin sauvegardé"): void {
        this.hide(this.loading);
        if (this.drawings.length === 0) {
            this.message = message;
            this.show(this.errorMessage);
        } else {
            this.hide(this.errorMessage);
        }
    }

    openSnackbar(message: string): void {
        this.snackBar.open(message, undefined, {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: ['dark-snackbar', 'text-spaced'],
        });
    }
}

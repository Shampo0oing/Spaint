import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VALIDATORS_MAX, VALIDATORS_MIN } from '@app/classes/constantes';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';

@Component({
    selector: 'app-export-dialog',
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent implements AfterViewInit, OnInit {
    constructor(public dialog: MatDialog, public drawingService: DrawingService, public indexService: IndexService, private snackBar: MatSnackBar) {}
    @ViewChild('preview') preview: ElementRef<HTMLCanvasElement>;
    @ViewChild('loading') loading: ElementRef<HTMLElement>;
    @ViewChild('imgurAction') imgurAction: ElementRef<HTMLElement>;
    @ViewChild('imgurButton') imgurButton: MatButton;

    link: string = '';
    name: string = 'Picasso';
    previewSize: { width: number; height: number } = { width: 100, height: 100 };
    extension: string = 'png';
    percentage: number = 20;
    filter: string = 'none';
    imgurUrl: string = '';

    nameFormControl: FormControl = new FormControl('', [
        Validators.required,
        Validators.minLength(VALIDATORS_MIN),
        Validators.maxLength(VALIDATORS_MAX),
        Validators.pattern('^[^<>:;,?"*|/]+$'),
    ]);

    ngOnInit(): void {
        this.previewSize = { width: this.drawingService.canvas.width, height: this.drawingService.canvas.height };
        // this.imgurService.getAccessToken().subscribe(
        //     (res) => (this.imgurService.accessToken = res),
        //     (err) => this.openSnackbar(err.message),
        // );
    }

    ngAfterViewInit(): void {
        this.updatePreview();
    }

    createDownloadLink(): void {
        const ctxToDownload = this.createFilteredCtx();
        const a = document.createElement('a');
        a.href = ctxToDownload.canvas.toDataURL('image/' + this.extension);
        a.download = this.name;
        a.click();
    }

    uploadOnImgur(): void {
        const ctxToDownload = this.createFilteredCtx();
        this.loading.nativeElement.style.display = 'block';
        this.indexService.uploadOnImgur(ctxToDownload.canvas, this.extension).subscribe(
            (res) => {
                this.imgurUrl = res.link;
            },
            (err) => {
                this.openSnackbar(err.message);
                this.loading.nativeElement.style.display = 'none';
            },
            () => {
                this.loading.nativeElement.style.display = 'none';
                this.imgurButton._elementRef.nativeElement.style.display = 'none';
                this.imgurAction.nativeElement.style.display = 'flex';
            },
        );
    }

    createFilteredCtx(): CanvasRenderingContext2D {
        const width = this.drawingService.canvas.width;
        const height = this.drawingService.canvas.height;
        const ctxToDownload = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        ctxToDownload.canvas.width = width;
        ctxToDownload.canvas.height = height;
        this.setFilter(ctxToDownload, this.filter);
        ctxToDownload.drawImage(this.drawingService.canvas, 0, 0, width, height);
        return ctxToDownload;
    }

    closeDialog(): void {
        this.drawingService.dialogOpen = false;
        this.dialog.closeAll();
    }

    changeFilter(filter: string): void {
        const previewCtx = this.preview.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        previewCtx.imageSmoothingEnabled = true;
        this.setFilter(previewCtx, filter);
        this.updatePreview();
    }

    setFilter(ctx: CanvasRenderingContext2D, filter: string): void {
        const toDeg = 3.6;
        const toPx = 0.3;
        switch (filter) {
            case 'none':
                ctx.filter = filter;
                break;
            case 'blur':
                ctx.filter = filter + `(${this.percentage * toPx}px)`;
                break;
            case 'hue-rotate':
                ctx.filter = filter + `(${this.percentage * toDeg}deg)`;
                break;
            default:
                ctx.filter = filter + `(${this.percentage}%)`;
        }
    }

    updatePreview(): void {
        const ctx = this.preview.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(this.drawingService.canvas, 0, 0);
    }

    openImgurImage(link: string): void {
        const button = document.createElement('a');
        button.href = link;
        button.target = '_blank';
        button.rel = 'noreferrer noopener';
        button.click();
    }

    openSnackbar(message: string): void {
        this.snackBar.open(message, undefined, {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: ['dark-snackbar', 'text-spaced'],
        });
    }

    violateTSLintRules() {
        // Violates the "no-var-keyword" rule
        var x = 10;
    
        // Violates the "triple-equals" rule
        if (x == 10) {
            console.log('x is 10');
        }
    
        // Violates the "no-unused-expression" rule
        x;
    
        // Violates the "curly" rule
        if (x > 5)
            console.log('x is greater than 5');
    }

    breakTSLintRules(): void {
        // Violates the "no-var-keyword" rule
        var x = 10;

        // Violates the "triple-equals" rule
        if (x == 10) {
            console.log('x is 10');
        }

        // Violates the "no-unused-expression" rule
        x;

        // Violates the "curly" rule
        if (x > 5)
            console.log('x is greater than 5');
    }
}

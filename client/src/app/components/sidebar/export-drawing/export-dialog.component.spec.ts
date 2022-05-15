import { ClipboardModule } from '@angular/cdk/clipboard';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatLabel } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlider } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Observable } from 'rxjs';
import { ExportDialogComponent } from './export-dialog.component';

describe('ExportDialogComponent', () => {
    let component: ExportDialogComponent;
    let fixture: ComponentFixture<ExportDialogComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let canvasTestHelper: CanvasTestHelper;
    // tslint:disable:no-magic-numbers

    beforeEach(() => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['closeAll']);
        TestBed.configureTestingModule({
            declarations: [ExportDialogComponent, MatLabel, MatSlider],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: DrawingService, useValue: {} },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                MatRadioModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                MatSnackBarModule,
                MatTooltipModule,
                BrowserAnimationsModule,
                ClipboardModule,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ExportDialogComponent);

        component = fixture.componentInstance;
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        component.drawingService.canvas = canvasTestHelper.canvas;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should update previewSize and get an access token from imgur if response from request', () => {
        spyOn(component.imgurService, 'getAccessToken').and.returnValue(
            new Observable<{ access_token: string }>((observer) => observer.next({ access_token: 'token' })),
        );
        component.previewSize = { width: 0, height: 0 };
        component.drawingService.canvas.height = 100;
        component.drawingService.canvas.width = 100;
        component.ngOnInit();
        expect(component.previewSize.height).toEqual(100);
        expect(component.previewSize.width).toEqual(100);
        expect(component.imgurService.accessToken).toEqual('token');
    });

    it('ngOnInit should update previewSize and display error if request failed', () => {
        spyOn(component.imgurService, 'getAccessToken').and.returnValue(
            new Observable<{ access_token: string }>((observer) => observer.error(new Error('une erreur est survenue'))),
        );
        const snackBarSpy = spyOn(component, 'openSnackbar').and.stub();
        component.previewSize = { width: 0, height: 0 };
        component.drawingService.canvas.height = 100;
        component.drawingService.canvas.width = 100;
        component.ngOnInit();
        expect(component.previewSize.height).toEqual(100);
        expect(component.previewSize.width).toEqual(100);
        expect(snackBarSpy).toHaveBeenCalledWith('une erreur est survenue');
    });

    it('ngAfterViewInit should forward call to updatePreview', () => {
        const updatePreviewSpy = spyOn(component, 'updatePreview').and.stub();
        component.ngAfterViewInit();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('createDownloadLink should forward call to setFilter', () => {
        const setFilterSpy = spyOn(component, 'setFilter').and.stub();
        component.createDownloadLink();
        expect(setFilterSpy).toHaveBeenCalled();
    });

    it('closeDialog should forward call to closeAll', () => {
        component.closeDialog();
        expect(dialogSpy.closeAll).toHaveBeenCalled();
    });

    it('changeFilter should forward call to setFilter and updatePreview', () => {
        const setFilterSpy = spyOn(component, 'setFilter').and.stub();
        const updatePreviewSpy = spyOn(component, 'updatePreview').and.stub();
        component.changeFilter('test');
        expect(setFilterSpy).toHaveBeenCalled();
        expect(updatePreviewSpy).toHaveBeenCalled();
    });

    it('setFilter should update ctx filter with none', () => {
        const ctx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        component.setFilter(ctx, 'none');
        expect(ctx.filter).toEqual(ctx.filter);
    });

    it('setFilter should update ctx filter with blur', () => {
        const ctx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        component.percentage = 10;
        component.setFilter(ctx, 'blur');
        expect(ctx.filter).toEqual('blur(3px)');
    });

    it('setFilter should update ctx filter with hue-rotate', () => {
        const ctx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        component.percentage = 10;
        component.setFilter(ctx, 'hue-rotate');
        expect(ctx.filter).toEqual('hue-rotate(36deg)');
    });

    it('setFilter should update ctx filter with default', () => {
        const ctx = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D;
        component.percentage = 10;
        component.setFilter(ctx, 'default');
        expect(ctx.filter).toEqual('none');
    });

    it('updatePreview should forward call to drawImage', () => {
        const ctx = component.preview.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const drawImageSpy = spyOn(ctx, 'drawImage').and.stub();
        component.updatePreview();
        expect(drawImageSpy).toHaveBeenCalledWith(component.drawingService.canvas, 0, 0);
    });

    it('uploadOnImgur should create the filtered ctx and upload it on imgur and get the link if response', () => {
        const createFilteredCtxSpy = spyOn(component, 'createFilteredCtx').and.returnValue({
            canvas: document.createElement('canvas'),
        } as CanvasRenderingContext2D);
        const observable = new Observable<{ data: { link: string } }>((observer) => observer.next({ data: { link: 'link' } }));
        spyOn(component.imgurService, 'uploadImage').and.returnValue(observable);
        component.uploadOnImgur();
        expect(createFilteredCtxSpy).toHaveBeenCalled();
        expect(component.imgurUrl).toEqual('link');
    });

    it('uploadOnImgur should display a message error if request failed', () => {
        const snackBarSpy = spyOn(component, 'openSnackbar').and.stub();
        spyOn(component.imgurService, 'uploadImage').and.returnValue(
            new Observable<{ data: { link: string } }>((observer) => observer.error(new Error('une erreur est survenue'))),
        );
        component.uploadOnImgur();
        expect(snackBarSpy).toHaveBeenCalledWith('une erreur est survenue');
    });

    it('uploadOnImgur should stop loading , display link and copy button in the interface', () => {
        component.loading = { nativeElement: { style: { display: 'block' } } } as ElementRef<HTMLElement>;
        component.imgurButton = { _elementRef: { nativeElement: { style: { display: 'block' } } } } as MatButton;
        component.imgurAction = { nativeElement: { style: { display: 'none' } } } as ElementRef<HTMLElement>;
        spyOn(component.imgurService, 'uploadImage').and.returnValue(
            new Observable<{ data: { link: string } }>((observer) => observer.complete()),
        );
        component.uploadOnImgur();
        expect(component.loading.nativeElement.style.display).toEqual('none');
        expect(component.imgurButton._elementRef.nativeElement.style.display).toEqual('none');
        expect(component.imgurAction.nativeElement.style.display).toEqual('flex');
    });
    it('openImgurImage should create an A tag html element with a scr corresponding to the image url, and click on it', () => {
        const clickSpy = spyOn(HTMLElement.prototype, 'click').and.stub();
        component.openImgurImage('');
        expect(clickSpy).toHaveBeenCalled();
    });
});

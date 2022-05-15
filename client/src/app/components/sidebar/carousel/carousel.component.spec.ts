import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipInput, MatChipInputEvent, MatChipsModule, MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Drawing } from '@app/classes/Database/drawing';
import { Observable } from 'rxjs';
import { CarouselComponent } from './carousel.component';

// tslint:disable:no-string-literal

describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;
    let componentSpyObj: jasmine.SpyObj<MatDialog>;
    // tslint:disable:no-shadowed-variable
    // tslint:disable:no-magic-numbers
    beforeEach(async(() => {
        componentSpyObj = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                MatChipsModule,
                MatFormFieldModule,
                MatInputModule,
                BrowserAnimationsModule,
                HttpClientTestingModule,
                MatSnackBarModule,
            ],
            declarations: [CarouselComponent, MatChipInput],
            providers: [
                { provide: MatDialog, useValue: componentSpyObj },
                { provide: MAT_CHIPS_DEFAULT_OPTIONS, useValue: {} },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('closeDialog should forward call to closeAll', () => {
        component.closeDialog();
        expect(componentSpyObj.closeAll).toHaveBeenCalled();
    });

    it('ngAfterViewInit should forward call to show and getDrawings if response is returned', () => {
        const showSpy = spyOn(component, 'show').and.stub();
        const observable = new Observable<Drawing[]>((observer) => observer.next(new Array<Drawing>()));
        spyOn(component.indexService, 'getDrawings').and.returnValue(observable);
        component.ngAfterViewInit();
        expect(showSpy).toHaveBeenCalledWith(component.loading);
        expect(component.loading).toEqual(component.loadingRef.nativeElement);
        expect(component.errorMessage).toEqual(component.errorMessageRef.nativeElement);
    });

    it('ngAfterViewInit should forward call to sendError if error occured', () => {
        const sendErrorSpy = spyOn(component, 'sendError').and.stub();
        const observable = new Observable<Drawing[]>((observer) => observer.error(new Error()));
        spyOn(component.indexService, 'getDrawings').and.returnValue(observable);
        component.ngAfterViewInit();
        expect(component.loading).toEqual(component.loadingRef.nativeElement);
        expect(component.errorMessage).toEqual(component.errorMessageRef.nativeElement);
        expect(sendErrorSpy).toHaveBeenCalled();
    });

    it('ngAfterViewInit should forward call to sendWarningMessage if complete', () => {
        const sendWarningMessageSpy = spyOn(component, 'sendWarningMessage').and.stub();
        const observable = new Observable<Drawing[]>((observer) => observer.complete());
        spyOn(component.indexService, 'getDrawings').and.returnValue(observable);
        component.ngAfterViewInit();
        expect(component.loading).toEqual(component.loadingRef.nativeElement);
        expect(component.errorMessage).toEqual(component.errorMessageRef.nativeElement);
        expect(sendWarningMessageSpy).toHaveBeenCalled();
    });

    it('keyDown should only call stopPropagation if event key is not ArrowLeft or ArrowRight', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['stopPropagation']);
        component.keyDown(event);
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('keyDown should call preventDefault and scrollDown if event key is ArrowLeft', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'ArrowLeft' });
        const scrollDownSpy = spyOn(component, 'scrollDown').and.stub();
        component.keyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(scrollDownSpy).toHaveBeenCalled();
    });

    it('keyDown should call preventDefault and scrollUp if event key is ArrowRight', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'ArrowRight' });
        const scrollUpSpy = spyOn(component, 'scrollUp').and.stub();
        component.keyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(scrollUpSpy).toHaveBeenCalled();
    });

    it('add should add tag if it is not already in tags and replace the value of input if input exists', () => {
        const event: MatChipInputEvent = { input: {} as HTMLInputElement, value: 'test' };
        event.input.value = 'testInput';
        const includesSpy = spyOn(component.tags, 'includes').and.stub();
        const pushSpy = spyOn(component.tags, 'push').and.stub();
        component.add(event);
        expect(includesSpy).toHaveBeenCalled();
        expect(pushSpy).toHaveBeenCalled();
        expect(event.input.value).toEqual('');
    });

    it('add should do nothing if value and input dont exist', () => {
        const event: MatChipInputEvent = {} as MatChipInputEvent;
        const includesSpy = spyOn(component.tags, 'includes').and.stub();
        const pushSpy = spyOn(component.tags, 'push').and.stub();
        component.add(event);
        expect(includesSpy).not.toHaveBeenCalled();
        expect(pushSpy).not.toHaveBeenCalled();
    });

    it('add shouldnt add a tag if it is already in tags', () => {
        const event: MatChipInputEvent = { input: {} as HTMLInputElement, value: 'test' };
        const includesSpy = spyOn(component.tags, 'includes').and.returnValue(true);
        const pushSpy = spyOn(component.tags, 'push').and.stub();
        component.add(event);
        expect(includesSpy).toHaveBeenCalled();
        expect(pushSpy).not.toHaveBeenCalled();
    });

    it('remove should do nothing if tag parameter is not found in tags', () => {
        const spliceSpy = spyOn(component.tags, 'splice').and.stub();
        const indexOfSpy = spyOn(component.tags, 'indexOf').and.stub();
        component.remove('test');
        expect(spliceSpy).not.toHaveBeenCalled();
        expect(indexOfSpy).toHaveBeenCalled();
    });

    it('remove should call splice if tag parameter is found in tags', () => {
        component.tags.push('test');
        const spliceSpy = spyOn(component.tags, 'splice').and.stub();
        component.remove('test');
        expect(spliceSpy).toHaveBeenCalled();
    });

    it('selectDrawing should do nothing if drawings.length is lower than 3', () => {
        component.drawings = [];
        const event = {} as MouseEvent;
        const carousel = document.createElement('HTMLDivElement') as HTMLDivElement;
        const scrollSpy = spyOn(carousel, 'scrollTo').and.stub();
        component.selectDrawing(event, carousel);
        expect(scrollSpy).not.toHaveBeenCalled();
    });

    it('selectDrawing should call to scrollTo if drawings.length is higher than 3', () => {
        component.drawings = new Array<Drawing>(4);
        const event = ({ target: { parentElement: { offsetLeft: 5 } as HTMLElement } as HTMLElement } as unknown) as MouseEvent;
        const carousel = document.createElement('HTMLDivElement') as HTMLDivElement;
        carousel.appendChild(document.createElement('LI'));
        carousel.appendChild(document.createElement('LI'));
        const scrollSpy = spyOn(carousel, 'scrollTo').and.stub();
        component.selectDrawing(event, carousel);
        // @ts-ignore
        expect(scrollSpy).toHaveBeenCalledWith(event.target.parentElement.offsetLeft - carousel.children[1].offsetLeft, 0);
    });

    it('scrollDown should call scrollTo if scrollLeft - previewWidth < 0', () => {
        component.previewWidth = 266;
        const carousel = document.createElement('HTMLDivElement') as HTMLDivElement;
        carousel.scrollTo(0, 0);
        const scrollSpy = spyOn(carousel, 'scrollTo').and.stub();
        component.scrollDown(carousel);
        expect(scrollSpy).toHaveBeenCalledWith(component.drawings.length * component.previewWidth, 0);
        expect(carousel.style.scrollBehavior).toEqual('initial');
    });

    it('scrollDown should call scrollTo if scrollLeft - previewWidth > 0', () => {
        component.previewWidth = 0;
        const carousel = document.createElement('HTMLDivElement') as HTMLDivElement;
        const scrollSpy = spyOn(carousel, 'scrollTo').and.stub();
        component.scrollDown(carousel);
        expect(scrollSpy).toHaveBeenCalledWith(carousel.scrollLeft - component.previewWidth, 0);
        expect(carousel.style.scrollBehavior).toEqual('smooth');
    });

    it('scrollUp should call scrollTo if scrollLeft + previewWidth < drawings.length - 3 * previewWidth', () => {
        component.previewWidth = 266;
        const carousel = document.createElement('HTMLDivElement') as HTMLDivElement;
        carousel.scrollTo(0, 0);
        const scrollSpy = spyOn(carousel, 'scrollTo').and.stub();
        component.scrollUp(carousel);
        expect(scrollSpy).toHaveBeenCalledWith(component.drawings.length * component.previewWidth, 0);
        expect(carousel.style.scrollBehavior).toEqual('initial');
    });

    it('scrollUp should call scrollTo if scrollLeft + previewWidth > drawings.length - 3 * previewWidth', () => {
        component.previewWidth = 0;
        const carousel = document.createElement('HTMLDivElement') as HTMLDivElement;
        const scrollSpy = spyOn(carousel, 'scrollTo').and.stub();
        component.scrollUp(carousel);
        expect(scrollSpy).toHaveBeenCalledWith(carousel.scrollLeft + component.previewWidth, 0);
        expect(carousel.style.scrollBehavior).toEqual('smooth');
    });

    it('searchDrawings should call hide and show if response is returned', () => {
        const hideSpy = spyOn(component, 'hide').and.stub();
        const showSpy = spyOn(component, 'show').and.stub();
        const observable = new Observable<Drawing[]>((observable) => observable.next(new Array<Drawing>()));
        spyOn(component.indexService, 'getDrawings').and.returnValue(observable);
        component.searchDrawings();
        expect(hideSpy).toHaveBeenCalledWith(component.errorMessage);
        expect(showSpy).toHaveBeenCalledWith(component.loading);
    });

    it('searchDrawings should call sendError if error occured', () => {
        const sendErrorSpy = spyOn(component, 'sendError').and.stub();
        const observable = new Observable<Drawing[]>((observer) => observer.error());
        spyOn(component.indexService, 'getDrawings').and.returnValue(observable);
        component.searchDrawings();
        expect(sendErrorSpy).toHaveBeenCalled();
    });

    it('searchDrawings should call sendError if complete', () => {
        const sendWarningMessageSpy = spyOn(component, 'sendWarningMessage').and.stub();
        const observable = new Observable<Drawing[]>((observer) => observer.complete());
        spyOn(component.indexService, 'getDrawings').and.returnValue(observable);
        component.searchDrawings();
        expect(sendWarningMessageSpy).toHaveBeenCalled();
    });

    it('tryOpeningDrawing should call show if annulerRefaire contains actions', () => {
        (document.activeElement as Element).id = 'drawing-card';
        component['annulerRefaireService'].undoActions.length = 1;
        const showSpy = spyOn(component, 'show').and.stub();
        component.tryOpeningDrawing();
        expect(showSpy).toHaveBeenCalledWith(component.confirm.nativeElement);
    });

    it('tryOpeningDrawing should call show if annulerRefaire contains actions', () => {
        (document.activeElement as Element).id = 'drawing-card';
        const openDrawingSpy = spyOn(component, 'openDrawing').and.stub();
        component.tryOpeningDrawing();
        expect(openDrawingSpy).toHaveBeenCalled();
    });

    it('tryOpeningDrawing should open snackbar if no drawing card selected', () => {
        (document.activeElement as Element).id = 'abc';
        const openSnackbarSpy = spyOn(component, 'openSnackbar').and.stub();
        component.tryOpeningDrawing();
        expect(openSnackbarSpy).toHaveBeenCalled();
    });

    it('openDrawings should forwards call resizeImage, drawImage, updateImageData and closeDialog', () => {
        const image = new Image();
        image.src = 'kess ommak';
        component.currentDrawing = { id: 'test', name: 'test', tags: ['test'], imageURL: 'kess ommak' } as Drawing;
        const canvas = document.createElement('canvas');
        component['drawingService'].canvas = document.createElement('canvas');
        component['drawingService'].baseCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const autoSaveSpy = spyOn(component['drawingService'], 'autoSave').and.stub();
        const resizeImageSpy = spyOn(component['resizerService'], 'resizeImage').and.stub();
        const drawImageSpy = spyOn(CanvasRenderingContext2D.prototype, 'drawImage').and.stub();
        const updateImageDataSpy = spyOn(component['annulerRefaireService'], 'updateImageData').and.stub();
        const closeDialogSpy = spyOn(component, 'closeDialog').and.stub();
        component.openDrawing();
        expect(resizeImageSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalledWith(image, 0, 0);
        expect(updateImageDataSpy).toHaveBeenCalled();
        expect(closeDialogSpy).toHaveBeenCalled();
        expect(autoSaveSpy).toHaveBeenCalled();
    });

    it('deleteOne should delete a drawing if there is a drawing selected and no server error', () => {
        (document.activeElement as Element).id = 'drawing-card';
        component.currentDrawing = new Drawing('test', 'test', [], 'test');
        const showSpy = spyOn(component, 'show').and.stub();
        const filterSpy = spyOn(component.drawings, 'filter').and.stub();
        const warningMessageSpy = spyOn(component, 'sendWarningMessage').and.stub();
        const observable = new Observable<void>((observer) => observer.complete());
        const removeSpy = spyOn(component.indexService, 'removeCanvas').and.returnValue(observable);
        component.deleteOne();
        expect(showSpy).toHaveBeenCalledWith(component.loading);
        expect(removeSpy).toHaveBeenCalledWith(component.currentDrawing.id);
        expect(filterSpy).toHaveBeenCalled();
        expect(warningMessageSpy).toHaveBeenCalled();
    });

    it('deleteOne should return response if subscribe return it', () => {
        (document.activeElement as Element).id = 'drawing-card';
        component.currentDrawing = new Drawing('test', 'test', [], 'test');
        const observable = new Observable<void>((observable) => observable.next());
        const removeSpy = spyOn(component.indexService, 'removeCanvas').and.returnValue(observable);
        component.deleteOne();
        expect(removeSpy).toHaveBeenCalledWith(component.currentDrawing.id);
    });

    it('deleteOne should send error if there is a drawing selected but a server error', () => {
        (document.activeElement as Element).id = 'drawing-card';
        component.currentDrawing = new Drawing('test', 'test', [], 'test');
        const showSpy = spyOn(component, 'show').and.stub();
        const sendErrorSpy = spyOn(component, 'sendError').and.stub();
        const observable = new Observable<void>((observer) => observer.error());
        const removeSpy = spyOn(component.indexService, 'removeCanvas').and.returnValue(observable);
        component.deleteOne();
        expect(showSpy).toHaveBeenCalledWith(component.loading);
        expect(removeSpy).toHaveBeenCalledWith(component.currentDrawing.id);
        expect(sendErrorSpy).toHaveBeenCalled();
    });

    it('deleteOne should open snackBar if there isnt any drawing selected', () => {
        (document.activeElement as Element).id = 'abc';
        const spySnackbar = spyOn(component, 'openSnackbar').and.stub();
        component.deleteOne();
        expect(spySnackbar).toHaveBeenCalled();
    });

    it('deleteAll should forward call to show if response is returned', () => {
        const showSpy = spyOn(component, 'show').and.stub();
        const hideSpy = spyOn(component, 'hide').and.stub();
        const observable = new Observable<void>((observer) => observer.next());
        spyOn(component.indexService, 'removeAllCanvas').and.returnValue(observable);
        component.deleteAll();
        expect(showSpy).toHaveBeenCalledWith(component.loading);
        expect(hideSpy).toHaveBeenCalledWith(component.errorMessage);
    });

    it('deleteAll should forward call to sendError if error occured', () => {
        const sendErrorSpy = spyOn(component, 'sendError').and.stub();
        const observable = new Observable<void>((observer) => observer.error());
        spyOn(component.indexService, 'removeAllCanvas').and.returnValue(observable);
        component.deleteAll();
        expect(sendErrorSpy).toHaveBeenCalled();
    });

    it('deleteAll should forward call to sendWarningMessage if complete', () => {
        const sendWarningMessageSpy = spyOn(component, 'sendWarningMessage').and.stub();
        const observable = new Observable<void>((observer) => observer.complete());
        spyOn(component.indexService, 'removeAllCanvas').and.returnValue(observable);
        component.deleteAll();
        expect(sendWarningMessageSpy).toHaveBeenCalled();
    });

    it(' show should set elem.style.display to flex', () => {
        const elem = { style: { display: 'none' } } as HTMLElement;
        component.show(elem);
        expect(elem.style.display).toEqual('flex');
    });

    it(' hide should set elem.style.display to none', () => {
        const elem = { style: { display: 'flex' } } as HTMLElement;
        component.hide(elem);
        expect(elem.style.display).toEqual('none');
    });

    it(' sendError should forwad call function hide, show and openSnackbar', () => {
        const error = {} as Error;
        const showSpy = spyOn(component, 'show').and.stub();
        const hideSpy = spyOn(component, 'hide').and.stub();
        const openSnackbarSpy = spyOn(component, 'openSnackbar').and.stub();
        component.sendError(error);
        expect(showSpy).toHaveBeenCalledWith(component.errorMessage);
        expect(hideSpy).toHaveBeenCalledWith(component.loading);
        expect(openSnackbarSpy).toHaveBeenCalledWith(error.message);
    });

    it(' sendWarningMessage should show an error message if drawgings length is 0', () => {
        component.drawings = [];
        const showSpy = spyOn(component, 'show').and.stub();
        const hideSpy = spyOn(component, 'hide').and.stub();
        component.sendWarningMessage();
        expect(component.message).toEqual("Vous n'avez aucun dessin sauvegardé");
        expect(hideSpy).toHaveBeenCalledWith(component.loading);
        expect(showSpy).toHaveBeenCalledWith(component.errorMessage);
    });

    it(' sendWarningMessage should hide error message if drawgings length is more than 0', () => {
        component.drawings = Array<Drawing>(3);
        const message = '';
        const showSpy = spyOn(component, 'show').and.stub();
        const hideSpy = spyOn(component, 'hide').and.stub();
        component.sendWarningMessage(message);
        expect(hideSpy).toHaveBeenCalledWith(component.errorMessage);
        expect(hideSpy).toHaveBeenCalledWith(component.loading);
        expect(hideSpy).toHaveBeenCalledTimes(2);
        expect(showSpy).not.toHaveBeenCalled();
    });

    it('openSnackBar should forwad call open', () => {
        const message = '';
        const openSpy = spyOn(component['snackBar'], 'open').and.stub();
        component.openSnackbar(message);
        expect(openSpy).toHaveBeenCalled();
    });
    // tslint:disable-next-line:max-file-line-count
});

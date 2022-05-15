import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChip, MatChipInput, MatChipInputEvent, MatChipsModule, MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Observable } from 'rxjs';
import { SaveDrawComponent } from './save-draw.component';

describe('SaveDrawComponent', () => {
    let component: SaveDrawComponent;
    let fixture: ComponentFixture<SaveDrawComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['closeAll']);
        TestBed.configureTestingModule({
            declarations: [SaveDrawComponent, MatChipInput, MatChip, MatFormField],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: MAT_CHIPS_DEFAULT_OPTIONS, useValue: {} },
                { provide: HttpClientModule, useValue: {} },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [
                ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
                FormsModule,
                ReactiveFormsModule,
                MatChipsModule,
                MatFormFieldModule,
                MatInputModule,
                BrowserAnimationsModule,
                HttpClientTestingModule,
                MatSnackBarModule,
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(SaveDrawComponent);
        component = fixture.componentInstance;
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        component.drawingService.canvas = canvasTestHelper.canvas;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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
        component.tags = ['allo', 'oui'];
        component.remove('test');
        expect(spliceSpy).not.toHaveBeenCalled();
    });

    it('remove should call splice if tag parameter is found in tags', () => {
        component.tags.push('test');
        const spliceSpy = spyOn(component.tags, 'splice').and.stub();
        component.remove('test');
        expect(spliceSpy).toHaveBeenCalled();
    });

    it('upload should forward do nothing if response returned', () => {
        const openSnackbarSpy = spyOn(component, 'openSnackbar').and.stub();
        const closeDialogSpy = spyOn(component, 'closeDialog').and.stub();
        const observable = new Observable<void>((observer) => observer.next());
        spyOn(component.indexService, 'uploadCanvas').and.returnValue(observable);
        component.uploadCanvas('test');
        expect(openSnackbarSpy).not.toHaveBeenCalled();
        expect(closeDialogSpy).not.toHaveBeenCalled();
    });

    it('upload should forward call to openSnackbar and closeDialog if error', () => {
        const openSnackbarSpy = spyOn(component, 'openSnackbar').and.stub();
        const closeDialogSpy = spyOn(component, 'closeDialog').and.stub();
        const observable = new Observable<void>((observer) => observer.error(new Error()));
        spyOn(component.indexService, 'uploadCanvas').and.returnValue(observable);
        component.uploadCanvas('test');
        expect(openSnackbarSpy).toHaveBeenCalled();
        expect(closeDialogSpy).toHaveBeenCalled();
    });

    it('upload should forward call to openSnackbar and closeDialog if complete', () => {
        const openSnackbarSpy = spyOn(component, 'openSnackbar').and.stub();
        const closeDialogSpy = spyOn(component, 'closeDialog').and.stub();
        const observable = new Observable<void>((observer) => observer.complete());
        spyOn(component.indexService, 'uploadCanvas').and.returnValue(observable);
        component.uploadCanvas('test');
        expect(openSnackbarSpy).toHaveBeenCalled();
        expect(closeDialogSpy).toHaveBeenCalled();
    });

    it('closeDialog should forward call to closeAll', () => {
        component.closeDialog();
        expect(dialogSpy.closeAll).toHaveBeenCalled();
    });

    it('openSnackbar should forward call to snackBar.open', () => {
        // tslint:disable:no-string-literal
        const openSpy = spyOn(component['snackBar'], 'open').and.stub();
        component.openSnackbar('test');
        expect(openSpy).toHaveBeenCalled();
    });
});

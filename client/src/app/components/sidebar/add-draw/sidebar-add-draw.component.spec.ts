import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SidebarAddDrawComponent } from './sidebar-add-draw.component';

// tslint:disable:no-string-literal
describe('SidebarAddDrawComponent', () => {
    let component: SidebarAddDrawComponent;
    let fixture: ComponentFixture<SidebarAddDrawComponent>;
    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let annulerRefaireServiceSpyObj: jasmine.SpyObj<AnnulerRefaireService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'removeSavedCanvas']);
        annulerRefaireServiceSpyObj = jasmine.createSpyObj('AnnulerRefaireService', ['updateImageData']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['closeAll']);
        TestBed.configureTestingModule({
            declarations: [SidebarAddDrawComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: DrawingService, useValue: drawingServiceSpyObj },
                { provide: AnnulerRefaireService, useValue: annulerRefaireServiceSpyObj },
                { provide: HttpClientModule, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarAddDrawComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        // tslint:disable:no-string-literal
        component['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        component['drawingService'].previewCtx = previewCtxStub;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('newDraw should forward call to clearCanvas and closeAll if createDraw is true', () => {
        const fillRectSpy = spyOn(baseCtxStub, 'fillRect').and.stub();
        const resizeSpy = spyOn(component['resizerService'], 'resizeImage').and.stub();
        // tslint:disable-next-line:no-magic-numbers
        component['drawingService'].canvas = ({ width: 300, height: 150 } as unknown) as HTMLCanvasElement;
        component.newDraw(true);
        // tslint:disable-next-line:no-magic-numbers
        expect(drawingServiceSpyObj.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        // tslint:disable-next-line:no-magic-numbers
        expect(fillRectSpy).toHaveBeenCalledWith(0, 0, 300, 150);
        expect(dialogSpy.closeAll).toHaveBeenCalled();
        expect(resizeSpy).toHaveBeenCalled();
        expect(drawingServiceSpyObj.removeSavedCanvas).toHaveBeenCalled();
    });

    it('newDraw should only forward call to closeAll if createDraw is false', () => {
        component.newDraw(false);
        expect(drawingServiceSpyObj.clearCanvas).not.toHaveBeenCalled();
        expect(dialogSpy.closeAll).toHaveBeenCalled();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectionEllipseComponent } from '@app/components/tools/selection/selection-ellipse/selection-ellipse.component';
import { SelectionRectangleComponent } from '@app/components/tools/selection/selection-rectangle/selection-rectangle.component';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizerService } from '@app/services/resizer/resizer.service';
import { SelectionRectangleService } from '@app/services/tools/selection/selection-rectangle.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';
import { SelectionComponent } from './selection.component';

// tslint:disable:no-any
describe('SelectionComponent', () => {
    let component: SelectionComponent;
    let fixture: ComponentFixture<SelectionComponent>;
    let toolSelectorSpy: jasmine.SpyObj<ToolSelectorService>;
    let annulerRefaireStub: AnnulerRefaireService;
    let drawingStub: DrawingService;
    let resizerServiceStub: ResizerService;

    beforeEach(async(() => {
        toolSelectorSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        drawingStub = new DrawingService();
        resizerServiceStub = new ResizerService(drawingStub);
        annulerRefaireStub = new AnnulerRefaireService(drawingStub, resizerServiceStub);
        TestBed.configureTestingModule({
            declarations: [SelectionComponent, SelectionEllipseComponent, SelectionRectangleComponent],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorSpy },
                { provide: AnnulerRefaireService, useValue: annulerRefaireStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('selectSelectionRectangle should call setTool of toolSelector', () => {
        const selectRectKey = 'r';
        component.selectSelectionRectangle();
        expect(toolSelectorSpy.setTool).toHaveBeenCalledWith(selectRectKey);
    });

    it('selectSelectionEllipse should call setTool of toolSelector', () => {
        const selectEllipseKey = 's';
        component.selectSelectionEllipse();
        expect(toolSelectorSpy.setTool).toHaveBeenCalledWith(selectEllipseKey);
    });

    it('selectSelectionLasso should call setTool of toolSelector', () => {
        const selectLassoKey = 'v';
        component.selectSelectionLasso();
        expect(toolSelectorSpy.setTool).toHaveBeenCalledWith(selectLassoKey);
    });

    it('undo should call undo of annulerRefaire', () => {
        const undoSpy = spyOn<any>(annulerRefaireStub, 'undo');
        component.undo();
        expect(undoSpy).toHaveBeenCalled();
    });

    it('redo should call redo of annulerRefaire', () => {
        const redoSpy = spyOn<any>(annulerRefaireStub, 'redo');
        component.redo();
        expect(redoSpy).toHaveBeenCalled();
    });

    it('selectAll should call setTool of toolSelector', () => {
        const selectRectKey = 'r';
        // tslint:disable-next-line:no-empty
        toolSelectorSpy.currentTool = { selectAll(): void {} } as SelectionRectangleService;
        const selectAllSpy = spyOn<any>(toolSelectorSpy.currentTool, 'selectAll');
        component.selectAll();
        expect(toolSelectorSpy.setTool).toHaveBeenCalledWith(selectRectKey);
        expect(selectAllSpy).toHaveBeenCalled();
    });
});

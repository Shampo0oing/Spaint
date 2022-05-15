import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { PencilComponent } from '@app/components/tools/pencil/pencil.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

// tslint:disable:no-any
// tslint:disable:no-string-literal
describe('PencilComponent', () => {
    let component: PencilComponent;
    let fixture: ComponentFixture<PencilComponent>;
    let toolSelectorServiceSpy: jasmine.SpyObj<ToolSelectorService>;
    let openParametreSpy: jasmine.Spy<any>;
    let closeParametreSpy: jasmine.Spy<any>;
    let drawingStub: DrawingService;
    let matSliderStub: MatSliderChange;
    const TEST_VALUE = 20;

    beforeEach(async(() => {
        toolSelectorServiceSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        drawingStub = new DrawingService();
        matSliderStub = {} as MatSliderChange;
        TestBed.configureTestingModule({
            declarations: [PencilComponent, MatSlider],
            imports: [FormsModule],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PencilComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' selectPencil should call setTool and openParametre', () => {
        component['popup'].style.display = 'none';

        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        spyOn<any>(component, 'getCurrentTool').and.callFake(() => {
            return 'pencil';
        });
        component.selectPencil();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).not.toHaveBeenCalled();
        expect(openParametreSpy).toHaveBeenCalled();
    });

    it(' selectPencil should call setTool and closeParametre', () => {
        component['popup'].style.display = 'block';
        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        component.selectPencil();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).toHaveBeenCalled();
        expect(openParametreSpy).not.toHaveBeenCalled();
    });

    it('changePencilWidthSlider should change pencilWidth and drawingService.pencilWidth', () => {
        matSliderStub.value = TEST_VALUE;
        component.changePencilWidthSlider(matSliderStub);
        expect(component.pencilWidth).toEqual(TEST_VALUE);
        expect(drawingStub.pencilWidth).toEqual(TEST_VALUE);
    });

    it('changePencilWidthSlider should change pencilWidth and drawingService.pencilWidth to 1 if value is 0', () => {
        matSliderStub.value = 0;
        component.changePencilWidthSlider(matSliderStub);
        expect(component.pencilWidth).toEqual(component.PENCIL_MIN_WIDTH);
        expect(drawingStub.pencilWidth).toEqual(component.PENCIL_MIN_WIDTH);
    });
});

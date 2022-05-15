import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { EraserComponent } from '@app/components/tools/eraser/eraser.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

// tslint:disable:no-any
// tslint:disable:no-string-literal
describe('EraserComponent', () => {
    let component: EraserComponent;
    let fixture: ComponentFixture<EraserComponent>;
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
            declarations: [EraserComponent, MatSlider],
            imports: [FormsModule],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EraserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' selectEraser should call setTool and openParametre', () => {
        component['popup'].style.display = 'none';

        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        spyOn<any>(component, 'getCurrentTool').and.callFake(() => {
            return 'eraser';
        });
        component.selectEraser();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).not.toHaveBeenCalled();
        expect(openParametreSpy).toHaveBeenCalled();
    });

    it(' selectEraser should call setTool and closeParametre', () => {
        component['popup'].style.display = 'block';
        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        component.selectEraser();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).toHaveBeenCalled();
        expect(openParametreSpy).not.toHaveBeenCalled();
    });

    it('changeEraserWidthSlider should change eraserWidth and drawingService.eraserWidth', () => {
        matSliderStub.value = TEST_VALUE;
        component.changeEraserWidthSlider(matSliderStub);
        expect(component.eraserWidth).toEqual(TEST_VALUE);
        expect(drawingStub.eraserWidth).toEqual(TEST_VALUE);
    });

    it('changeEraserWidthSlider should change eraserWidth and drawingService.eraserWidth to 1 if value is 0', () => {
        matSliderStub.value = 0;
        component.changeEraserWidthSlider(matSliderStub);
        expect(component.eraserWidth).toEqual(component.ERASER_MIN_WIDTH);
        expect(drawingStub.eraserWidth).toEqual(component.ERASER_MIN_WIDTH);
    });
});

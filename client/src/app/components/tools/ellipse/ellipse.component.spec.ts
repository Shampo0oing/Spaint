import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { EllipseComponent } from '@app/components/tools/ellipse/ellipse.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

// tslint:disable:no-any
// tslint:disable:no-string-literal
describe('PencilComponent', () => {
    let component: EllipseComponent;
    let fixture: ComponentFixture<EllipseComponent>;
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
            declarations: [EllipseComponent, MatSlider],
            imports: [FormsModule],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EllipseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' selectEllipse should call setTool and openParametre', () => {
        component['popup'].style.display = 'none';

        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        spyOn<any>(component, 'getCurrentTool').and.callFake(() => {
            return 'ellipse';
        });
        component.selectEllipse();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).not.toHaveBeenCalled();
        expect(openParametreSpy).toHaveBeenCalled();
    });

    it(' selectEllipse should call setTool and closeParametre', () => {
        component['popup'].style.display = 'block';
        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        component.selectEllipse();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).toHaveBeenCalled();
        expect(openParametreSpy).not.toHaveBeenCalled();
    });

    it('changeTraceType should change drawingService.traceTypeEllipse', () => {
        component.changeTraceType(2);
        expect(drawingStub.traceTypeEllipse).toEqual(2);
    });

    it('changeEllipseWidthSlider should change ellipseWidth and drawingService.ellipseWidth', () => {
        matSliderStub.value = TEST_VALUE;
        component.changeEllipseWidthSlider(matSliderStub);
        expect(component.ellipseWidth).toEqual(TEST_VALUE);
        expect(drawingStub.ellipseWidth).toEqual(TEST_VALUE);
    });

    it('changeEllipseWidthSlider should change ellipseWidth and drawingService.ellipseWidth to 1 if value is 0', () => {
        matSliderStub.value = 0;
        component.changeEllipseWidthSlider(matSliderStub);
        expect(component.ellipseWidth).toEqual(component.ELLIPSE_MIN_WIDTH);
        expect(drawingStub.ellipseWidth).toEqual(component.ELLIPSE_MIN_WIDTH);
    });
});

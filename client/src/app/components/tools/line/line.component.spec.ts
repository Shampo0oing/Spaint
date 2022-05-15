import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { LineComponent } from '@app/components/tools/line/line.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

// tslint:disable:no-any
// tslint:disable:no-string-literal
describe('LineComponent', () => {
    let component: LineComponent;
    let fixture: ComponentFixture<LineComponent>;
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
            declarations: [LineComponent, MatSlider],
            imports: [FormsModule],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LineComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it(' selectLine should call setTool and openParametre', () => {
        component['popup'].style.display = 'none';

        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        spyOn<any>(component, 'getCurrentTool').and.callFake(() => {
            return 'line';
        });
        component.selectLine();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).not.toHaveBeenCalled();
        expect(openParametreSpy).toHaveBeenCalled();
    });

    it(' selectLine should call setTool and closeParametre', () => {
        component['popup'].style.display = 'block';
        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        component.selectLine();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).toHaveBeenCalled();
        expect(openParametreSpy).not.toHaveBeenCalled();
    });

    it('changeLineWidthSlider should change lineWidth and drawingService.lineWidth', () => {
        matSliderStub.value = TEST_VALUE;
        component.changeLineWidthSlider(matSliderStub);
        expect(component.lineWidth).toEqual(TEST_VALUE);
        expect(drawingStub.lineWidth).toEqual(TEST_VALUE);
    });

    it('changeLineWidthSlider should change lineWidth and drawingService.lineWidth to 1 if value is 0', () => {
        matSliderStub.value = 0;
        component.changeLineWidthSlider(matSliderStub);
        expect(component.lineWidth).toEqual(component.LINE_MIN_WIDTH);
        expect(drawingStub.lineWidth).toEqual(component.LINE_MIN_WIDTH);
    });

    it('changePointWidthSlider should change pointWidth and drawingService.pointWidth', () => {
        matSliderStub.value = TEST_VALUE;
        component.changePointWidthSlider(matSliderStub);
        expect(component.pointWidth).toEqual(TEST_VALUE);
        expect(drawingStub.pointWidth).toEqual(TEST_VALUE);
    });

    it('changePointWidthSlider should change pointWidth and drawingService.pointWidth to 1 if value is 0', () => {
        matSliderStub.value = 0;
        component.changePointWidthSlider(matSliderStub);
        expect(component.pointWidth).toEqual(component.POINT_MIN_WIDTH);
        expect(drawingStub.pointWidth).toEqual(component.POINT_MIN_WIDTH);
    });

    it('changeJunctionType should change drawingService.junctionType', () => {
        component.changeJunctionType(2);
        expect(drawingStub.junctionType).toEqual(2);
    });
});

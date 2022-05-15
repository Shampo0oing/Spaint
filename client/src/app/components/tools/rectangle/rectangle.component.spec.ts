import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { Tool } from '@app/classes/tool';
import { RectangleComponent } from '@app/components/tools/rectangle/rectangle.component';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

class ToolStub extends Tool {
    getCurrentToolString(): string {
        return 'rectangle';
    }
}

// tslint:disable:no-any
// tslint:disable:no-string-literal
describe('RectangleComponent', () => {
    let component: RectangleComponent;
    let fixture: ComponentFixture<RectangleComponent>;
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
            declarations: [RectangleComponent, MatSlider],
            imports: [FormsModule],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RectangleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' selectRectangle should call setTool and openParametre', () => {
        component['popup'].style.display = 'none';

        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        spyOn<any>(component, 'getCurrentTool').and.callFake(() => {
            return 'rectangle';
        });
        component.selectRectangle();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).not.toHaveBeenCalled();
        expect(openParametreSpy).toHaveBeenCalled();
    });

    it(' selectRectangle should call setTool and closeParametre', () => {
        component['popup'].style.display = 'block';
        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        component.selectRectangle();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).toHaveBeenCalled();
        expect(openParametreSpy).not.toHaveBeenCalled();
    });

    it('changeTraceType should change drawingService.traceTypeRectangle', () => {
        component.changeTraceType(2);
        expect(drawingStub.traceTypeRectangle).toEqual(2);
    });

    it('changeRectangleWidthSlider should change rectangleWidth and drawingService.rectangleWidth', () => {
        matSliderStub.value = TEST_VALUE;
        component.changeRectangleWidthSlider(matSliderStub);
        expect(component.rectangleWidth).toEqual(TEST_VALUE);
        expect(drawingStub.rectangleWidth).toEqual(TEST_VALUE);
    });

    it('changeRectangleWidthSlider should change rectangleWidth and drawingService.rectangleWidth to 1 if value is 0', () => {
        matSliderStub.value = 0;
        component.changeRectangleWidthSlider(matSliderStub);
        expect(component.rectangleWidth).toEqual(component.RECTANGLE_MIN_WIDTH);
        expect(drawingStub.rectangleWidth).toEqual(component.RECTANGLE_MIN_WIDTH);
    });

    it(' closeParametre should set popup display proprety to none', () => {
        component.closeParametre();
        expect(component['popup']?.style.display).toEqual('none');
    });

    it(' openParametre should set popup display proprety to block', () => {
        component.openParametre();
        expect(component['popup']?.style.display).toEqual('block');
    });

    it(' getCurrentTool should return vide', () => {
        const toolStub: ToolStub = new ToolStub(drawingStub, {} as AnnulerRefaireService);
        toolSelectorServiceSpy.currentTool = toolStub;
        expect(component.getCurrentTool()).toEqual('rectangle');
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { PolygonComponent } from '@app/components/tools/polygon/polygon.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';
// tslint:disable: no-magic-numbers
// tslint:disable:no-string-literal
describe('PolygonComponent', () => {
    let component: PolygonComponent;
    let fixture: ComponentFixture<PolygonComponent>;
    let toolSelectorServiceSpy: jasmine.SpyObj<ToolSelectorService>;
    let drawingStub: DrawingService;
    let matSliderStub: MatSliderChange;

    beforeEach(async(() => {
        toolSelectorServiceSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        drawingStub = new DrawingService();
        matSliderStub = {} as MatSliderChange;
        TestBed.configureTestingModule({
            declarations: [PolygonComponent, MatSlider],
            imports: [FormsModule],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PolygonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('selectPolygon should call setTool and closeParametre if display of popup isnt none', () => {
        component['popup'].style.display = 'none';
        const openParametreSpy = spyOn(component, 'openParametre').and.stub();
        const closeParametreSpy = spyOn(component, 'closeParametre').and.stub();

        // tslint:disable-next-line:no-any
        spyOn<any>(component, 'getCurrentTool').and.callFake(() => {
            return 'polygon';
        });
        component.selectPolygon();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).not.toHaveBeenCalled();
        expect(openParametreSpy).toHaveBeenCalled();
    });

    it('selectPolygon should call setTool and closeParametre if display of popup isnt none', () => {
        component['popup'].style.display = 'block';
        const openParametreSpy = spyOn(component, 'openParametre').and.stub();
        const closeParametreSpy = spyOn(component, 'closeParametre').and.stub();
        component.selectPolygon();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).toHaveBeenCalled();
        expect(openParametreSpy).not.toHaveBeenCalled();
    });

    it('changeTraceType should set traceTypePolygon based on the value passed in parameter', () => {
        // tslint:disable-next-line: variable-name
        const number = 1;
        component.changeTraceType(number);
        expect(drawingStub.traceTypePolygon).toEqual(number);
    });

    it('changePolygonEdgeSlider should change edge and drawingService.numberOfEdges', () => {
        matSliderStub.value = 6;
        component.changePolygonEdgeSlider(matSliderStub);
        expect(component.numberOfEdges).toEqual(6);
        expect(drawingStub.numberOfEdges).toEqual(6);
    });

    it('changePolygonEdgeSlider should change edge and drawingService.numberOfEdges to 1 if value is 0', () => {
        matSliderStub.value = 0;
        component.changePolygonEdgeSlider(matSliderStub);
        expect(component.numberOfEdges).toEqual(component.POLYGON_MIN_EDGE);
        expect(drawingStub.numberOfEdges).toEqual(component.POLYGON_MIN_EDGE);
    });

    it('changePolygonWidthSlider should change polygonWidth and drawingService.polygonWidth', () => {
        matSliderStub.value = 30;
        component.changePolygonWidthSlider(matSliderStub);
        expect(component.polygonWidth).toEqual(30);
        expect(drawingStub.polygonWidth).toEqual(30);
    });

    it('changePolygonWidthSlider should change polygonWidth and drawingService.polygonWidth to 1 if value is 0', () => {
        matSliderStub.value = 0;
        component.changePolygonWidthSlider(matSliderStub);
        expect(component.polygonWidth).toEqual(component.POLYGON_MIN_WIDTH);
        expect(drawingStub.polygonWidth).toEqual(component.POLYGON_MIN_WIDTH);
    });
});

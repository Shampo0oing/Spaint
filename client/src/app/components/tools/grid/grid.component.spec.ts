import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GridComponent } from '@app/components/tools/grid/grid.component';
import { MagnetismComponent } from '@app/components/tools/magnetism/magnetism.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

// tslint:disable:no-any
// tslint:disable:no-string-literal
describe('GridComponent', () => {
    let component: GridComponent;
    let fixture: ComponentFixture<GridComponent>;
    let openParametreSpy: jasmine.Spy<any>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let toolSelectorServiceSpy: jasmine.SpyObj<ToolSelectorService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let matSliderStub: MatSliderChange;
    let matSliderToggleStub: MatSlideToggleChange;
    let canvasTestHelper: CanvasTestHelper;
    const TEST_VALUE = 50;

    beforeEach(async(() => {
        toolSelectorServiceSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        matSliderStub = {} as MatSliderChange;
        matSliderToggleStub = {} as MatSlideToggleChange;

        TestBed.configureTestingModule({
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
            ],
            declarations: [GridComponent, MatSlider, MatSlideToggle, MagnetismComponent],
            imports: [FormsModule, MatRippleModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridComponent);
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

    it(' selectGrid should call openParametre', () => {
        component['popup'].style.display = 'none';
        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        component.selectGrid();

        expect(openParametreSpy).toHaveBeenCalled();
    });

    it(' selectGrid should not call closeParametre', () => {
        component['popup'].style.display = 'block';
        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        component.selectGrid();

        expect(openParametreSpy).not.toHaveBeenCalled();
    });

    it('changeSquareSizeSlider should change drawingService.squareSize', () => {
        matSliderStub.value = TEST_VALUE;
        component.changeSquareSizeSlider(matSliderStub);
        expect(drawingServiceSpy.squareSize).toEqual(TEST_VALUE);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('changeSquareSizeSlider should change drawingService.squareSize to 20 if value lower then 20', () => {
        matSliderStub.value = 0;
        component.changeSquareSizeSlider(matSliderStub);
        expect(drawingServiceSpy.squareSize).toEqual(component.SQUARE_MIN_SIZE);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('changeOpacitySlider should change drawingService.opacity', () => {
        matSliderStub.value = TEST_VALUE;
        component.changeOpacitySlider(matSliderStub);
        expect(drawingServiceSpy.opacity).toEqual(TEST_VALUE);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('changeOpacitySlider should change drawingService.opacity to 20 if value lower then 20', () => {
        matSliderStub.value = 0;
        component.changeOpacitySlider(matSliderStub);
        expect(drawingServiceSpy.opacity).toEqual(component.OPACITY_MIN);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('toggle should change drawingService.showGrid and call clearCanvas', () => {
        matSliderToggleStub.checked = false;
        component.toggle(matSliderToggleStub);
        expect(drawingServiceSpy.showGrid).toEqual(false);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
    });
});

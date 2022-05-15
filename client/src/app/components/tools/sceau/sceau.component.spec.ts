import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';
import { SceauComponent } from './sceau.component';
// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers
describe('SceauComponent', () => {
    let component: SceauComponent;
    let fixture: ComponentFixture<SceauComponent>;
    let toolSelectorServiceSpy: jasmine.SpyObj<ToolSelectorService>;
    let drawingStub: DrawingService;
    let matSliderStub: MatSliderChange;

    beforeEach(async(() => {
        toolSelectorServiceSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        drawingStub = new DrawingService();
        matSliderStub = {} as MatSliderChange;
        TestBed.configureTestingModule({
            declarations: [SceauComponent, MatSlider],
            imports: [FormsModule],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SceauComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('selectSceau should call setTool and openParametre if display of popup is none', () => {
        // tslint:disable: no-string-literal
        component['popup'].style.display = 'none';
        const openParametreSpy = spyOn(component, 'openParametre').and.stub();
        const closeParametreSpy = spyOn(component, 'closeParametre').and.stub();
        component.selectSceau();
        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(openParametreSpy).toHaveBeenCalled();
        expect(closeParametreSpy).not.toHaveBeenCalled();
    });

    it('selectSceau should call closeParametre if display of popup is none', () => {
        component['popup'].style.display = 'block';
        const openParametreSpy = spyOn(component, 'openParametre').and.stub();
        const closeParametreSpy = spyOn(component, 'closeParametre').and.stub();
        component.selectSceau();
        expect(openParametreSpy).not.toHaveBeenCalled();
        expect(closeParametreSpy).toHaveBeenCalled();
    });

    it('changeTolEcartSlider should change tolEcart', () => {
        matSliderStub.value = 50;
        component.changeTolEcartSlider(matSliderStub);
        expect(drawingStub.tolEcart).toEqual(50);
    });

    it('changeTolEcartSlider should change tolEcart to 0 if value is null', () => {
        matSliderStub.value = null;
        component.changeTolEcartSlider(matSliderStub);
        expect(drawingStub.tolEcart).toEqual(0);
    });
});

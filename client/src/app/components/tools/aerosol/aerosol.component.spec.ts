import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { AerosolComponent } from '@app/components/tools/aerosol/aerosol.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

// tslint:disable: no-empty
// tslint:disable: no-magic-numbers
// tslint:disable:no-string-literal
describe('AerosolComponent', () => {
    let component: AerosolComponent;
    let fixture: ComponentFixture<AerosolComponent>;
    let toolSelectorServiceSpy: jasmine.SpyObj<ToolSelectorService>;
    let drawingStub: DrawingService;
    let matSliderStub: MatSliderChange;

    beforeEach(async(() => {
        toolSelectorServiceSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        drawingStub = new DrawingService();
        matSliderStub = {} as MatSliderChange;
        TestBed.configureTestingModule({
            declarations: [AerosolComponent, MatSlider],
            imports: [FormsModule],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AerosolComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('selectAerosol should call setTool and openParametre if display of popup is none', () => {
        component['popup'].style.display = 'none';
        const openParametreSpy = spyOn(component, 'openParametre').and.stub();
        const closeParametreSpy = spyOn(component, 'closeParametre').and.stub();
        // tslint:disable-next-line:no-any
        spyOn<any>(component, 'getCurrentTool').and.callFake(() => {
            return 'aerosol';
        });
        component.selectAerosol();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).not.toHaveBeenCalled();
        expect(openParametreSpy).toHaveBeenCalled();
    });

    it('selectAerosol should call setTool and closeParametre if display of popup isnt none', () => {
        component['popup'].style.display = 'block';
        const openParametreSpy = spyOn(component, 'openParametre').and.stub();
        const closeParametreSpy = spyOn(component, 'closeParametre').and.stub();
        component.selectAerosol();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).toHaveBeenCalled();
        expect(openParametreSpy).not.toHaveBeenCalled();
    });

    it('changeEmissionSlider should change emission and drawingService.emission', () => {
        matSliderStub.value = 200;
        component.changeEmissionSlider(matSliderStub);
        expect(component.emission).toEqual(200);
        expect(drawingStub.emission).toEqual(200);
    });

    it('changeEmissionSlider should change emission and drawingService.emission to 1 if value is 0', () => {
        matSliderStub.value = 0;
        component.changeEmissionSlider(matSliderStub);
        expect(component.emission).toEqual(component.AEROSOL_MIN_EMISSION);
        expect(drawingStub.emission).toEqual(component.AEROSOL_MIN_EMISSION);
    });

    it('changeSpraySlider should change sprayDiameter and drawingService.sprayDiameter', () => {
        matSliderStub.value = 30;
        component.changeSpraySlider(matSliderStub);
        expect(component.sprayDiameter).toEqual(30);
        expect(drawingStub.sprayDiameter).toEqual(30);
    });

    it('changeSpraySlider should change sprayDiameter and drawingService.sprayDiameter to 1 if value is 0', () => {
        matSliderStub.value = 0;
        component.changeSpraySlider(matSliderStub);
        expect(component.sprayDiameter).toEqual(component.AEROSOL_MIN_SPRAY);
        expect(drawingStub.sprayDiameter).toEqual(component.AEROSOL_MIN_SPRAY);
    });

    it('changeDropletSlider should change dropletDiameter and drawingService.dropletDiameter', () => {
        matSliderStub.value = 3;
        component.changeDropletSlider(matSliderStub);
        expect(component.dropletDiameter).toEqual(3);
        expect(drawingStub.dropletDiameter).toEqual(3);
    });

    it('changeDropletSlider should change dropletDIameter and drawingService.dropletDiameter to 1 if value is 0', () => {
        matSliderStub.value = 0;
        component.changeDropletSlider(matSliderStub);
        expect(component.dropletDiameter).toEqual(component.AEROSOL_MIN_DROPLET);
        expect(drawingStub.dropletDiameter).toEqual(component.AEROSOL_MIN_DROPLET);
    });
});

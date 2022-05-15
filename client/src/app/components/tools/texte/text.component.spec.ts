import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';
import { TextComponent } from './text.component';

// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
describe('TextComponent', () => {
    let component: TextComponent;
    let fixture: ComponentFixture<TextComponent>;
    let toolSelectorServiceSpy: jasmine.SpyObj<ToolSelectorService>;
    let drawingStub: DrawingService;
    let matSliderStub: MatSliderChange;

    beforeEach(async(() => {
        toolSelectorServiceSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        drawingStub = new DrawingService();
        matSliderStub = {} as MatSliderChange;
        TestBed.configureTestingModule({
            declarations: [TextComponent, MatSlider],
            imports: [FormsModule],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('selectText should call setTool and closeParametre if display of popup isnt none', () => {
        component['popup'].style.display = 'none';
        const openParametreSpy = spyOn(component, 'openParametre').and.stub();
        const closeParametreSpy = spyOn(component, 'closeParametre').and.stub();
        component.selectText();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).not.toHaveBeenCalled();
        expect(openParametreSpy).toHaveBeenCalled();
    });

    it('selectText should call setTool and closeParametre if display of popup isnt none', () => {
        component['popup'].style.display = 'block';
        const openParametreSpy = spyOn(component, 'openParametre').and.stub();
        const closeParametreSpy = spyOn(component, 'closeParametre').and.stub();
        component.selectText();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).toHaveBeenCalled();
        expect(openParametreSpy).not.toHaveBeenCalled();
    });

    it('changePoliceSizeSlider should change policeSize and drawingService.policeSize', () => {
        matSliderStub.value = 6;
        component.textService.writing = false;
        component.changePoliceSizeSlider(matSliderStub);
        expect(component.policeSize).toEqual(6);
        expect(drawingStub.policeSize).toEqual(6);
    });

    it('changePoliceSizeSlider should change policeSize and call writeAllText and putTextIndicator if writing is true', () => {
        matSliderStub.value = 6;
        component.textService.writing = true;
        const writeAllTextSpy = spyOn(component.textService, 'writeAllText').and.stub();
        const putTextIndicatorSpy = spyOn(component.textService, 'putTextIndicator').and.stub();
        component.changePoliceSizeSlider(matSliderStub);
        expect(component.policeSize).toEqual(6);
        expect(drawingStub.policeSize).toEqual(6);
        expect(writeAllTextSpy).toHaveBeenCalled();
        expect(putTextIndicatorSpy).toHaveBeenCalled();
    });

    it('changePoliceSizeSlider should change policeSize and drawingService.policeSize', () => {
        matSliderStub.value = 0;
        component.textService.writing = false;
        component.changePoliceSizeSlider(matSliderStub);
        expect(component.policeSize).toEqual(component.POLICE_MIN_SIZE);
        expect(drawingStub.policeSize).toEqual(component.POLICE_MIN_SIZE);
    });

    it('changeFont should change drawingService.policeSize', () => {
        component.textService.writing = false;
        component.changeFont('Arial');
        expect(drawingStub.font).toEqual('Arial');
    });

    it('changeFont should change drawingService.policeSize and call writeAllText and putTextIndicator if writing is true', () => {
        component.textService.writing = true;
        const writeAllTextSpy = spyOn(component.textService, 'writeAllText').and.stub();
        const putTextIndicatorSpy = spyOn(component.textService, 'putTextIndicator').and.stub();
        component.changeFont('Arial');
        expect(drawingStub.font).toEqual('Arial');
        expect(writeAllTextSpy).toHaveBeenCalled();
        expect(putTextIndicatorSpy).toHaveBeenCalled();
    });

    it('changeFontStyle should change drawingService.policeSize', () => {
        component.textService.writing = false;
        component.changeFontStyle('Bold');
        expect(drawingStub.fontStyle).toEqual('Bold');
    });

    it('changeFontStyle should change drawingService.policeSize and call writeAllText and putTextIndicator if writing is true', () => {
        component.textService.writing = true;
        const writeAllTextSpy = spyOn(component.textService, 'writeAllText').and.stub();
        const putTextIndicatorSpy = spyOn(component.textService, 'putTextIndicator').and.stub();
        component.changeFontStyle('Bold');
        expect(drawingStub.fontStyle).toEqual('Bold');
        expect(writeAllTextSpy).toHaveBeenCalled();
        expect(putTextIndicatorSpy).toHaveBeenCalled();
    });

    it('changeAllign should change drawingService.policeSize', () => {
        component.textService.writing = false;
        drawingStub.textAlign = 'center';
        component.changeAlign(drawingStub.textAlign);
        expect(drawingStub.textAlign).toEqual('center');
    });

    it('changeAllign should change drawingService.policeSize', () => {
        component.textService.writing = true;
        const writeAllTextSpy = spyOn(component.textService, 'writeAllText').and.stub();
        const putTextIndicatorSpy = spyOn(component.textService, 'putTextIndicator').and.stub();
        drawingStub.textAlign = 'center';
        component.changeAlign(drawingStub.textAlign);
        expect(drawingStub.textAlign).toEqual('center');
        expect(writeAllTextSpy).toHaveBeenCalled();
        expect(putTextIndicatorSpy).toHaveBeenCalled();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSlider } from '@angular/material/slider';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';
import { StampComponent } from './stamp.component';
// tslint:disable: no-string-literal
// tslint:disable:no-any
describe('StampComponent', () => {
    let component: StampComponent;
    let fixture: ComponentFixture<StampComponent>;

    let toolSelectorServiceSpy: jasmine.SpyObj<ToolSelectorService>;
    let openParametreSpy: jasmine.Spy<any>;
    let closeParametreSpy: jasmine.Spy<any>;
    let drawingStub: DrawingService;

    beforeEach(async(() => {
        toolSelectorServiceSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        drawingStub = new DrawingService();
        TestBed.configureTestingModule({
            declarations: [StampComponent, MatSlider],
            imports: [FormsModule],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StampComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' selectStamp should call setTool and openParametre', () => {
        component['popup'].style.display = 'none';

        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        spyOn<any>(component, 'getCurrentTool').and.callFake(() => {
            return 'stampe';
        });
        component.selectStamp();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).not.toHaveBeenCalled();
        expect(openParametreSpy).toHaveBeenCalled();
    });

    it(' selectStamp should call setTool and closeParametre', () => {
        component['popup'].style.display = 'block';
        openParametreSpy = spyOn<any>(component, 'openParametre').and.stub();
        closeParametreSpy = spyOn<any>(component, 'closeParametre').and.stub();
        component.selectStamp();

        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
        expect(closeParametreSpy).toHaveBeenCalled();
        expect(openParametreSpy).not.toHaveBeenCalled();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PIPETTE_KEY } from '@app/classes/constantes';
import { PipetteComponent } from './pipette.component';

describe('PipetteComponent', () => {
    let component: PipetteComponent;
    let fixture: ComponentFixture<PipetteComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PipetteComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PipetteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('setPipette should forward call to setTool and openParametre if display is none', () => {
        const setToolSpy = spyOn(component.toolSelector, 'setTool').and.stub();
        const openParametreSpy = spyOn(component, 'openParametre').and.stub();
        component.popupHtml.nativeElement.style.display = 'none';
        // tslint:disable-next-line:no-any
        spyOn<any>(component, 'getCurrentTool').and.callFake(() => {
            return 'pipette';
        });
        component.selectPipette();
        expect(setToolSpy).toHaveBeenCalledWith(PIPETTE_KEY);
        expect(openParametreSpy).toHaveBeenCalled();
    });

    it('setPipette should forward call to closeParametre if display is not none', () => {
        const setToolSpy = spyOn(component.toolSelector, 'setTool').and.stub();
        const closeParametreSpy = spyOn(component, 'closeParametre').and.stub();
        component.popupHtml.nativeElement.style.display = 'block';
        component.selectPipette();
        expect(setToolSpy).toHaveBeenCalledWith(PIPETTE_KEY);
        expect(closeParametreSpy).toHaveBeenCalled();
    });
});

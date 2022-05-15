import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectionEllipseComponent } from './selection-ellipse.component';

describe('SelectionEllipseComponent', () => {
    let component: SelectionEllipseComponent;
    let fixture: ComponentFixture<SelectionEllipseComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SelectionEllipseComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionEllipseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

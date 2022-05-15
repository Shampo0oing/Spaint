import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionLassoComponent } from './selection-lasso.component';

describe('SelectionLassoComponent', () => {
    let component: SelectionLassoComponent;
    let fixture: ComponentFixture<SelectionLassoComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SelectionLassoComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionLassoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

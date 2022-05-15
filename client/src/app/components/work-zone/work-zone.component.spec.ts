import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { ResizableComponent } from '@app/components/resizable/resizable.component';
import { SelectionEllipseComponent } from '@app/components/tools/selection/selection-ellipse/selection-ellipse.component';
import { SelectionLassoComponent } from '@app/components/tools/selection/selection-lasso/selection-lasso.component';
import { SelectionRectangleComponent } from '@app/components/tools/selection/selection-rectangle/selection-rectangle.component';
import { TextBoxComponent } from '@app/components/tools/texte/textBox/texte-box/text-box.component';
import { WorkZoneComponent } from '@app/components/work-zone/work-zone.component';

describe('WorkZoneComponent', () => {
    let component: WorkZoneComponent;
    let fixture: ComponentFixture<WorkZoneComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                WorkZoneComponent,
                DrawingComponent,
                ResizableComponent,
                SelectionRectangleComponent,
                SelectionEllipseComponent,
                SelectionLassoComponent,
                TextBoxComponent,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkZoneComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSlider } from '@angular/material/slider';
import { MatTab } from '@angular/material/tabs';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { EditorComponent } from '@app/components/editor/editor.component';
import { ResizableComponent } from '@app/components/resizable/resizable.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AerosolComponent } from '@app/components/tools/aerosol/aerosol.component';
import { ColorPaletteComponent } from '@app/components/tools/color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from '@app/components/tools/color-picker/color-picker.component';
import { ColorSliderComponent } from '@app/components/tools/color-picker/color-slider/color-slider.component';
import { EllipseComponent } from '@app/components/tools/ellipse/ellipse.component';
import { EraserComponent } from '@app/components/tools/eraser/eraser.component';
import { LineComponent } from '@app/components/tools/line/line.component';
import { MagnetismComponent } from '@app/components/tools/magnetism/magnetism.component';
import { PencilComponent } from '@app/components/tools/pencil/pencil.component';
import { PipetteComponent } from '@app/components/tools/pipette/pipette.component';
import { PolygonComponent } from '@app/components/tools/polygon/polygon.component';
import { RectangleComponent } from '@app/components/tools/rectangle/rectangle.component';
import { SelectionEllipseComponent } from '@app/components/tools/selection/selection-ellipse/selection-ellipse.component';
import { SelectionLassoComponent } from '@app/components/tools/selection/selection-lasso/selection-lasso.component';
import { SelectionRectangleComponent } from '@app/components/tools/selection/selection-rectangle/selection-rectangle.component';
import { SelectionComponent } from '@app/components/tools/selection/selection.component';
import { WorkZoneComponent } from '@app/components/work-zone/work-zone.component';

describe('EditorComponent', () => {
    let component: EditorComponent;
    let fixture: ComponentFixture<EditorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                EditorComponent,
                DrawingComponent,
                SidebarComponent,
                ColorPickerComponent,
                ColorPaletteComponent,
                RectangleComponent,
                EllipseComponent,
                LineComponent,
                PencilComponent,
                EraserComponent,
                MatSlider,
                WorkZoneComponent,
                ResizableComponent,
                ColorSliderComponent,
                AerosolComponent,
                PipetteComponent,
                SelectionRectangleComponent,
                SelectionEllipseComponent,
                SelectionLassoComponent,
                SelectionComponent,
                PolygonComponent,
                MagnetismComponent,
                MatSlider,
                MatTab,
                MatIcon,
            ],
            imports: [FormsModule],
            providers: [{ provide: MatDialog, useValue: {} }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

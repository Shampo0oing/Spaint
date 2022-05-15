import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { ResizableComponent } from './components/resizable/resizable.component';
import { SidebarAddDrawComponent } from './components/sidebar/add-draw/sidebar-add-draw.component';
import { CarouselComponent } from './components/sidebar/carousel/carousel.component';
import { ExportDialogComponent } from './components/sidebar/export-drawing/export-dialog.component';
import { SaveDrawComponent } from './components/sidebar/save-draw/save-draw.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AerosolComponent } from './components/tools/aerosol/aerosol.component';
import { ClipboardComponent } from './components/tools/clipboard/clipboard.component';
import { ColorPaletteComponent } from './components/tools/color-picker/color-palette/color-palette.component';
import { ColorPickerComponent } from './components/tools/color-picker/color-picker.component';
import { ColorSliderComponent } from './components/tools/color-picker/color-slider/color-slider.component';
import { EllipseComponent } from './components/tools/ellipse/ellipse.component';
import { EraserComponent } from './components/tools/eraser/eraser.component';
import { GenericToolComponent } from './components/tools/generic-tool/generic-tool.component';
import { GridComponent } from './components/tools/grid/grid.component';
import { LineComponent } from './components/tools/line/line.component';
import { MagnetismComponent } from './components/tools/magnetism/magnetism.component';
import { PencilComponent } from './components/tools/pencil/pencil.component';
import { PipetteComponent } from './components/tools/pipette/pipette.component';
import { PolygonComponent } from './components/tools/polygon/polygon.component';
import { RectangleComponent } from './components/tools/rectangle/rectangle.component';
import { SceauComponent } from './components/tools/sceau/sceau.component';
import { SelectionEllipseComponent } from './components/tools/selection/selection-ellipse/selection-ellipse.component';
import { SelectionLassoComponent } from './components/tools/selection/selection-lasso/selection-lasso.component';
import { SelectionRectangleComponent } from './components/tools/selection/selection-rectangle/selection-rectangle.component';
import { SelectionComponent } from './components/tools/selection/selection.component';
import { StampComponent } from './components/tools/stamp/stamp.component';
import { TextComponent } from './components/tools/texte/text.component';
import { TextBoxComponent } from './components/tools/texte/textBox/texte-box/text-box.component';
import { WorkZoneComponent } from './components/work-zone/work-zone.component';
import { MaterialModule } from './material.module';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        PencilComponent,
        EraserComponent,
        SidebarAddDrawComponent,
        LineComponent,
        WorkZoneComponent,
        ColorPickerComponent,
        ColorPaletteComponent,
        ColorSliderComponent,
        RectangleComponent,
        EllipseComponent,
        ResizableComponent,
        GenericToolComponent,
        PipetteComponent,
        PolygonComponent,
        AerosolComponent,
        SelectionComponent,
        SelectionRectangleComponent,
        SelectionEllipseComponent,
        ExportDialogComponent,
        SaveDrawComponent,
        CarouselComponent,
        GridComponent,
        ClipboardComponent,
        MagnetismComponent,
        SceauComponent,
        SelectionLassoComponent,
        StampComponent,
        TextComponent,
        TextBoxComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        BrowserAnimationsModule,
        MaterialModule,
        MatTabsModule,
        MatSelectModule,
        MatInputModule,
        MatRippleModule,
        ClipboardModule,
    ],
    exports: [MatTabsModule],
    providers: [],
    bootstrap: [AppComponent],
    entryComponents: [ExportDialogComponent, SidebarAddDrawComponent],
})
export class AppModule {}

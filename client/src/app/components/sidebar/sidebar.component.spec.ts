import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSlider } from '@angular/material/slider';
import { MatTab } from '@angular/material/tabs';
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
import { SelectionRectangleComponent } from '@app/components/tools/selection/selection-rectangle/selection-rectangle.component';
import { SelectionComponent } from '@app/components/tools/selection/selection.component';
import { Subject } from 'rxjs';
// tslint:disable:no-magic-numbers
// tslint:disable:no-string-literal
describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let componentSpyObj: jasmine.SpyObj<MatDialog>;

    beforeEach(async(() => {
        componentSpyObj = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        TestBed.configureTestingModule({
            declarations: [
                SidebarComponent,
                ColorPickerComponent,
                ColorPaletteComponent,
                ColorSliderComponent,
                RectangleComponent,
                EllipseComponent,
                LineComponent,
                PencilComponent,
                EraserComponent,
                AerosolComponent,
                PipetteComponent,
                SelectionRectangleComponent,
                SelectionEllipseComponent,
                SelectionComponent,
                PolygonComponent,
                MagnetismComponent,
                MatSlider,
                MatTab,
                MatIcon,
            ],
            imports: [FormsModule],
            providers: [{ provide: MatDialog, useValue: componentSpyObj }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('keyDown should forward call to preventDefault and openDialog if event has not been called once', () => {
        const openDialogSpy = spyOn(component, 'openDialog').and.stub();
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'o', ctrlKey: true });
        component['callOnce'] = false;
        component.keyDown(event);
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('keyDown should not forward call to preventDefault and openDialog if callOnce is true', () => {
        const openDialogSpy = spyOn(component, 'openDialog').and.stub();
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'o', ctrlKey: true });
        component['callOnce'] = true;
        component.keyDown(event);
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(openDialogSpy).not.toHaveBeenCalled();
    });

    it('keyDown should forward call to preventDefault and openDialog if Ctrl + E and callOnce is false', () => {
        const openDialogSpy = spyOn(component, 'openDialog').and.stub();
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'e', ctrlKey: true });
        component['callOnce'] = false;
        component.keyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(openDialogSpy).toHaveBeenCalled();
    });

    it('keyDown should do nothing if Ctrl + E or Ctrl + O are not pressed', () => {
        const openDialogSpy = spyOn(component, 'openDialog').and.stub();
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation']);
        component.keyDown(event);
        expect(openDialogSpy).not.toHaveBeenCalled();
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('keyDown should not forward call to openDialog if Ctrl + E is pressed but callOnce is true', () => {
        const openDialogSpy = spyOn(component, 'openDialog').and.stub();
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'e', ctrlKey: true });
        component['callOnce'] = true;
        component.keyDown(event);
        expect(openDialogSpy).not.toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('keyDown should forward call to preventDefault if Ctrl + S is pressed but callOnce is true', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 's', ctrlKey: true });
        component['callOnce'] = true;
        component.keyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('keyDown should forward call to openDialog if Ctrl + S is pressed and callOnce is false', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 's', ctrlKey: true });
        const openDialogSpy = spyOn(component, 'openDialog').and.stub();
        component['callOnce'] = false;
        component.keyDown(event);
        expect(openDialogSpy).toHaveBeenCalledWith(2);
    });

    it('keyDown should forward call to preventDefault if Ctrl + G is pressed and callOnce is true', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'g', ctrlKey: true });
        component['callOnce'] = true;
        component.keyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('keyDown should forward call to openDialog if Ctrl + G is pressed and callOnce is false', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault', 'stopPropagation'], { key: 'g', ctrlKey: true });
        const openDialogSpy = spyOn(component, 'openDialog').and.stub();
        component['callOnce'] = false;
        component.keyDown(event);
        expect(openDialogSpy).toHaveBeenCalledWith(3);
    });

    it('onContextMenu should forward call to preventDefault', () => {
        const event = jasmine.createSpyObj('KeyboardEvent', ['preventDefault']);
        component.onContextMenu(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it(' openDialog should forward call to dialogOpen and afterClosed().subscribe and update callOnce value if isExport is 0', () => {
        const afterClosedSpy = jasmine.createSpyObj('MatDialogRef<SidebarAddDrawComponent,any>', ['afterClosed']);
        const dialogClosed = new Subject();
        component['callOnce'] = true;
        componentSpyObj.open.and.returnValue(afterClosedSpy);
        afterClosedSpy.afterClosed.and.returnValue(dialogClosed);
        component.openDialog(0);
        expect(afterClosedSpy.afterClosed).toHaveBeenCalled();
        dialogClosed.next();
        expect(component['callOnce']).toBeFalse();
    });

    it(' openDialog should forward call to dialogOpen if isExport is 1', () => {
        component.openDialog(1);
        expect(componentSpyObj.open).toHaveBeenCalled();
    });

    it(' openDialog should forward call to dialogOpen if isExport is 2', () => {
        component.openDialog(2);
        expect(componentSpyObj.open).toHaveBeenCalled();
    });

    it(' openDialog should forward call to dialogOpen if isExport is 3', () => {
        component.openDialog(3);
        expect(componentSpyObj.open).toHaveBeenCalled();
    });

    it(' closeAllColorPickers should update children popup style display', () => {
        const arrayChildren = [
            {
                children: [
                    {
                        children: {
                            popup: {
                                style: {
                                    display: 'block',
                                },
                            },
                        },
                    },
                ],
                tagName: 'DIV',
            },
            {
                children: [
                    {
                        children: {
                            popup: {
                                style: {
                                    display: 'block',
                                },
                            },
                        },
                    },
                ],
                tagName: 'DIV',
            },
        ];
        // @ts-ignore
        component.colorPickers = { nativeElement: { children: [{ children: arrayChildren }] } };
        component.closeAllColorPickers();
        expect(component.colorPickers.nativeElement.children[0].children[0].children[0].children.popup.style.display).toEqual('none');
    });
    it(' closeAllColorPickers should update children popup style display', () => {
        const arrayChildren = [
            {
                children: [
                    {
                        children: {
                            popup: {
                                style: {
                                    display: 'block',
                                },
                            },
                        },
                    },
                ],
                tagName: 'SPAN',
            },
            {
                children: [
                    {
                        children: {
                            popup: {
                                style: {
                                    display: 'block',
                                },
                            },
                        },
                    },
                ],
                tagName: 'SPAN',
            },
        ];
        component.colorPickers = { nativeElement: { children: [{ children: arrayChildren }] } };
        component.closeAllColorPickers();
        expect(component.colorPickers.nativeElement.children[0].children[0].children[0].children.popup.style.display).toEqual('block');
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Tool } from '@app/classes/tool';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ClipboardService } from '@app/services/tools/selection/clipboard.service';
import { SelectionRectangleService } from '@app/services/tools/selection/selection-rectangle.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';
import { ClipboardComponent } from './clipboard.component';

// tslint:disable:no-empty
// tslint:disable:no-string-literal
// tslint:disable:no-any
class ToolStub extends Tool {
    getCurrentToolString(): string {
        return 'toolStub';
    }
    copy(): void {}
    paste(): void {}
    delete(): void {}
    cut(): void {}
}

describe('ClipboardComponent', () => {
    let component: ClipboardComponent;
    let fixture: ComponentFixture<ClipboardComponent>;
    let toolSelectorServiceSpy: jasmine.SpyObj<ToolSelectorService>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionRectangleServiceSpy: jasmine.SpyObj<SelectionRectangleService>;
    let clipboardServiceSpy: jasmine.SpyObj<ClipboardService>;
    let toolStub: ToolStub;

    beforeEach(async(() => {
        toolStub = new ToolStub({} as DrawingService, {} as AnnulerRefaireService);
        toolSelectorServiceSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        selectionRectangleServiceSpy = jasmine.createSpyObj('SelectionRectangleService', ['copy']);
        clipboardServiceSpy = jasmine.createSpyObj('ClipboardService', ['copy', 'isEmpty']);

        TestBed.configureTestingModule({
            declarations: [ClipboardComponent],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: SelectionRectangleService, useValue: selectionRectangleServiceSpy },
                { provide: ClipboardService, useValue: clipboardServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClipboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' openClipBoard should change the popup display to block', () => {
        component['popup'].style.display = 'none';
        component.openClipBoard();

        expect(component['popup'].style.display).toEqual('block');
    });

    it(' closeClipBoard should change the popup display to none', () => {
        component['popup'].style.display = 'block';
        component.closeClipBoard();

        expect(component['popup'].style.display).toEqual('none');
    });

    it(' copy should call copy of toolStub', () => {
        toolSelectorServiceSpy.currentTool = toolStub;
        const copySpy = spyOn<any>(toolStub, 'copy');
        component.copy();

        expect(copySpy).toHaveBeenCalled();
    });

    it(' paste should call paste of toolStub and setTool of toolSelectorService', () => {
        toolSelectorServiceSpy.currentTool = toolStub;
        const pasteSpy = spyOn<any>(toolStub, 'paste');
        component.paste();

        expect(pasteSpy).toHaveBeenCalled();
        expect(toolSelectorServiceSpy.setTool).toHaveBeenCalled();
    });

    it(' delete should call delete of toolStub', () => {
        toolSelectorServiceSpy.currentTool = toolStub;
        const deleteSpy = spyOn<any>(toolStub, 'delete');
        component.delete();

        expect(deleteSpy).toHaveBeenCalled();
    });

    it(' cut should call cut of toolStub', () => {
        toolSelectorServiceSpy.currentTool = toolStub;
        const cutSpy = spyOn<any>(toolStub, 'cut');
        component.cut();

        expect(cutSpy).toHaveBeenCalled();
    });
});

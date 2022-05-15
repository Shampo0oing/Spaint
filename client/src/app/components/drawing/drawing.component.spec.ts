import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { ResizableComponent } from '@app/components/resizable/resizable.component';
import { SelectionEllipseComponent } from '@app/components/tools/selection/selection-ellipse/selection-ellipse.component';
import { SelectionLassoComponent } from '@app/components/tools/selection/selection-lasso/selection-lasso.component';
import { SelectionRectangleComponent } from '@app/components/tools/selection/selection-rectangle/selection-rectangle.component';
import { TextBoxComponent } from '@app/components/tools/texte/textBox/texte-box/text-box.component';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizerService } from '@app/services/resizer/resizer.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

// tslint:disable:no-any
// tslint:disable:no-empty
// tslint:disable: no-shadowed-variable
// tslint:disable:no-string-literal
// tslint:disable:no-magic-numbers
// tslint:disable:max-file-line-count
class ToolStub extends Tool {
    getCurrentToolString(): string {
        return 'toolStub';
    }
    selectAll(): void {}
    paste(): void {}
    onClickRight(event: MouseEvent): void {}
    clearPath(): void {}
    onScrollDown(): void {}
    onScrollUp(): void {}
}
describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolStub: ToolStub;
    let drawingStub: DrawingService;
    let resizerServiceStub: ResizerService;
    let annulerRefaireStub: AnnulerRefaireService;
    let toolSelectorServiceSpy: jasmine.SpyObj<ToolSelectorService>;
    beforeEach(async(() => {
        toolStub = new ToolStub({} as DrawingService, {} as AnnulerRefaireService);
        drawingStub = new DrawingService();
        resizerServiceStub = new ResizerService(drawingStub);
        annulerRefaireStub = new AnnulerRefaireService(drawingStub, resizerServiceStub);
        toolSelectorServiceSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        TestBed.configureTestingModule({
            declarations: [
                DrawingComponent,
                ResizableComponent,
                SelectionRectangleComponent,
                SelectionEllipseComponent,
                SelectionLassoComponent,
                TextBoxComponent,
            ],
            providers: [
                { provide: DrawingService, useValue: drawingStub },
                { provide: AnnulerRefaireService, useValue: annulerRefaireStub },
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
            ],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        component.currentTool = toolStub;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should have a default WIDTH and HEIGHT', () => {
        const height = component.height;
        const width = component.width;
        expect(height).toEqual(DEFAULT_HEIGHT);
        expect(width).toEqual(DEFAULT_WIDTH);
    });
    it('should get stubTool', () => {
        const currentTool = component.currentTool;
        expect(currentTool).toEqual(toolStub);
    });
    it(' should call the tool s mouse move when receiving a mouse move event', () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn<any>(toolStub, 'onMouseMove').and.callThrough();
        component.onMouseMove(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
    it(' should call the tool s mouse down when receiving a mouse down event', () => {
        const event = { button: 0, preventDefault: {} } as MouseEvent;
        spyOn<any>(event, 'preventDefault').and.stub();
        const mouseEventSpy = spyOn<any>(toolStub, 'onMouseDown').and.callThrough();
        component.onMouseDown(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
    it(' should call the tool s mouse down when receiving a mouse down empty event', () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn<any>(toolStub, 'onMouseDown').and.callThrough();
        component.onMouseDown(event);
        expect(mouseEventSpy).not.toHaveBeenCalledWith(event);
    });
    it(' should call the tool s mouse up when receiving a mouse up event', () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn<any>(toolStub, 'onMouseUp').and.callThrough();
        component.onMouseUp(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
    it(' should call the tool s double click when receiving a double click event', () => {
        const mouseEventSpy = spyOn<any>(toolStub, 'onDoubleClick').and.callThrough();
        component.onDoubleClick();
        expect(mouseEventSpy).toHaveBeenCalled();
    });
    it(' should call the tool s click when receiving a click event', () => {
        const event = { button: 0 } as MouseEvent;
        const mouseEventSpy = spyOn<any>(toolStub, 'onClick').and.callThrough();
        component.onClick(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
    it(' should not call setTool when a dialog is open', () => {
        const event = {} as KeyboardEvent;
        component['drawingService'].dialogOpen = true;
        component.keyDown(event);
        expect(toolSelectorServiceSpy.setTool).not.toHaveBeenCalled();
    });
    it(' keyDown should not call setTool of toolSelector when ctrl key is pressed', () => {
        const event = { ctrlKey: true } as KeyboardEvent;
        component.keyDown(event);
        expect(toolSelectorServiceSpy.setTool).not.toHaveBeenCalled();
    });
    it(' should call the tool s ShiftDown when shift is pressed', () => {
        const event = { key: 'Shift' } as KeyboardEvent;
        const keyboardEventSpy = spyOn<any>(toolStub, 'shiftDown').and.callThrough();
        component.keyDown(event);
        expect(keyboardEventSpy).toHaveBeenCalled();
    });
    it('keyDown should call the tool s deleteDown when Delete is pressed', () => {
        const event = { key: 'Delete' } as KeyboardEvent;
        const keyboardEventSpy = spyOn<any>(toolStub, 'deleteDown').and.callThrough();
        component.keyDown(event);
        expect(keyboardEventSpy).toHaveBeenCalled();
    });
    it('keyDown should call the tool s deleteDown when Enter is pressed', () => {
        const event = { key: 'Enter' } as KeyboardEvent;
        const keyboardEventSpy = spyOn<any>(toolStub, 'enterDown').and.callThrough();
        component.keyDown(event);
        expect(keyboardEventSpy).toHaveBeenCalled();
    });
    it(' should call the tool s ShiftUp when shift is relessed', () => {
        const event = { key: 'Shift', preventDefault: {} } as KeyboardEvent;
        spyOn<any>(event, 'preventDefault').and.stub();
        const keyboardEventSpy = spyOn<any>(toolStub, 'shiftUp').and.callThrough();
        component.keyUp(event);
        expect(keyboardEventSpy).toHaveBeenCalled();
    });
    it(' scroll should call scrollDown of currentTool if delatY is positive', () => {
        const event = { deltaY: 50 } as WheelEvent;
        const onScrollDownSpy = spyOn<any>(toolStub, 'onScrollDown').and.callThrough();
        component.scroll(event);
        expect(onScrollDownSpy).toHaveBeenCalled();
    });
    it(' scroll should call scrollUp of currentTool if delatY is negative', () => {
        const event = { deltaY: -50 } as WheelEvent;
        const onScrollUpSpy = spyOn<any>(toolStub, 'onScrollUp').and.callThrough();
        component.scroll(event);
        expect(onScrollUpSpy).toHaveBeenCalled();
    });
    it(' should call the tool s escapeDown when escape is pressed', () => {
        const event = { key: 'Escape' } as KeyboardEvent;
        const keyboardEventSpy = spyOn<any>(toolStub, 'escapeDown').and.callThrough();
        component.keyDown(event);
        expect(keyboardEventSpy).toHaveBeenCalled();
    });
    it(' keyDown should call the tool s backspaceDown when backspace is pressed', () => {
        const event = { key: 'Backspace' } as KeyboardEvent;
        const keyboardEventSpy = spyOn<any>(toolStub, 'backspaceDown').and.callThrough();
        component.keyDown(event);
        expect(keyboardEventSpy).toHaveBeenCalled();
    });
    it(' keyUp should not call the tool s shiftUp when a buton other than shift is released', () => {
        const event = { key: 'Backspace', preventDefault: {} } as KeyboardEvent;
        spyOn<any>(event, 'preventDefault').and.stub();
        const keyboardEventSpy = spyOn<any>(toolStub, 'shiftUp').and.callThrough();
        component.keyUp(event);
        expect(keyboardEventSpy).not.toHaveBeenCalled();
    });
    it(' onClick should not call the tool s click when receiving a click event that is not a left click', () => {
        const event = { button: 1 } as MouseEvent;
        const mouseEventSpy = spyOn<any>(toolStub, 'onClick').and.callThrough();
        component.onClick(event);
        expect(mouseEventSpy).not.toHaveBeenCalledWith(event);
    });
    it(' onContextMenu should forward call to onClickRight when event is click right', () => {
        const event = { preventDefault(): void {} } as MouseEvent;
        const mouseEventSpy = spyOn(toolStub, 'onClickRight').and.callThrough();
        component.onContextMenu(event);
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });
    it(' clipboardAndUndo should call undo of annulerRefaireService when ctrl + z are clicked', () => {
        const event = { key: 'z', ctrlKey: true, preventDefault(): void {} } as KeyboardEvent;
        const undoSpy = spyOn<any>(annulerRefaireStub, 'undo');
        component.clipboardAndUndo(event);
        expect(undoSpy).toHaveBeenCalled();
    });
    it(' clipboardAndUndo should call undo and clearPath of toolstub when ctrl + z are clicked and currentTool is lasso', () => {
        const event = { key: 'z', ctrlKey: true, preventDefault(): void {} } as KeyboardEvent;
        const undoSpy = spyOn<any>(annulerRefaireStub, 'undo');
        toolSelectorServiceSpy.currentTool = toolStub;
        const getCurrentToolStringSpy = spyOn<any>(toolStub, 'getCurrentToolString');
        getCurrentToolStringSpy.and.callFake(() => 'selectionLasso');
        const clearPathSpy = spyOn<any>(toolStub, 'clearPath');
        component.clipboardAndUndo(event);
        expect(undoSpy).toHaveBeenCalled();
        expect(clearPathSpy).toHaveBeenCalled();
    });
    it(' clipboardAndUndo should call redo of annulerRefaireService when ctrl + shift + z are clicked', () => {
        const event = { key: 'Z', ctrlKey: true, preventDefault(): void {} } as KeyboardEvent;
        const redoSpy = spyOn<any>(annulerRefaireStub, 'redo');
        component.clipboardAndUndo(event);
        expect(redoSpy).toHaveBeenCalled();
    });
    it(' clipboardAndUndo should call selectAll when ctrl + a are clicked', () => {
        toolSelectorServiceSpy.currentTool = toolStub;
        const selectAllSpy = spyOn<any>(toolStub, 'selectAll');
        const event = { key: 'a', ctrlKey: true, preventDefault(): void {} } as KeyboardEvent;
        component.clipboardAndUndo(event);
        expect(selectAllSpy).toHaveBeenCalled();
    });
    it(' clipboardAndUndo should call selectAll when ctrl + v are clicked', () => {
        toolSelectorServiceSpy.currentTool = toolStub;
        const pasteSpy = spyOn<any>(toolStub, 'paste');
        const event = { key: 'v', ctrlKey: true, preventDefault(): void {} } as KeyboardEvent;
        component.clipboardAndUndo(event);
        expect(pasteSpy).toHaveBeenCalled();
    });
    it(' gridAndMagnetism should change the value of drawingService.showGrid if the key clicked is g', () => {
        drawingStub.showGrid = false;
        const dummyElement = document.createElement('app-grid');
        dummyElement.setAttribute('id', 'gridComponent');
        document.getElementById = jasmine.createSpy('HTMLElement').and.returnValue(dummyElement);
        const event = { key: 'g' } as KeyboardEvent;
        component.gridAndMagnetism(event);
        expect(drawingStub.showGrid).toEqual(true);
    });
    it(' gridAndMagnetism should switch the value of drawingService.useMagnetism when m is pressed', () => {
        drawingStub.useMagnetism = true;
        const event = { key: 'm', preventDefault(): void {} } as KeyboardEvent;
        const dummyElement = document.createElement('app-grid');
        dummyElement.setAttribute('id', 'gridComponent');
        document.getElementById = jasmine.createSpy('HTMLElement').and.returnValue(dummyElement);
        component.gridAndMagnetism(event);
        expect(drawingStub.useMagnetism).toEqual(false);
    });
    it(' gridAndMagnetism should call validateSquareSize and increase squareSize if the key pressed is + to the next multiple of 5', () => {
        const testValue = 52;
        const expectedResult = 55;
        const validateSquareSizeSpy = spyOn<any>(component, 'validateSquareSize');
        drawingStub.squareSize = testValue;
        const event = { key: '+', preventDefault(): void {} } as KeyboardEvent;
        component.gridAndMagnetism(event);
        expect(validateSquareSizeSpy).toHaveBeenCalled();
        expect(drawingStub.squareSize).toEqual(expectedResult);
    });
    it(' gridAndMagnetism should call validateSquareSize and decrease squareSize if the key pressed is - to the next multiple of 5', () => {
        const testValue = 52;
        const expectedResult = 50;
        const validateSquareSizeSpy = spyOn<any>(component, 'validateSquareSize');
        drawingStub.squareSize = testValue;
        const event = { key: '-', preventDefault(): void {} } as KeyboardEvent;
        component.gridAndMagnetism(event);
        expect(validateSquareSizeSpy).toHaveBeenCalled();
        expect(drawingStub.squareSize).toEqual(expectedResult);
    });
    it(' onContextMenu should call onClickRight if its true', () => {
        const onClickRightSpy = spyOn<any>(toolStub, 'onClickRight');
        const event = { preventDefault(): void {} } as MouseEvent;
        component.onContextMenu(event);
        expect(onClickRightSpy).toHaveBeenCalledWith(event);
    });
    it(' validateSquareSize should call clearCanvas and change drawingService.squareSize to 20 if its lower then 20', () => {
        const testValue = 15;
        const expectedResult = 20;
        drawingStub.squareSize = testValue;
        const clearCanvasSpy = spyOn<any>(drawingStub, 'clearCanvas');
        component.validateSquareSize();
        expect(clearCanvasSpy).toHaveBeenCalled();
        expect(drawingStub.squareSize).toEqual(expectedResult);
    });
    it(' validateSquareSize should call clearCanvas and change drawingService.squareSize to 100 if its higher then 100', () => {
        const testValue = 150;
        const expectedResult = 100;
        drawingStub.squareSize = testValue;
        const clearCanvasSpy = spyOn<any>(drawingStub, 'clearCanvas');
        component.validateSquareSize();
        expect(clearCanvasSpy).toHaveBeenCalled();
        expect(drawingStub.squareSize).toEqual(expectedResult);
    });
    it(' openSavedCanvas should call resizeImage and drawImage if there is a savedCanvas', async () => {
        const getSavedCanvasSpy = spyOn(component['drawingService'], 'getSavedCanvas').and.returnValue('awd');
        const resizeImageSpy = spyOn(component['resizerService'], 'resizeImage').and.stub();
        const decodeSpy = spyOn(HTMLImageElement.prototype, 'decode').and.stub();
        const drawImageSpy = spyOn(component['baseCtx'], 'drawImage').and.stub();
        await component.openSavedCanvas();
        expect(getSavedCanvasSpy).toHaveBeenCalled();
        expect(decodeSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(resizeImageSpy).toHaveBeenCalled();
    });
    it(' openSavedCanvas should return if getSavedCanvas doesnt return canvas', async () => {
        const getSavedCanvasSpy = spyOn(component['drawingService'], 'getSavedCanvas').and.stub();
        const resizeImageSpy = spyOn(component['resizerService'], 'resizeImage').and.stub();
        const decodeSpy = spyOn(HTMLImageElement.prototype, 'decode').and.stub();
        const drawImageSpy = spyOn(component['baseCtx'], 'drawImage').and.stub();
        await component.openSavedCanvas();
        expect(getSavedCanvasSpy).toHaveBeenCalled();
        expect(await decodeSpy).not.toHaveBeenCalled();
        expect(drawImageSpy).not.toHaveBeenCalled();
        expect(resizeImageSpy).not.toHaveBeenCalled();
    });
});

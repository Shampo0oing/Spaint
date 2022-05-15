import { TestBed } from '@angular/core/testing';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from './tool-selector.service';

export class ToolStub extends Tool {
    name: string;
    getCurrentToolString(): string {
        return 'toolStub';
    }
}

// tslint:disable:no-any
describe('ToolSelectorService', () => {
    let service: ToolSelectorService;
    const pencilServiceSpy: ToolStub = { name: 'pencil' } as ToolStub;
    const rectangleServiceSpy: ToolStub = { name: 'rectangle' } as ToolStub;
    const ellipseServiceSpy: ToolStub = { name: 'ellipse' } as ToolStub;
    const eraserServiceSpy: ToolStub = { name: 'eraser' } as ToolStub;
    const lineServiceSpy: ToolStub = { name: 'line' } as ToolStub;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let dummyElement: HTMLCanvasElement;

    beforeEach(() => {
        dummyElement = document.createElement('canvas');
        document.getElementById = jasmine.createSpy('HTMLCanvasElement').and.returnValue(dummyElement);
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(ToolSelectorService);
        service.tools = [pencilServiceSpy, eraserServiceSpy, ellipseServiceSpy, rectangleServiceSpy, lineServiceSpy];
        service.currentTool = service.tools[0];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be able to select pencil', () => {
        service.setTool('c');
        expect(service.currentTool).toEqual(pencilServiceSpy);
    });

    it('should be able to select eraser', () => {
        service.setTool('e');
        expect(service.currentTool).toEqual(eraserServiceSpy);
    });

    it('should be able to select rectangle', () => {
        service.setTool('1');
        expect(service.currentTool).toEqual(rectangleServiceSpy);
    });

    it('should be able to select line', () => {
        service.setTool('l');
        expect(service.currentTool).toEqual(lineServiceSpy);
    });

    it('should be able to select ellipse', () => {
        service.setTool('2');
        expect(service.currentTool).toEqual(ellipseServiceSpy);
    });

    it('should hide the crosshair when selecting the eraser', () => {
        const hideCrosshairSpy = spyOn<any>(service, 'hideCrosshair').and.callThrough();
        service.setTool('e');
        expect(hideCrosshairSpy).toHaveBeenCalled();
    });

    it('should show the crosshair when selecting a tool other than the eraser while having it selected', () => {
        const showCrosshairSpy = spyOn<any>(service, 'showCrosshair').and.callThrough();
        service.setTool('e');
        expect(dummyElement.classList.contains('NoCrosshair')).toEqual(true);
        service.setTool('c');
        expect(showCrosshairSpy).toHaveBeenCalled();
        expect(dummyElement.classList.contains('NoCrosshair')).toEqual(false);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(drawingServiceSpy.previewCtx);
    });

    it('should not change tool if the key sent was not in the list of possible tools', () => {
        service.setTool('9');
        expect(service.currentTool).toEqual(service.tools[0]);
    });

    it('should not add the class NoCrosshair if it was already there', () => {
        service.setTool('e');
        service.setTool('e');
        expect(dummyElement.classList.value).toEqual('NoCrosshair');
    });

    it(' setTool should call clickedElseWhere if currentTool is an SelectionService', () => {
        spyOn<any>(service, 'isSelectionService').and.returnValue(true);
        const toolSpy: jasmine.SpyObj<Tool> = jasmine.createSpyObj('Tool', ['clickedElseWhere']);
        service.currentTool = toolSpy;
        service.setTool('e');
        expect(toolSpy.clickedElseWhere).toHaveBeenCalled();
    });
});

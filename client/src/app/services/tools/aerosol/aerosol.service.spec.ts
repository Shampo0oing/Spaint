import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/components/resizable/resizable.component';
import { AerosolService } from './aerosol.service';
// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers

describe('AerosolService', () => {
    let service: AerosolService;
    let mouseEvent: MouseEvent;

    let drawingServiceSpyObj: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;

    let baseCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawingServiceSpyObj = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        TestBed.configureTestingModule({
            providers: [{ provide: Window }, { provide: DrawingService, useValue: drawingServiceSpyObj }],
        });
        service = TestBed.inject(AerosolService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' onMouseDown should update timeOut and forward call setInterval and sprayPaint', () => {
        jasmine.clock().install();
        const sprayPaintSpy = spyOn(service, 'sprayPaint').and.stub();
        service['drawingService'].emission = 10;
        service.onMouseDown();
        jasmine.clock().tick(100);
        expect(sprayPaintSpy).toHaveBeenCalledWith(baseCtxStub);
        jasmine.clock().uninstall();
    });

    it(' onMouseMove should update lastMousePos', () => {
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.stub();
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(service['lastMousePos']).toEqual(getPositionFromMouseSpy(mouseEvent));
    });

    it(' onMouseUp should call clearInterval', () => {
        drawingServiceSpyObj.mouseDown = true;
        service['timer'] = 2;
        const clearIntervalSpy = spyOn(window, 'clearInterval').and.stub();
        service.onMouseUp();
        expect(clearIntervalSpy).toHaveBeenCalledWith(service['timer']);
    });

    it(' onMouseUp should remain false if it was initially false', () => {
        drawingServiceSpyObj.mouseDown = false;
        service.onMouseUp();
        expect(drawingServiceSpyObj.mouseDown).toBeFalse();
    });

    it(' sprayPaint should call beginPath, arc and fill', () => {
        drawingServiceSpyObj.dropletDiameter = 2;
        drawingServiceSpyObj.sprayDiameter = 20;
        service['lastMousePos'] = { x: 10, y: 10 };
        const beginPathSpy = spyOn(baseCtxStub, 'beginPath').and.stub();
        const arcSpy = spyOn(baseCtxStub, 'arc').and.stub();
        const fillSpy = spyOn(baseCtxStub, 'fill').and.stub();
        service.sprayPaint(baseCtxStub);
        expect(beginPathSpy).toHaveBeenCalledTimes(50);
        expect(arcSpy).toHaveBeenCalledTimes(50);
        expect(fillSpy).toHaveBeenCalledTimes(50);
    });

    it('getCurrentToolString should return aerosol', () => {
        service.getCurrentToolString();
        expect(service.getCurrentToolString()).toEqual('aerosol');
    });
});

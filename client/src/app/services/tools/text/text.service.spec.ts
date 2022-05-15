import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { TextService } from './text.service';
// tslint:disable:no-string-literal
// tslint:disable:no-any
// tslint:disable: no-magic-numbers
describe('TextService', () => {
    let service: TextService;
    let mouseEvent: MouseEvent;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let writeAllTextSpy: jasmine.Spy;
    let writeTextSpy: jasmine.Spy;
    let getPositionFromMouseSpy: jasmine.Spy;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    const testVec2: Vec2 = { x: 10, y: 10 };
    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(TextService);
        getPositionFromMouseSpy = spyOn<any>(service, 'getPositionFromMouse').and.returnValue((event: MouseEvent) => {
            return { x: event.offsetX, y: event.offsetY };
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        writeAllTextSpy = spyOn(service, 'writeAllText').and.callThrough();
        writeTextSpy = spyOn(service, 'writeText').and.callThrough();
        service['drawingService'].canvas = ({ width: 300, height: 150 } as unknown) as HTMLCanvasElement;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onMouseDown should set mouseDownCoord and reset writing parameters click outside textBox while writing', () => {
        mouseEvent = { button: 0 } as MouseEvent;
        drawingServiceSpy.mouseDown = true;
        service.mouseDownCoord = { x: 5, y: 5 };
        service.maxWidthBox = 0;
        service.textContainer = ['test'];
        service.textString = 'test';
        service.index = testVec2;
        service.textDimension = testVec2;
        service.policeSize = 10;
        service.writing = true;
        const clickOustideBoxSpy = spyOn(service, 'clickOutsideBox').and.returnValue(true);
        service.onMouseDown(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(service.mouseDownCoord).toEqual(getPositionFromMouseSpy());
        expect(clickOustideBoxSpy).toHaveBeenCalled();
    });

    it('onMouseDown should set textBox if not writing previously', () => {
        mouseEvent = { button: 0 } as MouseEvent;
        drawingServiceSpy.mouseDown = true;
        service.mouseDownCoord = mouseEvent;
        service.textString = 'test';
        service.textInitialCoord = testVec2;
        service.textCoord = testVec2;
        service.writing = false;
        const textSetupSpy = spyOn(service, 'textSetup').and.stub();
        service.textContainer = [];
        const putTextIndicatorSpy = spyOn(service, 'putTextIndicator').and.stub();
        service.textDimension = testVec2;
        service.index = testVec2;
        service.onMouseDown(mouseEvent);
        expect(textSetupSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(putTextIndicatorSpy).toHaveBeenCalled();
    });

    it('onMouseDown should do nothing if clicking inside textBox', () => {
        mouseEvent = { button: 0 } as MouseEvent;
        drawingServiceSpy.mouseDown = true;
        service.mouseDownCoord = { x: 5, y: 5 };
        service.maxWidthBox = 0;
        service.textContainer = ['test'];
        service.textString = 'test';
        service.index = testVec2;
        service.textDimension = testVec2;
        service.policeSize = 10;
        service.writing = true;
        const clickOustideBoxSpy = spyOn(service, 'clickOutsideBox').and.returnValue(false);
        service.onMouseDown(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(mouseEvent);
        expect(service.mouseDownCoord).toEqual(getPositionFromMouseSpy());
        expect(clickOustideBoxSpy).toHaveBeenCalled();
    });

    it('onMouseDown should do nothing if mouseEvent isnt left click', () => {
        mouseEvent = { button: 1 } as MouseEvent;
        service.writing = true;
        service.onMouseDown(mouseEvent);
        expect(writeAllTextSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should set mouseDown to false if writing is false and mouse is on sidebar', () => {
        service.writing = false;
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.mouseDown).toBeFalse();
    });

    it('onMouseMove should set mouseDown to true if mouse is on canvas', () => {
        service.writing = true;
        service.onMouseMove(mouseEvent);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.mouseDown).toBeTrue();
    });

    it('clickOutsideBox should return true if clicking outside of box', () => {
        service.mouseDownCoord = { x: 10, y: 10 };
        service.textInitialCoord = { x: 100, y: 100 };
        service.textDimension = { x: 500, y: 200 };
        expect(service.clickOutsideBox()).toBeTrue();
    });

    it('clickOutsideBox should return false if clicking inside of box', () => {
        service.mouseDownCoord = { x: 110, y: 110 };
        service.textInitialCoord = { x: 100, y: 100 };
        service.textDimension = { x: 100, y: 100 };
        expect(service.clickOutsideBox()).toBeFalse();
    });

    it('enterDown should do behavior of Enter if event.key = Enter', () => {
        const putTextIndicatorSpy = spyOn(service, 'putTextIndicator').and.stub();
        service.mouseDownCoord = { x: 0, y: 0 };
        service.textContainer = ['allo'];
        service.textString = 'allo';
        service.index = { x: 2, y: 0 };
        service.policeSize = 10;
        service.textCoord = { x: 0, y: 0 };
        service.verticalArrow = true;
        service.enterDown();
        expect(service.textString).toEqual('lo');
        expect(service.textContainer[service.index.y]).toEqual('lo');
        expect(service.index).toEqual({ x: 0, y: 1 });
        expect(writeAllTextSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(putTextIndicatorSpy).toHaveBeenCalled();
        // expect(service.verticalArrow).toBeFalse;
    });

    it('backspaceDown should only remove 1 character from text if index is greater than 0 and event.key = backspace', () => {
        service.index = { x: 4, y: 0 };
        service.textString = 'allo';
        service.textContainer = ['allo'];
        service.policeSize = 20;
        service.backspaceDown();
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(service.index.x).toEqual(3);
        expect(service.textString).toEqual('all');
        expect(service.textContainer).toEqual(['all']);
    });

    it('backspaceDown should decrement index.y by one if index.x is 0 when event.key = backspace', () => {
        const clearRectSpy = spyOn(previewCtxStub, 'clearRect').and.stub();
        service.index = { x: 0, y: 1 };
        service.textContainer = ['al', 'lo'];
        service.textString = 'lo';
        service.textCoord = { x: 0, y: 0 };
        service.policeSize = 10;
        service.textDimension = { x: 500, y: 500 };
        const putTextIndicatorSpy = spyOn(service, 'putTextIndicator').and.stub();
        service.backspaceDown();
        expect(writeAllTextSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(putTextIndicatorSpy).toHaveBeenCalled();
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('backspaceDown should do nothing if index is equal to 0', () => {
        const clearRectSpy = spyOn(previewCtxStub, 'clearRect').and.stub();
        service.index = { x: 0, y: 0 };
        service.backspaceDown();
        expect(clearRectSpy).not.toHaveBeenCalled();
        expect(writeAllTextSpy).not.toHaveBeenCalled();
    });

    it('deleteDown should delete character at index.x++ if event,key = Delete', () => {
        service.textString = 'allo';
        service.textContainer = ['allo'];
        service.index = { x: 2, y: 0 };
        service.deleteDown();
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it('escapeDown should exit writing if event.key = Escape', () => {
        service.maxWidthBox = 200;
        service.writing = true;
        service.index = { x: 2, y: 1 };
        service.textString = 'allo';
        service.textContainer = ['al', 'allo'];
        service.escapeDown();
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(service.writing).toBeFalse();
        expect(service.textContainer).toEqual([]);
        expect(service.textString).toEqual('');
        expect(service.index).toEqual({ x: 0, y: 0 });
        expect(service.maxWidthBox).toEqual(100);
    });

    it('onKeyDown should decrement index.x by one if index.x is greater than 0 and event.key = ArrowLeft', () => {
        const event = { key: 'ArrowLeft' } as KeyboardEvent;
        service.textString = 'allo';
        service.textContainer = ['allo'];
        service['drawingService'].textAlign = 'right';
        service.index = { x: 4, y: 0 };
        service.onKeyDown(event);
        expect(service.index.x).toEqual(3);
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it('onKeyDown(ArrowLeft) should update indicatorX if alignText = center', () => {
        const event = { key: 'ArrowLeft' } as KeyboardEvent;
        service.textString = 'allo';
        service.textContainer = ['allo'];
        service.textSize = 100;
        service.indicatorX = 0;
        service['drawingService'].textAlign = 'center';
        service.index = { x: 4, y: 0 };
        service.onKeyDown(event);
        expect(service.index.x).toEqual(3);
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it('onKeyDown should not decrement index.x by one if index.x is equal to 0 and event.key = ArrowLeft', () => {
        const event = { key: 'ArrowLeft' } as KeyboardEvent;
        service.textString = 'allo';
        service.textContainer = ['allo'];
        service['drawingService'].textAlign = 'right';
        service.index = { x: 0, y: 0 };
        service.onKeyDown(event);
        expect(service.index.x).toEqual(0);
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    // tslint:disable-next-line: max-line-length
    it('onKeyDown should increment index.x by one if index.x is greater than 0 and indidcator isnt at the end of textbox and event.key = ArrowRight', () => {
        const event = { key: 'ArrowRight' } as KeyboardEvent;
        service.textString = 'allo';
        service.textContainer = ['allo'];
        service.index = { x: 0, y: 0 };
        service.onKeyDown(event);
        expect(service.index.x).toEqual(1);
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it('onKeyDown should not increment index.x by one if index.x is at the end of textbox and event.key = ArrowRight', () => {
        const event = { key: 'ArrowRight' } as KeyboardEvent;
        service.textString = 'allo';
        service.textContainer = ['allo'];
        service.index = { x: 4, y: 0 };
        service.onKeyDown(event);
        expect(service.index.x).toEqual(4);
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it('onKeyDown should decrement index.y by one if greater than 0 and if event.key = ArrowUp', () => {
        const event = { key: 'ArrowUp' } as KeyboardEvent;
        service.index = { x: 0, y: 1 };
        service.textString = 'allo';
        service.textContainer = ['allo'];
        const putTextIndicatorSpy = spyOn(service, 'putTextIndicator').and.stub();
        service.onKeyDown(event);
        expect(service.index.y).toEqual(0);
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(writeTextSpy).toHaveBeenCalledTimes(2);
        expect(putTextIndicatorSpy).toHaveBeenCalled();
    });

    it('onKeyDown should decrement index.y by one if greater than 0 and if event.key = ArrowUp', () => {
        const event = { key: 'ArrowUp' } as KeyboardEvent;
        service.index = { x: 4, y: 1 };
        service.textString = 'allo';
        service.textContainer = ['al', 'allo'];
        const putTextIndicatorSpy = spyOn(service, 'putTextIndicator').and.stub();
        service.onKeyDown(event);
        expect(service.index).toEqual({ x: 2, y: 0 });
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(writeTextSpy).toHaveBeenCalledTimes(2);
        expect(putTextIndicatorSpy).toHaveBeenCalled();
    });

    it('onKeyDown should do nothing if index.y is 0 and event.key = ArrowUp', () => {
        const event = { key: 'ArrowUp' } as KeyboardEvent;
        service.index = { x: 4, y: 0 };
        service.textString = 'allo';
        service.textContainer = ['al', 'allo'];
        const putTextIndicatorSpy = spyOn(service, 'putTextIndicator').and.stub();
        service.onKeyDown(event);
        expect(service.index).toEqual({ x: 4, y: 0 });
        expect(writeTextSpy).not.toHaveBeenCalledWith(previewCtxStub);
        expect(putTextIndicatorSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown increment index.y by 1 if its not at the last vertical line of textbox and event.key = ArrowDown', () => {
        const event = { key: 'ArrowDown' } as KeyboardEvent;
        const putTextIndicatorSpy = spyOn(service, 'putTextIndicator').and.stub();
        service.index = { x: 2, y: 0 };
        service.textString = 'allo';
        service.textContainer = ['al', 'allo'];
        service.onKeyDown(event);
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(writeTextSpy).toHaveBeenCalledTimes(2);
        expect(putTextIndicatorSpy).toHaveBeenCalled();
    });

    it('onKeyDown increment index.y by 1 if its not at the last vertical line of textbox and event.key = ArrowDown', () => {
        const event = { key: 'ArrowDown' } as KeyboardEvent;
        const putTextIndicatorSpy = spyOn(service, 'putTextIndicator').and.stub();
        service.index = { x: 4, y: 0 };
        service.textString = 'allo';
        service.textContainer = ['allo', 'al'];
        service.onKeyDown(event);
        expect(service.index.x).toEqual(2);
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(writeTextSpy).toHaveBeenCalledTimes(2);
        expect(putTextIndicatorSpy).toHaveBeenCalled();
    });

    it('onKeyDown increment index.y by 1 if its not at the last vertical line of textbox and event.key = ArrowDown', () => {
        const event = { key: 'ArrowDown' } as KeyboardEvent;
        const putTextIndicatorSpy = spyOn(service, 'putTextIndicator').and.stub();
        service.index = { x: 0, y: 1 };
        service.textString = 'al';
        service.textContainer = ['allo', 'al', ''];
        service.onKeyDown(event);
        expect(service.index.x).toEqual(0);
        expect(writeTextSpy).toHaveBeenCalledWith(previewCtxStub);
        expect(putTextIndicatorSpy).toHaveBeenCalled();
    });

    it('onKeyDown should do nothing if index.y is at the bottom of textbox and event.key = ArrowDown', () => {
        const event = { key: 'ArrowDown' } as KeyboardEvent;
        const putTextIndicatorSpy = spyOn(service, 'putTextIndicator').and.stub();
        service.index = { x: 2, y: 1 };
        service.textString = 'allo';
        service.textContainer = ['al', 'allo'];
        service.onKeyDown(event);
        expect(service.index).toEqual({ x: 2, y: 1 });
        expect(writeTextSpy).not.toHaveBeenCalledWith(previewCtxStub);
        expect(putTextIndicatorSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown should put character in string and container and call writeAllText and putIndicator', () => {
        const event = { key: 'a' } as KeyboardEvent;
        service.writing = true;
        service.textInitialCoord = { x: 50, y: 50 };
        service.textSize = 20;
        service.textDimension = { x: 100, y: 20 };
        service.onKeyDown(event);
        expect(writeAllTextSpy).toHaveBeenCalled();
    });

    it('onKeyDown do nothing if event.key.lenght is greater than one and isnt an arrow input', () => {
        const event = { key: 'Backspace' } as KeyboardEvent;
        const putTextIndicatorSpy = spyOn(service, 'putTextIndicator').and.stub();
        service.writing = false;
        service.textInitialCoord = { x: 50, y: 50 };
        service.textSize = 20;
        service.textDimension = { x: 100, y: 20 };
        service.onKeyDown(event);
        expect(writeAllTextSpy).not.toHaveBeenCalled();
        expect(putTextIndicatorSpy).not.toHaveBeenCalled();
    });

    it('writeAllText should update textDimension depending on textContainer and policeSize', () => {
        drawingServiceSpy.policeSize = 20;
        service.maxWidthBox = 100;
        service.textCoord = { x: 100, y: 100 };
        service.textDimension = { x: 100, y: 10 };
        service.textContainer = ['allo'];
        service.textString = 'allo';
        service.policeSize = 20;
        service.writeAllText(baseCtxStub);
        expect(service.textDimension.y).toEqual(service.textContainer.length * service.policeSize);
    });

    it('textSetup should update ctx attributes and align text to left', () => {
        service.index = { x: 0, y: 0 };
        service.textInitialCoord = { x: 50, y: 50 };
        service.textCoord = { x: 0, y: 0 };
        service.textString = 'allo';
        service.textContainer = ['allo'];
        drawingServiceSpy.textAlign = 'left';
        service.textSetup(baseCtxStub);
        expect(service.textCoord.x).toEqual(service.textInitialCoord.x);
    });

    it('textSetup should update ctx attributes and align text to center', () => {
        service.index = { x: 0, y: 0 };
        service.textInitialCoord = { x: 50, y: 50 };
        service.textDimension = { x: 10, y: 10 };
        service.textCoord = { x: 0, y: 0 };
        service.textString = 'allo';
        service.textContainer = ['allo'];
        drawingServiceSpy.textAlign = 'center';
        service.textSetup(baseCtxStub);
        expect(service.textCoord.x).toEqual(service.textInitialCoord.x + service.textDimension.x / 2);
    });

    it('textSetup should update ctx attributes and align text to right', () => {
        service.index = { x: 0, y: 0 };
        service.textInitialCoord = { x: 50, y: 50 };
        service.textDimension = { x: 10, y: 10 };
        service.textCoord = { x: 0, y: 0 };
        service.textString = 'allo';
        service.textContainer = ['allo'];
        drawingServiceSpy.textAlign = 'right';
        service.textSetup(baseCtxStub);
        expect(service.textCoord.x).toEqual(service.textInitialCoord.x + service.textDimension.x);
    });

    it('getCurrentToolString should return text', () => {
        expect(service.getCurrentToolString()).toEqual('text');
    });

    it('clickedElseWhere should do nothing if writing is false', () => {
        service.writing = false;
        service.clickedElseWhere();
        expect(writeAllTextSpy).not.toHaveBeenCalled();
    });

    it('clickedElseWhere should call writeAllText if writing is true', () => {
        service.writing = true;
        service.clickedElseWhere();
        expect(writeAllTextSpy).toHaveBeenCalled();
    });
    // tslint:disable-next-line: max-file-line-count
});

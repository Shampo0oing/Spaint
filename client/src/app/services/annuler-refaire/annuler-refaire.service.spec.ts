import { TestBed } from '@angular/core/testing';
import { Action } from '@app/classes/Actions/action';
import { ActionStub } from '@app/classes/Actions/action-stub';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizerService } from '@app/services/resizer/resizer.service';

// tslint:disable:no-string-literal
// tslint:disable:no-any

enum proprietyPosition {
    PRIMARY_COLOR = 0,
    SECONDARY_COLOR,
    NUMBER_OF_EDGES,
    ELLIPSE_TRACE_TYPE,
    RECTANGLE_TRACE_TYPE,
    POLYGON_TRACE_TYPE,
    ERASER_WIDTH,
    IMAGE_SRC,
    POLYGON_WIDTH,
}

describe('AnnulerRefaireService', () => {
    let service: AnnulerRefaireService;
    // tslint:disable-next-line:prefer-const
    let action: Action; // on veut pas l'initialiser
    let actionStub: ActionStub;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let resizerServiceSpy: jasmine.SpyObj<ResizerService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasTestHelper: CanvasTestHelper;
    let drawSpy: jasmine.Spy<any>;
    let restoreParameterSpy: jasmine.Spy<any>;
    let saveParameterSpy: jasmine.Spy<any>;
    let emptyBothActionArraySpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'autoSave']);
        resizerServiceSpy = jasmine.createSpyObj('ResizerService', ['resizeImage']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ResizerService, useValue: resizerServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service = TestBed.inject(AnnulerRefaireService);
        service.undoActions = [];
        service.redoActions = [];

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;

        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        const dummyElement = document.createElement('canvas');
        dummyElement.setAttribute('width', '250px');
        dummyElement.setAttribute('height', '250px');
        service['drawingService'].canvas = dummyElement;

        actionStub = new ActionStub(drawServiceSpy);
        drawSpy = spyOn<any>(actionStub, 'draw').and.callThrough();
        emptyBothActionArraySpy = spyOn<any>(service, 'emptyBothActionArray').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('addUndoAction should add the action to the undoAction array', () => {
        service.addUndoAction(actionStub);
        expect(service.undoActions[0]).toEqual(actionStub);
    });

    it('addUndoAction should empty the redoAction array', () => {
        service.redoActions.push(actionStub);
        service.addUndoAction(actionStub);
        expect(service.redoActions.length).toEqual(0);
        expect(drawServiceSpy.autoSave).toHaveBeenCalled();
    });

    it('undo should cancel the last action that has been done', () => {
        service.addUndoAction(actionStub);
        restoreParameterSpy = spyOn<any>(service, 'restoreParameter').and.stub();
        saveParameterSpy = spyOn<any>(service, 'saveParameter').and.stub();
        drawServiceSpy.image = {} as HTMLImageElement;
        service.undo();
        expect(service.undoActions.length).toEqual(0);
        expect(saveParameterSpy).toHaveBeenCalled();
        expect(restoreParameterSpy).toHaveBeenCalled();
    });

    it('undo should do nothing if no action has been done', () => {
        service.undo();
        expect(service.redoActions.length).toEqual(0);
        expect(service.undoActions.length).toEqual(0);
    });

    it('undo should push the last action if it was not an actionStub', () => {
        service.redoActions = [];
        drawServiceSpy.image = {} as HTMLImageElement;
        service.addUndoAction(action);
        restoreParameterSpy = spyOn<any>(service, 'restoreParameter').and.stub();
        saveParameterSpy = spyOn<any>(service, 'saveParameter').and.stub();
        service.undo();
        expect(service.redoActions.length).toEqual(1);
        expect(saveParameterSpy).toHaveBeenCalled();
        expect(restoreParameterSpy).toHaveBeenCalled();
    });

    it('undo should call draw', () => {
        service.redoActions = [];
        drawServiceSpy.image = {} as HTMLImageElement;
        spyOn<any>(service, 'isActionStub').and.returnValue(false);
        service.addUndoAction(actionStub);
        service.addUndoAction(actionStub);
        drawSpy.and.stub();

        restoreParameterSpy = spyOn<any>(service, 'restoreParameter').and.stub();
        saveParameterSpy = spyOn<any>(service, 'saveParameter').and.stub();
        service.undo();
        expect(drawSpy).toHaveBeenCalled();
        expect(restoreParameterSpy).toHaveBeenCalled();
        expect(saveParameterSpy).toHaveBeenCalled();
    });

    it('redo should do nothing if no action has been done', () => {
        service.redo();
        expect(service.redoActions.length).toEqual(0);
        expect(service.undoActions.length).toEqual(0);
    });

    it('redo should call the draw function on the latest action and add it to undoActions and remove it from the redoActions array', () => {
        service.redoActions.push(actionStub);
        restoreParameterSpy = spyOn<any>(service, 'restoreParameter').and.stub();
        saveParameterSpy = spyOn<any>(service, 'saveParameter').and.stub();
        drawServiceSpy.image = {} as HTMLImageElement;
        service.redo();
        expect(drawSpy).toHaveBeenCalled();
        expect(restoreParameterSpy).toHaveBeenCalled();
        expect(restoreParameterSpy).toHaveBeenCalled();
        expect(service.undoActions.length).toEqual(1);
        expect(service.redoActions.length).toEqual(0);
    });

    it('emptyBothActionArray should empty redoActions and undoActions arrays', () => {
        service.redoActions.push(actionStub);
        service.redoActions.push(actionStub);
        service.undoActions.push(actionStub);
        service.undoActions.push(actionStub);
        service.emptyBothActionArray();
        expect(service.redoActions.length).toEqual(0);
        expect(service.undoActions.length).toEqual(0);
    });

    it('updateImageData should update image to the actual canvas and call emptyBothActionArray', () => {
        service.updateImageData();
        expect(emptyBothActionArraySpy).toHaveBeenCalled();
    });

    it(' addUndoAction should erase the last action if it was an ActionStub', () => {
        service.addUndoAction(actionStub);
        service.addUndoAction(actionStub);
        expect(service.undoActions.length).toEqual(1);
    });

    it(' removeActionsStubs should not remove the last action in undoActions if its an ActionStub', () => {
        spyOn<any>(service, 'isActionStub').and.returnValue(false);
        const popSpy = spyOn<any>(service.undoActions, 'pop').and.stub();
        service.removeActionsStubs();
        expect(popSpy).not.toHaveBeenCalled();
    });

    it(' removeActionsStubs should remove the last action in undoActions if its an ActionStub', () => {
        spyOn<any>(service, 'isActionStub').and.returnValue(true);
        const popSpy = spyOn<any>(service.undoActions, 'pop').and.stub();
        service.removeActionsStubs();
        expect(popSpy).toHaveBeenCalled();
    });

    it(' saveParameter should save old parameters of drawingService', () => {
        const value = 50;
        service.savedParameters[proprietyPosition.ELLIPSE_TRACE_TYPE] = 0;
        drawServiceSpy.traceTypeEllipse = value;
        service.savedParameters[proprietyPosition.RECTANGLE_TRACE_TYPE] = 0;
        drawServiceSpy.traceTypeRectangle = value;
        drawServiceSpy.image = { src: '' } as HTMLImageElement;
        service.saveParameter();
        expect(service.savedParameters[proprietyPosition.ELLIPSE_TRACE_TYPE]).toEqual(value);
        expect(service.savedParameters[proprietyPosition.RECTANGLE_TRACE_TYPE]).toEqual(value);
    });

    it(' restoreParameter should restore the old parameters of drawingService', () => {
        const value = 50;
        service.savedParameters[proprietyPosition.ELLIPSE_TRACE_TYPE] = value;
        drawServiceSpy.traceTypeEllipse = 0;
        service.savedParameters[proprietyPosition.RECTANGLE_TRACE_TYPE] = value;
        drawServiceSpy.traceTypeRectangle = 0;
        drawServiceSpy.image = { src: '' } as HTMLImageElement;
        service.restoreParameter();
        expect(drawServiceSpy.traceTypeEllipse).toEqual(value);
        expect(drawServiceSpy.traceTypeRectangle).toEqual(value);
    });
});

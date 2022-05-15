import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MagnetismComponent } from '@app/components/tools/magnetism/magnetism.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/tools/magnetism/magnetism.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

describe('MagnetismComponent', () => {
    let component: MagnetismComponent;
    let fixture: ComponentFixture<MagnetismComponent>;
    let toolSelectorServiceSpy: jasmine.SpyObj<ToolSelectorService>;
    let drawingServiceStub: DrawingService;
    let magnetismServiceStub: MagnetismService;

    beforeEach(async(() => {
        toolSelectorServiceSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        drawingServiceStub = new DrawingService();
        magnetismServiceStub = new MagnetismService(drawingServiceStub);

        TestBed.configureTestingModule({
            declarations: [MagnetismComponent],
            providers: [
                { provide: ToolSelectorService, useValue: toolSelectorServiceSpy },
                { provide: DrawingService, useValue: drawingServiceStub },
                { provide: MagnetismService, useValue: magnetismServiceStub },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MagnetismComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' changeMagnetismPoint should translationPointX and translationPointY of magnetismService', () => {
        // tslint:disable-next-line:no-magic-numbers
        const testValue = 7 as number;
        const expectedResultX = 0.5;
        const expectedResultY = 1;
        component.changeMagnetismPoint(testValue);

        expect(magnetismServiceStub.translationPointX).toEqual(expectedResultX);
        expect(magnetismServiceStub.translationPointY).toEqual(expectedResultY);
    });

    it(' toggle should useMagnetism of drawingService', () => {
        const matSlideToggleChangeStub = { checked: true } as MatSlideToggleChange;
        drawingServiceStub.useMagnetism = false;
        component.toggle(matSlideToggleChangeStub);

        expect(drawingServiceStub.useMagnetism).toEqual(true);
    });
});

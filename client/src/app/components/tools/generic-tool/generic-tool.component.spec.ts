import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GenericToolComponent } from '@app/components/tools/generic-tool/generic-tool.component';
import { ToolSelectorService } from '@app/services/tools/tool-selector.service';

describe('GenericToolComponent', () => {
    let component: GenericToolComponent;
    let fixture: ComponentFixture<GenericToolComponent>;
    let toolSelectorServiceSpy: jasmine.SpyObj<ToolSelectorService>;

    beforeEach(async(() => {
        toolSelectorServiceSpy = jasmine.createSpyObj('ToolSelectorService', ['setTool']);
        TestBed.configureTestingModule({
            declarations: [GenericToolComponent],
            providers: [{ provide: ToolSelectorService, useValue: toolSelectorServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GenericToolComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' getCurrentTool should return vide', () => {
        expect(component.getCurrentTool()).toEqual('vide');
    });
});

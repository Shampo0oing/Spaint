import { Injectable } from '@angular/core';
import {
    AEROSOL_KEY,
    ELLIPSE_KEY,
    ERASER_KEY,
    LINE_KEY,
    PENCIL_KEY,
    PIPETTE_KEY,
    POLYGON_KEY,
    RECTANGLE_KEY,
    SCEAU_KEY,
    SELECTELLIPSE_KEY,
    SELECTLASSO_KEY,
    SELECTRECT_KEY,
    STAMP_KEY,
    TEXTE_KEY,
} from '@app/classes/constantes';
import { Tool } from '@app/classes/tool';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AerosolService } from '@app/services/tools/aerosol/aerosol.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { LineService } from '@app/services/tools/line/line.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SceauService } from '@app/services/tools/sceau/sceau.service';
import { SelectionEllipseService } from '@app/services/tools/selection/selection-ellipse.service';
import { SelectionLassoService } from '@app/services/tools/selection/selection-lasso.service';
import { SelectionRectangleService } from '@app/services/tools/selection/selection-rectangle.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from './text/text.service';

export enum ToolPosition {
    Pencil = 0,
    Eraser = 1,
    Ellipse = 2,
    Rectangle = 3,
    Line = 4,
    Polygon = 5,
    Aerosol = 6,
    Pipette = 7,
    SelectRect = 8,
    SelectEl = 9,
    Sceau = 10,
    SelectLasso = 11,
    Stamp = 12,
    text = 13,
}

@Injectable({
    providedIn: 'root',
})
export class ToolSelectorService {
    tools: Tool[];
    currentTool: Tool;
    keyBindings: Map<string, ToolPosition> = new Map();

    constructor(
        private drawingService: DrawingService,
        private pencilService: PencilService,
        private eraserService: EraserService,
        private ellipseService: EllipseService,
        private rectangleService: RectangleService,
        private lineService: LineService,
        private pipetteService: PipetteService,
        private polygonService: PolygonService,
        private aerosolService: AerosolService,
        private selectionRectangleService: SelectionRectangleService,
        private selectionEllipseService: SelectionEllipseService,
        private sceauService: SceauService,
        private selectionLassoService: SelectionLassoService,
        private stampService: StampService,
        private textService: TextService,
    ) {
        this.tools = [
            this.pencilService,
            this.eraserService,
            this.ellipseService,
            this.rectangleService,
            this.lineService,
            this.polygonService,
            this.aerosolService,
            this.pipetteService,
            this.selectionRectangleService,
            this.selectionEllipseService,
            this.sceauService,
            this.selectionLassoService,
            this.stampService,
            this.textService,
        ];

        this.currentTool = this.tools[0];
        this.keyBindings
            .set(PENCIL_KEY, ToolPosition.Pencil)
            .set(ERASER_KEY, ToolPosition.Eraser)
            .set(ELLIPSE_KEY, ToolPosition.Ellipse)
            .set(RECTANGLE_KEY, ToolPosition.Rectangle)
            .set(LINE_KEY, ToolPosition.Line)
            .set(POLYGON_KEY, ToolPosition.Polygon)
            .set(AEROSOL_KEY, ToolPosition.Aerosol)
            .set(PIPETTE_KEY, ToolPosition.Pipette)
            .set(SELECTRECT_KEY, ToolPosition.SelectRect)
            .set(SELECTELLIPSE_KEY, ToolPosition.SelectEl)
            .set(SCEAU_KEY, ToolPosition.Sceau)
            .set(SELECTLASSO_KEY, ToolPosition.SelectLasso)
            .set(STAMP_KEY, ToolPosition.Stamp)
            .set(TEXTE_KEY, ToolPosition.text);
    }

    private isSelectionService(tool: Tool): boolean {
        return tool instanceof SelectionService;
    }

    private isTextService(tool: Tool): boolean {
        return tool instanceof TextService;
    }

    setTool(keyShortcut: string): void {
        if (this.keyBindings.has(keyShortcut) && !this.drawingService.mouseDown) {
            if (keyShortcut === ERASER_KEY) {
                this.hideCrosshair();
            } else if (this.currentTool === this.tools[this.keyBindings.get(ERASER_KEY) as ToolPosition]) {
                this.showCrosshair();
            }
            if (
                (this.isSelectionService(this.currentTool) && this.tools[this.keyBindings.get(keyShortcut) as ToolPosition] !== this.currentTool) ||
                this.isTextService(this.currentTool)
            )
                this.currentTool.clickedElseWhere();
            this.currentTool = this.tools[this.keyBindings.get(keyShortcut) as ToolPosition];
        }
    }

    hideCrosshair(): void {
        const previewLayer = document.getElementById('gridLayer') as HTMLCanvasElement;
        if (!previewLayer.classList.contains('NoCrosshair')) previewLayer.classList.add('NoCrosshair');
    }

    showCrosshair(): void {
        const previewLayer = document.getElementById('gridLayer') as HTMLCanvasElement;
        previewLayer.classList.remove('NoCrosshair');
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }
}

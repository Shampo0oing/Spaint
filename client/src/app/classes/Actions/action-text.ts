import { Action, DrawingService } from '@app/classes/Actions/action';
import { Vec2 } from '@app/classes/vec2';
import { TextService } from '@app/services/tools/text/text.service';

export class ActionText extends Action {
    textInitialCoord: Vec2;
    textContainer: string[];
    policeSize: number;
    primaryColor: string;
    textAlign: CanvasTextAlign;
    font: string;
    fontStyle: string;
    constructor(
        drawingService: DrawingService,
        textInitialCoord: Vec2,
        textContainer: string[],
        policeSize: number,
        primaryColor: string,
        textAlign: CanvasTextAlign,
        font: string,
        fontStyle: string,
        private textService: TextService,
    ) {
        super(drawingService);
        this.textInitialCoord = textInitialCoord;
        this.textContainer = textContainer;
        this.policeSize = policeSize;
        this.primaryColor = primaryColor;
        this.textAlign = textAlign;
        this.font = font;
        this.fontStyle = fontStyle;
    }

    draw(): void {
        const ctx = this.drawingService.baseCtx;
        this.textService.textInitialCoord = { x: this.textInitialCoord.x, y: this.textInitialCoord.y };
        this.textService.textContainer = this.textContainer;
        this.drawingService.policeSize = this.policeSize;
        this.drawingService.primaryColor = this.primaryColor;
        this.drawingService.textAlign = this.textAlign;
        this.drawingService.font = this.font;
        this.drawingService.fontStyle = this.fontStyle;
        this.textService.writeAllText(ctx);
    }
}

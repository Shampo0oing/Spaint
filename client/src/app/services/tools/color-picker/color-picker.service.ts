import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';

@Injectable({
    providedIn: 'root',
})
export class ColorPickerService {
    colorHistory: Color[] = []; // garde les 10 dernieres couleurs selectionnées en mémoire elles sont partagées par tout les components color-picker
}

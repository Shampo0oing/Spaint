import { TestBed } from '@angular/core/testing';
import { Color } from './color';

const COLOR_PROPERTIES = 10;
// tslint:disable:no-string-literal
// tslint:disable:no-any
describe('Color', () => {
    let color: Color;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [],
        });
        color = new Color();
    });

    it('should be created', () => {
        expect(color).toBeTruthy();
    });

    it('setAttributes should change the rgba of color if the parametre is in an rgba() format', () => {
        color.setAttributes('rgba(10,10,10,10)');
        expect(color.r).toEqual(COLOR_PROPERTIES);
        expect(color.g).toEqual(COLOR_PROPERTIES);
        expect(color.b).toEqual(COLOR_PROPERTIES);
        expect(color.a).toEqual(COLOR_PROPERTIES);
    });

    it('setAttributes should change the rgba of color if the parametre is in an HEX format', () => {
        const expectedResult = 255;
        color.setAttributes('#ffffff');
        expect(color.r).toEqual(expectedResult);
        expect(color.g).toEqual(expectedResult);
        expect(color.b).toEqual(expectedResult);
        expect(color.a).toEqual(1);
    });

    it('setAttributes should change the rgba of color if the parametre is another color object', () => {
        const colorTest = new Color(COLOR_PROPERTIES, COLOR_PROPERTIES, COLOR_PROPERTIES, COLOR_PROPERTIES);
        color.setAttributes(colorTest);
        expect(color.r).toEqual(COLOR_PROPERTIES);
        expect(color.g).toEqual(COLOR_PROPERTIES);
        expect(color.b).toEqual(COLOR_PROPERTIES);
        expect(color.a).toEqual(COLOR_PROPERTIES);
    });

    it('toHex should return the color propreties in an HEX format (the length of the hex number is 1)', () => {
        color.r = color.g = color.b = COLOR_PROPERTIES;

        expect(color.toHex()).toEqual('#0a0a0a');
    });

    it('toHex should return the color propreties in an HEX format (the length of the hex number is 2)', () => {
        const colorPropertiesTest = 16;
        color.r = color.g = color.b = colorPropertiesTest;

        expect(color.toHex()).toEqual('#101010');
    });

    it('toRgba should return the color propreties in an RGBA format with the word rgba() if no parametre is given ', () => {
        expect(color.toRgba()).toEqual('rgba(0, 0, 0, 1)');
    });

    it('toRgba should return the color propreties in an RGBA format without the word rgba() if the parametre is false ', () => {
        expect(color.toRgba(false)).toEqual('0, 0, 0, 1');
    });
});

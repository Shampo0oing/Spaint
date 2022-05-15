export class Color {
    constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    r: number;
    g: number;
    b: number;
    a: number;

    setAttributes(color: string | Color): void {
        if (typeof color === 'string') {
            const input = color
                .replace('rgba(', '')
                .replace(')', '')
                .split(',')
                .map((c) => c.trim());
            // tslint:disable-next-line:no-magic-numbers
            if (color.startsWith('#')) {
                // tslint:disable-next-line:no-magic-numbers
                this.r = parseInt(color.slice(1, 3), 16);
                // tslint:disable-next-line:no-magic-numbers
                this.g = parseInt(color.slice(3, 5), 16);
                // tslint:disable-next-line:no-magic-numbers
                this.b = parseInt(color.slice(5, 7), 16);
            } else {
                this.r = parseInt(input[0], 10);
                this.g = parseInt(input[1], 10);
                this.b = parseInt(input[2], 10);
                // tslint:disable-next-line:no-magic-numbers
                this.a = parseFloat(input[3]);
            }
        } else {
            this.r = color.r;
            this.g = color.g;
            this.b = color.b;
            this.a = color.a;
        }
    }

    toHex(): string {
        // on s'assure que la taille de la valeur en rgb ne vaut pas 1 sinon on obtient un hex invalide ex: #0f0
        return (
            '#' +
            (this.r.toString(16).length === 1 ? '0' + this.r.toString(16) : this.r.toString(16)) +
            (this.g.toString(16).length === 1 ? '0' + this.g.toString(16) : this.g.toString(16)) +
            (this.b.toString(16).length === 1 ? '0' + this.b.toString(16) : this.b.toString(16))
        );
    }

    toRgba(withPrefix: boolean = true): string {
        return withPrefix ? `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})` : `${this.r}, ${this.g}, ${this.b}, ${this.a}`;
    }
}

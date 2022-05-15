export const DEFAULT_WIDTH = 1000;
export const DEFAULT_HEIGHT = 800;
export const DEFAULT_POSITION = { left: 51, top: 1 };
export const DEFAULT_LINE_WIDTH = 3;

export const RECTANGLE_KEY = '1';
export const ELLIPSE_KEY = '2';
export const PENCIL_KEY = 'c';
export const LINE_KEY = 'l';
export const ERASER_KEY = 'e';
export const PIPETTE_KEY = 'i';
export const AEROSOL_KEY = 'a';
export const POLYGON_KEY = '3';
export const SELECTRECT_KEY = 'r';
export const SELECTELLIPSE_KEY = 's';
export const SELECTLASSO_KEY = 'v';
export const GRID_KEY = 'g';
export const MAGNETISM_KEY = 'm';
export const SCEAU_KEY = 'b';
export const STAMP_KEY = 'd';
export const TEXTE_KEY = 't';

export const DETECTION_LIMIT = 1;
export const TRANSITION_PIXEL = 3;
export const RED = 0;
export const GREEN = 1;
export const BLUE = 2;
export const OPACITY = 3;
export const PIXEL_SIZE = 4;
export const WHITE = 255;
export const DELAY_100 = 100;
export const DELAY_500 = 500;
export const SQUARE_MIN_SIZE = 20;
export const SQUARE_MAX_SIZE = 100;
export const OPACITY_MIN = 20;
export const OPACITY_MAX = 100;
export const JUMP_PX_5 = 5;
export const NUMBER_POINTS = 3;
export const ANGLE_90 = 90;
export const ANGLE_180 = 180;
export const ANGLE_270 = 270;
export const ANGLE_360 = 360;
export const DISTANCE_20PX = 20;
export const FACTEUR_45 = 45;
export const STEP_SCROLL = 15;
export const SCALE_SCROLL = 25;
export const SCALE = 100;
export const EPSILON = 0.0000001;
export const PERCENTAGE = 100;
export const LINE_DASH_MIN = 5;
export const LINE_DASH_MAX = 15;
export const VALIDATORS_MIN = 3;
export const VALIDATORS_MAX = 28;
export const MIN_WIDTH = 250;
export const MAX_WIDTH = 1700;
export const MIN_HEIGHT = 250;
export const MAX_HEIGHT = 900;
export const SCALE_STEP = 25;

export const YELLOW_COLOR = 0.17;
export const GREEN_COLOR = 0.34;
export const CYAN_COLOR = 0.51;
export const BLUE_COLOR = 0.68;
export const PURPLE_COLOR = 0.85;

export const BASE = 10;

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export enum DragPos {
    NONE = 0,
    CORNER = 1,
    BOTTOM = 2,
    RIGHT = 3,
}

export enum SelectPos {
    NONE = 0,
    UPPERLEFT = 1,
    UPPERMIDDLE = 2,
    UPPERRIGHT = 3,
    MIDDLELEFT = 4,
    MIDDLERIGHT = 6,
    BOTTOMLEFT = 7,
    BOTTOMMIDDLE = 8,
    BOTTOMRIGHT = 9,
}

export enum Trace {
    Contour = 0,
    Plein = 1,
    Plein_Coutour = 2,
}

export enum Stamp {
    Stamp1 = 1,
    Stamp2,
    Stamp3,
    Stamp4,
    Stamp5,
    Stamp6,
}

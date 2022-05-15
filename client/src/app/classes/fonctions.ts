import { EPSILON, PERCENTAGE } from '@app/classes/constantes';
import { Vec2 } from '@app/classes/vec2';

export const between = (a: number, b: number, c: number): boolean => {
    return a - EPSILON <= b && b <= c + EPSILON;
};

export const checkIntersection = (p1: Vec2, p2: Vec2, q1: Vec2, q2: Vec2, x: number, y: number): boolean => {
    if (p1.x >= p2.x) {
        if (!between(p2.x, x, p1.x)) return false;
    } else if (!between(p1.x, x, p2.x)) return false;

    if (p1.y >= p2.y) {
        if (!between(p2.y, y, p1.y)) return false;
    } else if (!between(p1.y, y, p2.y)) return false;

    if (q1.x >= q2.x) {
        if (!between(q2.x, x, q1.x)) return false;
    } else if (!between(q1.x, x, q2.x)) return false;

    if (q1.y >= q2.y) {
        if (!between(q2.y, y, q1.y)) return false;
    } else if (!between(q1.y, y, q2.y)) return false;

    return true;
};

export const calculateXandY = (p1: Vec2, p2: Vec2, q1: Vec2, q2: Vec2): Vec2 => {
    const X =
        ((p1.x * p2.y - p1.y * p2.x) * (q1.x - q2.x) - (p1.x - p2.x) * (q1.x * q2.y - q1.y * q2.x)) /
        ((p1.x - p2.x) * (q1.y - q2.y) - (p1.y - p2.y) * (q1.x - q2.x));
    const Y =
        ((p1.x * p2.y - p1.y * p2.x) * (q1.y - q2.y) - (p1.y - p2.y) * (q1.x * q2.y - q1.y * q2.x)) /
        ((p1.x - p2.x) * (q1.y - q2.y) - (p1.y - p2.y) * (q1.x - q2.x));
    return { x: X, y: Y };
};

export const intersects = (p1: Vec2, p2: Vec2, q1: Vec2, q2: Vec2): boolean => {
    // references https://gist.github.com/gordonwoodhull/50eb65d2f048789f9558
    if (p2 === q1) return false;
    const xy = calculateXandY(p1, p2, q1, q2);
    if (isNaN(xy.x) || isNaN(xy.y)) return false;
    return checkIntersection(p1, p2, q1, q2, xy.x, xy.y);
};

export const checkIfParallel = (pathData: Vec2[], mouseDownCoord: Vec2): boolean => {
    const p11 = pathData[pathData.length - 2];
    const p12 = pathData[pathData.length - 1];
    const p22 = mouseDownCoord;
    const v1 = { x: p12.x - p11.x, y: p12.y - p11.y };
    const v2 = { x: p22.x - p12.x, y: p22.y - p12.y };
    const d1 = Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2));
    const d2 = Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2));
    const u1 = { x: v1.x / d1, y: v1.y / d1 };
    const u2 = { x: v2.x / d2, y: v2.y / d2 };
    return Math.round((u1.x + u2.x) * PERCENTAGE) / PERCENTAGE === 0 && Math.round((u1.y + u2.y) * PERCENTAGE) / PERCENTAGE === 0;
};

export const checkIfIntersect = (pathData: Vec2[], mouseDownCoord: Vec2): boolean => {
    if (pathData.length <= 1) return false;
    if (checkIfParallel(pathData, mouseDownCoord)) return true;
    if (pathData.length <= 2) return false;
    const point = mouseDownCoord;
    for (let i = 0; i < pathData.length - 1; i++) if (intersects(pathData[i], pathData[i + 1], pathData[pathData.length - 1], point)) return true;
    return false;
};

export const findMin = (pathData: Vec2[]): Vec2 => {
    let minX = pathData[0].x;
    let minY = pathData[0].y;
    for (const point of pathData) {
        if (point.x < minX) minX = point.x;
        if (point.y < minY) minY = point.y;
    }
    return { x: minX, y: minY };
};

export const findMax = (pathData: Vec2[]): Vec2 => {
    let maxX = pathData[0].x;
    let maxY = pathData[0].y;
    for (const point of pathData) {
        if (point.x > maxX) maxX = point.x;
        if (point.y > maxY) maxY = point.y;
    }
    return { x: maxX, y: maxY };
};

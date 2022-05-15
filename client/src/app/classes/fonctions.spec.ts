import { between, calculateXandY, checkIfIntersect, checkIfParallel, checkIntersection, findMax, findMin, intersects } from '@app/classes/fonctions';
import { Vec2 } from '@app/classes/vec2';

let p1: Vec2;
let p2: Vec2;
let q1: Vec2;
let q2: Vec2;
let xy: Vec2;
let pathData: Vec2[];
let mouseDownCoord: Vec2;

// tslint:disable:no-magic-numbers

it(' between should return true if b is between a and c withing epsilon value', () => {
    const a = 1;
    const b = 2;
    const c = 3;
    expect(between(a, b, c)).toEqual(true);
});

it(' between should return false if b is not between a and c withing epsilon value', () => {
    const a = 1;
    const b = 5;
    const c = 3;
    expect(between(a, b, c)).toEqual(false);
});

it(' checkIntersection should return false because of the first if', () => {
    p1 = { x: 403, y: 665 };
    p2 = { x: 102, y: 601 };
    q1 = { x: 439, y: 220.00000000000006 };
    q2 = { x: 574.3125, y: 201 };
    xy = calculateXandY(p1, p2, q1, q2);
    expect(checkIntersection(p1, p2, q1, q2, xy.x, xy.y)).toEqual(false);
});

it(' checkIntersection should return false because of the second if', () => {
    p1 = { x: 148, y: 523 };
    p2 = { x: 250, y: 625 };
    q1 = { x: 439, y: 220.00000000000006 };
    q2 = { x: 566.3125, y: 193 };
    xy = calculateXandY(p1, p2, q1, q2);
    expect(checkIntersection(p1, p2, q1, q2, xy.x, xy.y)).toEqual(false);
});

it(' checkIntersection should return false because of the third if', () => {
    p1 = { x: 734, y: 651 };
    p2 = { x: 734, y: 525 };
    q1 = { x: 439, y: 220.00000000000006 };
    q2 = { x: 572.3125, y: 202 };
    xy = calculateXandY(p1, p2, q1, q2);
    expect(checkIntersection(p1, p2, q1, q2, xy.x, xy.y)).toEqual(false);
});

it(' checkIntersection should return falsebecause of the 4th if', () => {
    p1 = { x: 697, y: 343.00000000000006 };
    p2 = { x: 697, y: 481.00000000000006 };
    q1 = { x: 439, y: 220.00000000000006 };
    q2 = { x: 541.3125, y: 182 };
    xy = calculateXandY(p1, p2, q1, q2);
    expect(checkIntersection(p1, p2, q1, q2, xy.x, xy.y)).toEqual(false);
});

it(' checkIntersection should return false because of the 5th if', () => {
    p1 = { x: 615.3125, y: 230 };
    p2 = { x: 340.3125, y: 517 };
    q1 = { x: 746.3125, y: 630 };
    q2 = { x: 639.3125, y: 317 };
    xy = calculateXandY(p1, p2, q1, q2);
    expect(checkIntersection(p1, p2, q1, q2, xy.x, xy.y)).toEqual(false);
});

it(' checkIntersection should return false because of the 6th if', () => {
    p1 = { x: 0, y: 352.00000000000006 };
    p2 = { x: 40, y: 651 };
    q1 = { x: 439, y: 220.00000000000006 };
    q2 = { x: 514.3125, y: 186 };
    xy = calculateXandY(p1, p2, q1, q2);
    expect(checkIntersection(p1, p2, q1, q2, xy.x, xy.y)).toEqual(false);
});

it(' checkIntersection should return true', () => {
    p1 = { x: 866.3125, y: 239 };
    p2 = { x: 827.3125, y: 49 };
    q1 = { x: 737.3125, y: 49 };
    q2 = { x: 1185.3125, y: 235 };
    xy = calculateXandY(p1, p2, q1, q2);
    expect(checkIntersection(p1, p2, q1, q2, xy.x, xy.y)).toEqual(true);
});

it(' checkIntersection should return false because of the 7th if', () => {
    p1 = { x: 473.3125, y: 703 };
    p2 = { x: 821.3125, y: 703 };
    q1 = { x: 766.3125, y: 157.99999999999997 };
    q2 = { x: 766.3125, y: 149 };
    xy = calculateXandY(p1, p2, q1, q2);
    expect(checkIntersection(p1, p2, q1, q2, xy.x, xy.y)).toEqual(false);
});

it(' checkIntersection should return false because of the 8th if', () => {
    p1 = { x: 528.3125, y: 134 };
    p2 = { x: 191.3125, y: 277 };
    q1 = { x: 210.3125, y: 569 };
    q2 = { x: 210.3125, y: 570 };
    xy = calculateXandY(p1, p2, q1, q2);
    expect(checkIntersection(p1, p2, q1, q2, xy.x, xy.y)).toEqual(false);
});

it(' checkIntersection should return true', () => {
    p1 = { x: 491.3125, y: 205 };
    p2 = { x: 196.3125, y: 460 };
    q1 = { x: 844.3125, y: 484 };
    q2 = { x: 472.3125, y: 221 };
    xy = calculateXandY(p1, p2, q1, q2);
    expect(checkIntersection(p1, p2, q1, q2, xy.x, xy.y)).toEqual(true);
});

it(' calculateXandY should return x:50 and y:10', () => {
    p1 = { x: 50, y: 10 };
    p2 = { x: 50, y: 20 };
    q1 = { x: 20, y: 10 };
    q2 = { x: 10, y: 10 };
    expect(calculateXandY(p1, p2, q1, q2)).toEqual({ x: 50, y: 10 });
});

it(' intersects should return false if p2 is the same as q1', () => {
    p1 = { x: 50, y: 10 };
    p2 = { x: 50, y: 20 };
    q2 = { x: 10, y: 10 };
    expect(intersects(p1, p2, p2, q2)).toEqual(false);
});

it(' intersects should return false if x or y is NaN', () => {
    p1 = { x: 50, y: 10 };
    p2 = { x: 50, y: 20 };
    q1 = { x: 10, y: 10 };
    q2 = { x: 10, y: 10 };
    expect(intersects(p1, p2, q1, q2)).toEqual(false);
});

it(' intersects should return true', () => {
    p1 = { x: 491.3125, y: 205 };
    p2 = { x: 196.3125, y: 460 };
    q1 = { x: 844.3125, y: 484 };
    q2 = { x: 472.3125, y: 221 };
    expect(intersects(p1, p2, q1, q2)).toEqual(true);
});

it(' checkIntersection should return false', () => {
    p1 = { x: 528.3125, y: 134 };
    p2 = { x: 191.3125, y: 277 };
    q1 = { x: 210.3125, y: 569 };
    q2 = { x: 210.3125, y: 570 };
    expect(intersects(p1, p2, q1, q2)).toEqual(false);
});

it(' checkIfParallel should return false if pathData doesnt contains 2 parallel lines', () => {
    pathData = [
        { x: 245, y: 0 },
        { x: 0, y: 267 },
        { x: 237, y: 267 },
        { x: 245, y: 0 },
    ];
    mouseDownCoord = { x: 386.3125, y: 383 };
    expect(checkIfParallel(pathData, mouseDownCoord)).toEqual(false);
});

it(' checkIfParallel should return true if pathData contains 2 parallel lines', () => {
    pathData = [
        { x: 427.3125, y: 330 },
        { x: 427.3125, y: 695 },
    ];
    mouseDownCoord = { x: 427.3125, y: 588 };
    expect(checkIfParallel(pathData, mouseDownCoord)).toEqual(true);
});

it(' checkIfIntersect should return false if the pathData contains only 1 point', () => {
    pathData = [{ x: 427.3125, y: 330 }];
    mouseDownCoord = { x: 427.3125, y: 588 };
    expect(checkIfIntersect(pathData, mouseDownCoord)).toEqual(false);
});

it(' checkIfIntersect should return true if pathData contains 2 parallel lines', () => {
    pathData = [
        { x: 427.3125, y: 330 },
        { x: 427.3125, y: 695 },
    ];
    mouseDownCoord = { x: 427.3125, y: 588 };
    expect(checkIfIntersect(pathData, mouseDownCoord)).toEqual(true);
});

it(' checkIfIntersect should return false if the pathData contains only 2 points', () => {
    pathData = [
        { x: 427.3125, y: 330 },
        { x: 10, y: 10 },
    ];
    mouseDownCoord = { x: 427.3125, y: 588 };
    expect(checkIfIntersect(pathData, mouseDownCoord)).toEqual(false);
});

it(' checkIfIntersect should return true if the pathData contains atleast 2 lines that intersects', () => {
    pathData = [
        { x: 252, y: 0 },
        { x: 0, y: 246 },
        { x: 469, y: 276 },
        { x: 252, y: 0 },
    ];
    mouseDownCoord = { x: 251.3125, y: 312 };
    expect(checkIfIntersect(pathData, mouseDownCoord)).toEqual(true);
});

it(' checkIfIntersect should return false if the pathData doesnt contain 2 lines that intersects', () => {
    pathData = [
        { x: 584.3125, y: 278 },
        { x: 277.3125, y: 553 },
        { x: 847.3125, y: 579 },
    ];
    mouseDownCoord = { x: 609.3125, y: 265 };
    expect(checkIfIntersect(pathData, mouseDownCoord)).toEqual(false);
});

it(' finMin should return the smallest x and y in a pathData', () => {
    pathData = [
        { x: 252, y: 50 },
        { x: 0, y: 246 },
        { x: 469, y: 276 },
        { x: 252, y: 0 },
    ];
    expect(findMin(pathData)).toEqual({ x: 0, y: 0 });
});

it(' finMax should return the biggest x and y in a pathData', () => {
    pathData = [
        { x: 252, y: 0 },
        { x: 0, y: 246 },
        { x: 469, y: 276 },
        { x: 252, y: 0 },
    ];
    expect(findMax(pathData)).toEqual({ x: 469, y: 276 });
});

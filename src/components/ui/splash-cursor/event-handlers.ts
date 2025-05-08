
import { Pointer } from './types';
import { correctDeltaX, correctDeltaY, scaleByPixelRatio } from './fluid-simulation';
import { generateColor } from './pointer-utils';

export function initializeEventListeners(
  canvas: HTMLCanvasElement,
  pointers: Pointer[],
  splatStack: number[],
  PointerPrototype: new () => Pointer,
  config: { PAUSED: boolean }
) {
  canvas.addEventListener('mousedown', (e) => {
    let posX = scaleByPixelRatio(e.offsetX);
    let posY = scaleByPixelRatio(e.offsetY);
    let pointer = pointers.find((p) => p.id === -1);
    if (pointer == null) pointer = new PointerPrototype();
    updatePointerDownData(pointer, -1, posX, posY, canvas);
  });

  canvas.addEventListener('mousemove', (e) => {
    let pointer = pointers[0];
    if (!pointer.down) return;
    let posX = scaleByPixelRatio(e.offsetX);
    let posY = scaleByPixelRatio(e.offsetY);
    updatePointerMoveData(pointer, posX, posY, canvas);
  });

  window.addEventListener('mouseup', () => {
    pointers[0].down = false;
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touches = e.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      let posX = scaleByPixelRatio(touches[i].pageX - canvas.getBoundingClientRect().left);
      let posY = scaleByPixelRatio(touches[i].pageY - canvas.getBoundingClientRect().top);
      let pointer = pointers.find((p) => p.id === -1) || new PointerPrototype();
      updatePointerDownData(pointer, touches[i].identifier, posX, posY, canvas);
      if (!pointers.includes(pointer)) {
        pointers.push(pointer);
      }
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touches = e.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      let pointer = pointers.find((p) => p.id === touches[i].identifier);
      if (!pointer) continue;
      let posX = scaleByPixelRatio(touches[i].pageX - canvas.getBoundingClientRect().left);
      let posY = scaleByPixelRatio(touches[i].pageY - canvas.getBoundingClientRect().top);
      updatePointerMoveData(pointer, posX, posY, canvas);
    }
  }, false);

  window.addEventListener('touchend', (e) => {
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      let pointer = pointers.find((p) => p.id === touches[i].identifier);
      if (pointer) {
        pointer.down = false;
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP') config.PAUSED = !config.PAUSED;
    if (e.key === ' ') splatStack.push(parseInt((Math.random() * 20) + "")); // Random number of splats
  });

  // Make canvas actually usable with pointer events
  canvas.style.pointerEvents = 'auto';
}

export function updatePointerDownData(pointer: Pointer, id: number, posX: number, posY: number, canvas: HTMLCanvasElement) {
  pointer.id = id;
  pointer.down = true;
  pointer.moved = false;
  pointer.texcoordX = posX / canvas.width;
  pointer.texcoordY = 1.0 - posY / canvas.height;
  pointer.prevTexcoordX = pointer.texcoordX;
  pointer.prevTexcoordY = pointer.texcoordY;
  pointer.deltaX = 0;
  pointer.deltaY = 0;
  pointer.color = generateColor();
}

export function updatePointerMoveData(pointer: Pointer, posX: number, posY: number, canvas: HTMLCanvasElement) {
  pointer.prevTexcoordX = pointer.texcoordX;
  pointer.prevTexcoordY = pointer.texcoordY;
  pointer.texcoordX = posX / canvas.width;
  pointer.texcoordY = 1.0 - posY / canvas.height;
  pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX, canvas);
  pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY, canvas);
  pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
}

export function applyInputs(pointers: Pointer[], splatStack: number[], splat: Function, config: { SPLAT_FORCE: number }) {
  if (splatStack.length > 0) return;

  for (let i = 0; i < pointers.length; i++) {
    const pointer = pointers[i];
    if (pointer.moved) {
      splat(
        pointer.texcoordX,
        pointer.texcoordY,
        pointer.deltaX * config.SPLAT_FORCE,
        pointer.deltaY * config.SPLAT_FORCE,
        pointer.color
      );
      pointer.moved = false;
    }
  }
}

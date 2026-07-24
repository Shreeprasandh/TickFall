// Math utilities

export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function checkAABB(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Seeded Pseudo-Random Number Generator for deterministic floor generation
export class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min, max) {
    return this.next() * (max - min) + min;
  }

  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  choice(array) {
    return array[this.int(0, array.length - 1)];
  }
}

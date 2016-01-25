"use strict";

export default class Framebuffer {
  /*
   * Create a new framebuffer with `width` x `height` pixels.
   * `colorDepth` is informational only. The pixels are stored as 32-bit
   * values, as aRGB: 8 bits per color, big-endian (blue in the lowest 8
   * bits), with the highest 8 bits as alpha (transparency).
   */
  constructor(width, height, colorDepth) {
    // pixels are stored in (y, x) order, top to bottom, left to right.
    this.buffer = new ArrayBuffer(4 * width * height);
    this.pixels = new Uint32Array(this.buffer);
    this.width = width;
    this.height = height;
    this.colorDepth = colorDepth;
  }

  setPixel(x, y, color) {
    this.pixels[y * this.width + x] = color;
  }

  getPixel(x, y) {
    return this.pixels[y * this.width + x];
  }

  inspect() {
    return `Framebuffer(width=${this.width}, height=${this.height}, depth=${this.colorDepth})`;
  }

  /*
   * walk a flood-fill algorithm starting from a single point (default 0, 0).
   * for each pixel, call `f(x, y, pixel)`. the `f` function should return
   * `true` if the given pixel is "inside" the region, and we should keep
   * exploring in this direction. additionally, `f` may modify the image.
   * each pixel will only be called once.
   */
  walk(f, x = 0, y = 0) {
    const used = new Uint8Array(this.width * this.height);
    const workQueue = [ (y * this.width + x) ];

    while (workQueue.length > 0) {
      const offset = workQueue.pop();
      if (used[offset] == 0) {
        used[offset] = 1;
        const currentY = Math.floor(offset / this.width);
        const currentX = offset % this.width;
        const included = f(currentX, currentY, this.pixels[offset]);
        if (included) {
          // add work for any pixel nearby that's still in range.
          if (currentX > 0) workQueue.push(offset - 1);
          if (currentX < this.width - 1) workQueue.push(offset + 1);
          if (currentY > 0) workQueue.push(offset - this.width);
          if (currentY < this.height - 1) workQueue.push(offset + this.width);
        }
      }
    }
  }
}

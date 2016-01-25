"use strict";

import fs from "fs";
import { readBmp, writeBmp } from "./bmp";

import "source-map-support/register";

const FUZZ = 0.6;
const FUZZ_CLAMP = 0.3;

export function main() {
  const fb = readBmp("/Users/robey/Desktop/Pepper.bmp");
  console.log(fb.inspect());
  console.log(fb.getPixel(0, 0).toString(16));

  const YELLOW = fb.getPixel(0, 0);

  fb.walk((x, y, pixel) => {
    const delta = colorDifference(pixel, YELLOW);
    if (delta <= FUZZ) {
      if (delta <= FUZZ_CLAMP) {
        fb.setPixel(x, y, 0);
      } else {
        const newColor = subtractColor(pixel, YELLOW);
        const newAlpha = Math.floor(255 * delta);
        fb.setPixel(x, y, (newColor & 0xffffff) | (newAlpha << 24));
      }
      return true;
    }
    return false;
  });
  fb.colorDepth = 32;

  console.log(fb.inspect());
  console.log(fb.getPixel(0, 0).toString(16));
  fs.writeFileSync("/Users/robey/Desktop/Pepper-all-better.bmp", writeBmp(fb));
}

function colorDifference(color1, color2) {
  const vector1 = colorToVector(color1);
  const vector2 = colorToVector(color2);
  return Math.sqrt(
    Math.pow(vector1.blue - vector2.blue, 2.0) +
    Math.pow(vector1.green - vector2.green, 2.0) +
    Math.pow(vector1.red - vector2.red, 2.0)
  );
}

function subtractColor(color, badColor) {
  const vector = colorToVector(color);
  const badVector = colorToVector(badColor);
  vector.red *= (1.0 - badVector.red);
  vector.green *= (1.0 - badVector.green);
  vector.blue *= (1.0 - badVector.blue);
  return ((vector.red * 255) << 16) | ((vector.green * 255) << 8) | (vector.blue * 255);
}

function colorToVector(color) {
  const blue = (color & 0xff) / 255;
  const green = ((color & 0xff00) >> 8) / 255;
  const red = ((color & 0xff0000) >> 16) / 255;
  return { red, green, blue };
}

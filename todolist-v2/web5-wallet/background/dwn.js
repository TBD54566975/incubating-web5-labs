import { Dwn } from '@tbd54566975/dwn-sdk-js';

let dwn;

export async function open() {
  if (!dwn) {
    dwn = await Dwn.create({});
  }

  return dwn;
}
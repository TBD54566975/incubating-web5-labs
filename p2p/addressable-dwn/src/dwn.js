import { Dwn } from '@tbd54566975/dwn-sdk-js';
import { MessageStoreLevelv2 } from './message-store-level-v2.js';

export const messageStore = new MessageStoreLevelv2();
export const dwn = await Dwn.create({ messageStore });
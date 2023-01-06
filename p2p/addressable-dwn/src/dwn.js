import { Dwn } from '@tbd54566975/dwn-sdk-js';
import { MessageStore } from 'message-store-level-v2';

export const messageStore = new MessageStore();
export const dwn = await Dwn.create({ messageStore });
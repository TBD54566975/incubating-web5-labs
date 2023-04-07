import { KeyStore } from './key-store';
import { ProfileStore } from './profile-store';
import { PermissionStore } from './permission-store';
import { WatermarkStore } from './watermark-store';

export { ProfileStore } from './profile-store';
export { KeyStore } from './key-store';
export { PermissionStore } from './permission-store';
export { WatermarkStore } from './watermark-store';

export async function createIndexes() {
  await KeyStore.createIndexes();
  await ProfileStore.createIndexes();
  await PermissionStore.createIndexes();
  await WatermarkStore.createIndexes();
}
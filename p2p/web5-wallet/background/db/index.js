import { KeyStore } from './key-store';
import { IdentityStore } from './identity-store';
import { PermissionStore } from './permission-store';
import { WatermarkStore } from './watermark-store';

export { IdentityStore } from './identity-store';
export { KeyStore } from './key-store';
export { PermissionStore } from './permission-store';
export { WatermarkStore } from './watermark-store';

export async function createIndexes() {
  await KeyStore.createIndexes();
  await IdentityStore.createIndexes();
  await PermissionStore.createIndexes();
  await WatermarkStore.createIndexes();
}
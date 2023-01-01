import { IdentityStore } from '../db';

export async function createIdentity(request) {
  const { data } = request;
  const { didMethod, name, options } = data;

  // TODO: handle error
  await IdentityStore.create(name, didMethod, options);

  return { status: 201 };
}
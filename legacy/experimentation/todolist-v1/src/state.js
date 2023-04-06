import { createGlobalState, useStorage } from '@vueuse/core';

export const useGlobalState = createGlobalState(
  () => {
    // state
    const did = useStorage('did');
    const signatureMaterial = useStorage('sig-material', {});

    // getters
    function getDID() {
      return did.value;
    }

    function getSignatureMaterial() {
      return signatureMaterial.value;
    }


    // actions
    function setIdentity(didKey, privateJWK) {
      console.log('hello');
      did.value = didKey;

      signatureMaterial.value = {
        protectedHeader : { alg: privateJWK.alg, kid: privateJWK.kid },
        jwkPrivate      : privateJWK
      };
    }

    return {
      getDID,
      getSignatureMaterial,
      setIdentity
    };
  }
);
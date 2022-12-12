console.log('injected web5 onto window!');

window.web5 = {
  dwn: {
    requestAccess: async function () {
      const { data, errors } = await window.web5.send('DWN_REQUEST_ACCESS');

      // TODO: better error handling.
      if (errors) {
        throw new Error(errors);
      }

      // TODO: check for presence of result.errors
      return data;
    },

    processMessage: async function (message) {
      await window.web5.send('DWN_PROCESS_MESSAGE', message);
    }
  },
  send: function (cmd, data) {
    return new Promise((resolve, _) => {
      const evt = new CustomEvent('1660022065712_monkeys', {
        detail: { cmd, data, id: Date.now() }
      });

      document.addEventListener(evt.detail.id, e => {
        resolve(e.detail);
      });

      document.dispatchEvent(evt);
    });
  }
};

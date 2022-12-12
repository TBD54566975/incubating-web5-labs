console.log('injected web5 onto window!');

window.web5 = {
  dwn: {
    requestAccess: async function () {
      await window.web5.send('DWN_REQUEST_ACCESS');
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

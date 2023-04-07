export class AlarmRouter {
  #handlers;

  constructor() {
    this.#handlers = {};
    
    chrome.alarms.onAlarm.addListener(async alarm => {
      console.log('alarm triggered:', alarm);
      
      const handler = this.#handlers[alarm.name];

      if (!handler) {
        console.log(`no handler registered for ${alarm.name}`);
        return;
      }

      try {
        // TODO: think of ways to provide args to handler based on alarm name
        await handler();
      } catch(e) {
        console.error(`[${alarm.name}] handler error: ${e}`);
      }
    });
  }

  on(alarmName, handler) {
    this.#handlers[alarmName] = handler;
  }
}
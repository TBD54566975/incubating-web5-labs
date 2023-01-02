import { Level } from 'level';

const eventLog = new Level('EVENTLOG');

const tenantEventLog = eventLog.sublevel('2zA6zdCeuM2YurgkVc82BQdmouN1MMySmGHPxNrcb4zg');


for await (let [key, value] of tenantEventLog.iterator({ gt: '1672669482221482221' })) {
  console.log(key, value);
}
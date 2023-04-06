import { Temporal } from '@js-temporal/polyfill';

const now = Temporal.Now.instant().epochNanoseconds.toString()
console.log(now);
// USD/BTC

export type Offering = {
  /** what you want */
  want: string;
  /** what you have */
  have: string;
  /** how much have units does a want unit get you */
  conversionRate: number;
};

// const o: Offering = {
//   want: 'USD',
//   have: 'BTC',
//   conversionRate:
// };

// const a: Offering = {
//   want: 'BTC',
//   have: 'USD'
// }
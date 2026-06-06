/**
 * How a cabinet-level discount is applied.
 *
 *  - FLAT       → fixed amount subtracted from the price
 *  - PERCENTAGE → percentage of the price subtracted
 */
export enum DiscountType {
  FLAT = 'FLAT',
  PERCENTAGE = 'PERCENTAGE',
}

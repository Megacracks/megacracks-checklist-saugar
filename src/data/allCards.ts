import { CardItem } from '../types';
import { page1Cards } from './page1Data';
import { page2Cards } from './page2Data';
import { page3Cards } from './page3Data';
import { page4Cards } from './page4Data';
import { page5Cards } from './page5Data';

export const allCards: CardItem[] = [
  ...page1Cards,
  ...page2Cards,
  ...page3Cards,
  ...page4Cards,
  ...page5Cards,
];

// All cards can now be marked and collected
export const collectableCards = allCards;

export const TOTAL_COLLECTABLE = collectableCards.length;

export { page1Cards, page2Cards, page3Cards, page4Cards, page5Cards };

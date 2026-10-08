export interface CardItem {
  id: string; // e.g. "1", "1P", "21-empty", "379P", "25u-CR7", "auto-1"
  number: string;
  name: string;
  teamOrCategory?: string;
  positionOrTeam?: string;
  isEmpty?: boolean;
  page: 1 | 2 | 3 | 4 | 5;
  column: 1 | 2 | 3;
  section: string;
  isAutograph?: boolean;
  autographCount?: number;
  autographType?: 'single' | 'double';
}

export interface SectionBlock {
  title: string;
  items: CardItem[];
}

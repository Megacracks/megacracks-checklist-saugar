import React from 'react';
import { CardItem } from '../types';
import { CardRow } from './CardRow';
import { AutographsTable } from './AutographsTable';

interface PdfColumnProps {
  pageNumber: 1 | 2 | 3 | 4 | 5;
  columnNumber: 1 | 2 | 3;
  cards: CardItem[];
  checkedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
  searchTerm?: string;
}

export const PdfColumn: React.FC<PdfColumnProps> = ({
  pageNumber,
  columnNumber,
  cards,
  checkedIds,
  onToggle,
  searchTerm = '',
}) => {
  // Check if this is Page 4, Column 3 (Autographs table)
  if (pageNumber === 4 && columnNumber === 3) {
    return (
      <div className="w-full flex-1 min-w-0">
        <AutographsTable
          cards={cards}
          checkedIds={checkedIds}
          onToggle={onToggle}
          searchTerm={searchTerm}
        />
      </div>
    );
  }

  // Group cards by continuous section in this column
  const sections: { title: string; showHeader: boolean; items: CardItem[] }[] = [];
  let currentSectionTitle = '';
  let currentGroup: CardItem[] = [];

  cards.forEach((card) => {
    if (card.section !== currentSectionTitle) {
      if (currentGroup.length > 0) {
        sections.push({
          title: currentSectionTitle,
          showHeader: shouldShowHeader(currentSectionTitle, pageNumber, columnNumber, sections.length),
          items: currentGroup,
        });
      }
      currentSectionTitle = card.section;
      currentGroup = [card];
    } else {
      currentGroup.push(card);
    }
  });

  if (currentGroup.length > 0) {
    sections.push({
      title: currentSectionTitle,
      showHeader: shouldShowHeader(currentSectionTitle, pageNumber, columnNumber, sections.length),
      items: currentGroup,
    });
  }

  return (
    <div className="w-full flex-1 flex flex-col gap-2 min-w-0">
      {sections.map((sec, idx) => (
        <div
          key={`${sec.title}-${idx}`}
          className="border border-[#183d63] rounded-sm overflow-hidden bg-white shadow-xs"
        >
          {sec.showHeader && (
            <div className="bg-[#0b2742] text-white text-center py-0.5 sm:py-1 px-1 font-black font-['Barlow_Condensed'] text-xs sm:text-sm tracking-wider uppercase border-b border-[#183d63] flex items-center justify-between">
              <span className="w-full text-center">{sec.title}</span>
            </div>
          )}

          <table className="w-full border-collapse">
            <tbody>
              {sec.items.map((card) => (
                <CardRow
                  key={card.id}
                  card={card}
                  isChecked={Boolean(checkedIds[card.id])}
                  onToggle={onToggle}
                  isHighlighted={
                    searchTerm
                      ? card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        card.positionOrTeam?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        card.number.toLowerCase() === searchTerm.toLowerCase()
                      : false
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

// Helper: In the original Panini PDF, when a team spans across from bottom of Col 1 to top of Col 2,
// the top of Col 2 does NOT repeat the team title header.
function shouldShowHeader(
  sectionTitle: string,
  page: number,
  column: number,
  groupIndexInColumn: number
): boolean {
  if (column === 2 && groupIndexInColumn === 0) {
    // Continuations from column 1:
    if (page === 1 && sectionTitle === 'DEPORTIVO ALAVÉS') return false;
    if (page === 2 && sectionTitle === 'RCD ESPANYOL') return false;
    if (page === 3 && sectionTitle === 'REAL SOCIEDAD') return false;
    if (page === 4 && sectionTitle === 'STARS ON 25') return false;
  }
  return true;
}

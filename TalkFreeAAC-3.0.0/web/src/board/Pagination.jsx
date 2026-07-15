import React from 'react';

export function Pagination({ page, pages = [], onPage, enabled = true }) {
  if (pages.length <= 1) return null;
  const currentIndex = Math.max(0, pages.indexOf(page));
  const previousPage = pages[currentIndex - 1];
  const nextPage = pages[currentIndex + 1];

  return (
    <div className="pagination" aria-label="Column pages">
      <button type="button" onClick={() => onPage(previousPage)} disabled={!enabled || previousPage == null}>Previous</button>
      <span>Page {currentIndex + 1} of {pages.length}</span>
      <button type="button" onClick={() => onPage(nextPage)} disabled={!enabled || nextPage == null}>Next</button>
    </div>
  );
}

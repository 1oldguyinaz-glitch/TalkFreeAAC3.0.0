const DEFAULT_GAP_PX = 6;
const DEFAULT_CARD_ASPECT_RATIO = 0.8;
const MAX_FITTED_COLUMNS = 8;

export function calculateFittedGrid(
  slotCount,
  width,
  height,
  cardAspectRatio = DEFAULT_CARD_ASPECT_RATIO
) {
  const safeSlotCount = Math.max(1, Number(slotCount) || 1);
  const safeWidth = Math.max(1, Number(width) || 1);
  const safeHeight = Math.max(1, Number(height) || 1);
  const maximumColumns = Math.min(MAX_FITTED_COLUMNS, safeSlotCount);

  let best = {
    columns: Math.min(4, safeSlotCount),
    rows: Math.ceil(safeSlotCount / Math.min(4, safeSlotCount)),
    score: -1
  };

  for (let columns = 1; columns <= maximumColumns; columns += 1) {
    const rows = Math.ceil(safeSlotCount / columns);
    const cellWidth =
      (safeWidth - DEFAULT_GAP_PX * Math.max(0, columns - 1)) / columns;
    const cellHeight =
      (safeHeight - DEFAULT_GAP_PX * Math.max(0, rows - 1)) / rows;

    if (cellWidth <= 0 || cellHeight <= 0) continue;

    const fittedWidth = Math.min(cellWidth, cellHeight * cardAspectRatio);
    const fittedHeight = fittedWidth / cardAspectRatio;
    const unusedSlots = columns * rows - safeSlotCount;
    const score =
      fittedWidth * fittedHeight * (1 - Math.min(0.12, unusedSlots * 0.015));

    if (score > best.score) {
      best = { columns, rows, score };
    }
  }

  return {
    columns: best.columns,
    rows: best.rows
  };
}

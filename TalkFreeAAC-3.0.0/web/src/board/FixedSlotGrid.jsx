import React, { useEffect, useMemo, useRef, useState } from 'react';
import { itemsByFixedSlot } from './catalogSelectors.js';
import { calculateFittedGrid } from './gridFit.js';

export function FixedSlotGrid({
  items,
  slotCount,
  renderItem,
  emptyLabel = 'Reserved motor-plan position',
  fitToContainer = false
}) {
  const gridRef = useRef(null);
  const fallbackGrid = useMemo(
    () => calculateFittedGrid(slotCount, 900, 420),
    [slotCount]
  );
  const [fittedGrid, setFittedGrid] = useState(fallbackGrid);

  useEffect(() => {
    if (!fitToContainer || !gridRef.current) return undefined;

    const gridElement = gridRef.current;

    const updateGrid = () => {
      const { width, height } = gridElement.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const nextGrid = calculateFittedGrid(slotCount, width, height);
      setFittedGrid((currentGrid) =>
        currentGrid.columns === nextGrid.columns &&
        currentGrid.rows === nextGrid.rows
          ? currentGrid
          : nextGrid
      );
    };

    updateGrid();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateGrid);
      return () => window.removeEventListener('resize', updateGrid);
    }

    const observer = new ResizeObserver(updateGrid);
    observer.observe(gridElement);

    return () => observer.disconnect();
  }, [fitToContainer, slotCount]);

  const style = fitToContainer
    ? {
        '--fit-columns': fittedGrid.columns,
        '--fit-rows': fittedGrid.rows
      }
    : undefined;

  return (
    <div
      ref={gridRef}
      className={
        fitToContainer
          ? 'fixedSlotGrid fixedSlotGridFitted'
          : 'fixedSlotGrid'
      }
      data-slot-count={slotCount}
      data-fit-columns={fitToContainer ? fittedGrid.columns : undefined}
      data-fit-rows={fitToContainer ? fittedGrid.rows : undefined}
      style={style}
    >
      {itemsByFixedSlot(items, slotCount).map((item, index) => (
        <div className="fixedSlot" key={item?.id ?? `reserved-${index + 1}`}>
          {item ? (
            renderItem(item)
          ) : (
            <div className="reservedSlot" aria-hidden="true" title={emptyLabel} />
          )}
        </div>
      ))}
    </div>
  );
}

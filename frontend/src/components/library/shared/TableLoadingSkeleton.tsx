import { Component, For } from 'solid-js';

interface TableLoadingSkeletonProps {
  columnCount: number;
  rowCount?: number;
}

const TableLoadingSkeleton: Component<TableLoadingSkeletonProps> = (props) => {
  const rowCount = props.rowCount || 10;
  
  return (
    <tbody>
      <For each={Array(rowCount).fill(null)}>
        {() => (
          <tr class="table-row bg-slate-900/60 border-b border-pink-400/10 animate-pulse">
            <td class="table-cell p-4 w-12 text-center">
              <div class="w-6 h-3 bg-slate-700 rounded mx-auto"></div>
            </td>
            <td class="table-cell p-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-slate-700 rounded-lg"></div>
                <div>
                  <div class="w-32 h-4 bg-slate-700 rounded mb-2"></div>
                  <div class="w-24 h-3 bg-slate-700 rounded"></div>
                </div>
              </div>
            </td>
            <td class="table-cell p-4">
              <div class="w-20 h-3 bg-slate-700 rounded"></div>
            </td>
            <For each={Array(props.columnCount - 3).fill(null)}>
              {() => (
                <td class="table-cell p-4">
                  <div class="w-16 h-3 bg-slate-700 rounded"></div>
                </td>
              )}
            </For>
          </tr>
        )}
      </For>
    </tbody>
  );
};

export default TableLoadingSkeleton;
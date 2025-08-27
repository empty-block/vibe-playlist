import { Component, Show, For } from 'solid-js';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const TablePagination: Component<TablePaginationProps> = (props) => {
  const startItem = () => ((props.currentPage - 1) * props.itemsPerPage) + 1;
  const endItem = () => Math.min(props.currentPage * props.itemsPerPage, props.totalItems);

  return (
    <Show when={props.totalPages > 1}>
      <div class="flex items-center justify-between p-4 border-t border-pink-400/20 bg-gradient-to-r from-slate-900 to-slate-800">
        <div class="text-sm text-white/60">
          Showing {startItem()} to {endItem()} of {props.totalItems} tracks
        </div>
        
        <div class="flex items-center gap-2">
          <button
            onClick={() => props.onPageChange(Math.max(1, props.currentPage - 1))}
            disabled={props.currentPage === 1}
            class="px-3 py-1 rounded bg-slate-800 text-pink-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>
          
          <div class="flex gap-1">
            <For each={Array.from({ length: Math.min(5, props.totalPages) }, (_, i) => {
              const start = Math.max(1, props.currentPage - 2);
              return start + i;
            }).filter(page => page <= props.totalPages)}>
              {(page) => (
                <button
                  onClick={() => props.onPageChange(page)}
                  class={`px-3 py-1 rounded transition-colors ${
                    page === props.currentPage 
                      ? 'bg-pink-400 text-black font-semibold' 
                      : 'bg-slate-800 text-pink-400 hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              )}
            </For>
          </div>
          
          <button
            onClick={() => props.onPageChange(Math.min(props.totalPages, props.currentPage + 1))}
            disabled={props.currentPage === props.totalPages}
            class="px-3 py-1 rounded bg-slate-800 text-pink-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </Show>
  );
};

export default TablePagination;
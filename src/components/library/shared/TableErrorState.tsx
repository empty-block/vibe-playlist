import { Component } from 'solid-js';

interface TableErrorStateProps {
  columnSpan: number;
  errorMessage: string;
  onRetry: () => void;
}

const TableErrorState: Component<TableErrorStateProps> = (props) => {
  return (
    <tbody>
      <tr>
        <td colSpan={props.columnSpan} class="text-center py-16">
          <div class="text-red-400/60 text-lg mb-4">⚠️</div>
          <div class="text-red-400 text-lg font-semibold mb-2">Error Loading Library</div>
          <div class="text-white/50 text-sm mb-4">{props.errorMessage}</div>
          <button
            onClick={props.onRetry}
            class="bg-pink-400/20 text-pink-400 px-4 py-2 rounded-lg hover:bg-pink-400/30 transition-colors"
          >
            Try Again
          </button>
        </td>
      </tr>
    </tbody>
  );
};

export default TableErrorState;
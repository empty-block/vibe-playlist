import { Component, Show } from 'solid-js';

interface TableEmptyStateProps {
  columnSpan: number;
  icon: string;
  title: string;
  subtitle: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

const TableEmptyState: Component<TableEmptyStateProps> = (props) => {
  return (
    <tbody>
      <tr>
        <td colSpan={props.columnSpan} class="text-center py-16">
          <div class="text-4xl mb-4">{props.icon}</div>
          <div class="text-white/70 text-lg font-semibold mb-2">{props.title}</div>
          <div class="text-white/50 text-sm mb-4">{props.subtitle}</div>
          <Show when={props.actionButton}>
            <button 
              onClick={props.actionButton?.onClick}
              class="bg-pink-400/20 text-pink-400 px-6 py-3 rounded-lg hover:bg-pink-400/30 transition-all duration-300 border border-pink-400/30 hover:border-pink-300 hover:text-pink-300 font-semibold"
            >
              {props.actionButton?.label}
            </button>
          </Show>
        </td>
      </tr>
    </tbody>
  );
};

export default TableEmptyState;
import { Component, createSignal, Show } from 'solid-js';
import { Track } from '../../stores/playlistStore';
import LibraryTableRow from '../library/LibraryTableRow';

interface ExpandableTableRowProps {
  track: Track;
}

const ExpandableTableRow: Component<ExpandableTableRowProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(false);

  const hasLongContent = () => {
    const titleTooLong = props.track.title.length > 50;
    const commentTooLong = props.track.comment && props.track.comment.length > 80;
    return titleTooLong || commentTooLong;
  };

  const toggleExpanded = (e: Event) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded());
  };

  return (
    <>
      {/* Regular table row */}
      <LibraryTableRow track={props.track} />
      
      {/* Expandable details row */}
      <Show when={hasLongContent()}>
        <tr class="retro-expandable-row">
          <td colspan="8" class="p-0">
            {/* Toggle button */}
            <div class="retro-expand-button-container">
              <button
                onClick={toggleExpanded}
                class="retro-expand-button"
                title={isExpanded() ? "Collapse details" : "Expand details"}
              >
                <span class="text-neon-cyan">
                  {isExpanded() ? '▼' : '▶'}
                </span>
                <span class="ml-2 text-xs">
                  {isExpanded() ? 'COLLAPSE' : 'EXPAND'}
                </span>
              </button>
            </div>
            
            {/* Expanded content */}
            <Show when={isExpanded()}>
              <div 
                class="retro-expanded-content"
                style={{
                  background: 'linear-gradient(135deg, rgba(4, 202, 244, 0.05), rgba(0, 249, 42, 0.02))',
                  border: '1px solid rgba(4, 202, 244, 0.2)',
                  'border-radius': '8px',
                  margin: '0 16px 16px 16px',
                  padding: '20px'
                }}
              >
                {/* Full title if truncated */}
                <Show when={props.track.title.length > 50}>
                  <div class="mb-4">
                    <div class="text-neon-cyan text-xs uppercase tracking-wide mb-2 font-mono">
                      › FULL TRACK TITLE
                    </div>
                    <div class="text-white text-base font-medium leading-relaxed">
                      {props.track.title}
                    </div>
                  </div>
                </Show>
                
                {/* Full comment if truncated */}
                <Show when={props.track.comment && props.track.comment.length > 80}>
                  <div class="mb-4">
                    <div class="text-neon-cyan text-xs uppercase tracking-wide mb-2 font-mono">
                      › FULL CONTEXT
                    </div>
                    <div 
                      class="text-white/80 text-sm font-mono leading-relaxed p-4 rounded"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(4, 202, 244, 0.1)'
                      }}
                    >
                      {props.track.comment}
                    </div>
                  </div>
                </Show>
                
                {/* Terminal-style close prompt */}
                <div class="text-right">
                  <button
                    onClick={toggleExpanded}
                    class="text-xs font-mono text-neon-cyan/70 hover:text-neon-cyan transition-colors"
                  >
                    [ESC] COLLAPSE
                  </button>
                </div>
              </div>
            </Show>
          </td>
        </tr>
      </Show>
    </>
  );
};

export default ExpandableTableRow;
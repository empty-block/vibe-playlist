import { Component, For, Show, onMount } from 'solid-js';
import { staggeredFadeIn, glitch } from '../../../utils/animations';
import type { Suggestion } from '../HomePage';

interface DiscoverySuggestionsSectionProps {
  suggestions: Suggestion[];
  loading: boolean;
}

export const DiscoverySuggestionsSection: Component<DiscoverySuggestionsSectionProps> = (props) => {
  let sectionRef!: HTMLDivElement;
  let suggestionsGridRef!: HTMLDivElement;

  onMount(() => {
    if (suggestionsGridRef && !props.loading) {
      const suggestionItems = suggestionsGridRef.querySelectorAll('.suggestion-card');
      staggeredFadeIn(suggestionItems);
    }
  });

  const handleSuggestionClick = (suggestion: Suggestion) => {
    console.log('Exploring suggestion:', suggestion.title);
    // TODO: Navigate to discovery page with suggestion filter
  };

  return (
    <div ref={sectionRef} class="discovery-suggestions-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-bracket">[</span>
          DISCOVERY_ENGINE
          <span class="title-bracket">]</span>
        </h2>
        <div class="section-subtitle">Curated just for you</div>
      </div>

      <Show 
        when={!props.loading && props.suggestions.length > 0}
        fallback={
          <div class="loading-grid">
            <For each={Array(2).fill(0)}>
              {() => (
                <div class="suggestion-skeleton">
                  <div class="skeleton-header">
                    <div class="skeleton-type"></div>
                    <div class="skeleton-title"></div>
                  </div>
                  <div class="skeleton-description"></div>
                  <div class="skeleton-reasoning"></div>
                </div>
              )}
            </For>
          </div>
        }
      >
        <div ref={suggestionsGridRef} class="suggestions-grid">
          <For each={props.suggestions}>
            {(suggestion) => (
              <div 
                class={`suggestion-card ${suggestion.type}`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div class="suggestion-header">
                  <div class={`suggestion-type ${suggestion.type}`}>
                    {suggestion.type === 'trending' ? '[TRENDING]' : '[AI_CURATED]'}
                  </div>
                  <div class="suggestion-title">{suggestion.title}</div>
                </div>
                
                <div class="suggestion-content">
                  <div class="suggestion-description">
                    {suggestion.description}
                  </div>
                  
                  {suggestion.reasoning && (
                    <div class="suggestion-reasoning">
                      <span class="reasoning-label">WHY:</span>
                      <span class="reasoning-text">{suggestion.reasoning}</span>
                    </div>
                  )}
                </div>
                
                <div class="suggestion-action">
                  <span class="terminal-prompt">&gt;</span>
                  <span>EXPLORE</span>
                  <span class="action-arrow">→</span>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
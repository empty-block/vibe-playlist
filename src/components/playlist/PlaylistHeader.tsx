import { Component, createSignal, Show, onMount } from 'solid-js';
import { Playlist } from '../../stores/playlistStore';
import TextInput from '../common/TextInput';
import AnimatedButton from '../common/AnimatedButton';
import { replyBoxExpand, replyBoxCollapse, slideIn, magnetic, playButtonPulse } from '../../utils/animations';

interface PlaylistHeaderProps {
  playlist: Playlist;
  onCreatorClick: (creatorUsername: string) => void;
  searchQuery?: () => string;
  onSearchInput?: (value: string) => void;
  sortBy?: () => string;
  onSortChange?: (value: string) => void;
  onReply?: () => void;
  onAddTrack?: () => void;
  onPlayPlaylist?: () => void;
}

const PlaylistHeader: Component<PlaylistHeaderProps> = (props) => {
  const [showReplyBox, setShowReplyBox] = createSignal(false);
  const [comment, setComment] = createSignal('');
  const [trackUrl, setTrackUrl] = createSignal('');
  
  let replyBoxRef: HTMLDivElement;
  let headerRef: HTMLDivElement;
  let playlistImageRef: HTMLDivElement;

  // Mock playlist likes for now
  const playlistLikes = () => 47;

  const handleAddTrack = () => {
    if (!showReplyBox()) {
      setShowReplyBox(true);
      // Animate the reply box in after it's rendered
      setTimeout(() => {
        if (replyBoxRef) {
          replyBoxExpand(replyBoxRef);
        }
      }, 0);
    } else {
      // If form is already open, close it
      handleCloseReply();
    }
  };

  const handleCloseReply = () => {
    if (replyBoxRef) {
      // Animate out then hide
      replyBoxCollapse(replyBoxRef).finished.then(() => {
        setShowReplyBox(false);
        setComment('');
        setTrackUrl('');
      });
    } else {
      setShowReplyBox(false);
      setComment('');
      setTrackUrl('');
    }
  };

  const handleSubmitReply = () => {
    console.log('Submitting to playlist:', props.playlist.id);
    
    // Can submit with just a track URL, just a comment, or both
    if (trackUrl()) {
      console.log('Track URL:', trackUrl());
    }
    if (comment()) {
      console.log('Comment:', comment());
    }
    
    props.onAddTrack?.();
    
    // Reset and hide reply box
    setComment('');
    setTrackUrl('');
    setShowReplyBox(false);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canSubmit = () => {
    // Can submit if we have either a valid track URL or a comment
    const hasValidUrl = trackUrl().trim() && isValidUrl(trackUrl());
    const hasComment = comment().trim();
    return hasValidUrl || hasComment;
  };

  onMount(() => {
    // Animate the header in on mount
    if (headerRef) {
      slideIn.fromTop(headerRef);
    }
    
    // Add magnetic effect to playlist image
    if (playlistImageRef) {
      magnetic(playlistImageRef, 8);
    }
  });

  return (
    <div style={{ marginBottom: 'var(--zen-space-md)' }}>
      {/* MAIN PLAYLIST HEADER - RETRO DIGITAL DISPLAY */}
      <div 
        ref={headerRef!}
        class="relative rounded-xl overflow-hidden"
        style={{
          padding: 'var(--zen-space-lg)', /* More generous padding */
          marginBottom: 'var(--zen-space-lg)',
          background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
          border: '2px solid rgba(4, 202, 244, 0.25)',
          'box-shadow': `
            inset 0 0 20px rgba(0, 0, 0, 0.8),
            inset 0 2px 0 rgba(255, 255, 255, 0.08),
            inset 0 -2px 0 rgba(0, 0, 0, 0.4),
            0 0 15px rgba(4, 202, 244, 0.15)
          `
        }}
      >
        {/* Retro Scan Lines Effect */}
        <div 
          class="absolute inset-0 pointer-events-none opacity-8"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 3px,
              rgba(4, 202, 244, 0.06) 4px,
              rgba(4, 202, 244, 0.06) 5px
            )`
          }}
        />
        
        {/* Digital Display Header */}
        <div 
          class="flex items-center justify-between mb-4 px-3 py-2 rounded"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(4, 202, 244, 0.2)'
          }}
        >
          <div class="flex items-center gap-3">
            <div 
              class="w-3 h-3 rounded-full animate-pulse"
              style={{
                background: '#00f92a',
                'box-shadow': '0 0 6px rgba(0, 249, 42, 0.6)'
              }}
            />
            <span 
              class="text-sm font-mono uppercase tracking-widest"
              style={{
                color: '#04caf4',
                'text-shadow': '0 0 3px rgba(4, 202, 244, 0.5)'
              }}
            >
              PLAYLIST LOADED
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span 
              class="text-xs font-mono"
              style={{
                color: '#ff9b00',
                'text-shadow': '0 0 3px rgba(255, 155, 0, 0.4)'
              }}
            >
              {props.playlist.trackCount} TRACKS
            </span>
            <span class="text-xs text-gray-400">•</span>
            <button 
              class="text-xs font-mono font-bold transition-all duration-200"
              style={{
                color: '#f906d6',
                'text-shadow': '0 0 3px rgba(249, 6, 214, 0.6)',
                'font-family': 'Courier New, monospace'
              }}
              title="See who liked this playlist"
              onClick={() => console.log('Show who liked the playlist')}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00f92a';
                e.currentTarget.style.textShadow = '0 0 6px rgba(0, 249, 42, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#f906d6';
                e.currentTarget.style.textShadow = '0 0 3px rgba(249, 6, 214, 0.6)';
              }}
            >
              ❤ {playlistLikes()} LIKES
            </button>
            <span class="text-lg">🎵</span>
          </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
          {/* Playlist Artwork - Digital Frame */}
          <div class="flex-shrink-0 self-center lg:self-start">
            <div 
              ref={playlistImageRef!}
              class="relative group cursor-pointer"
              style={{
                padding: '6px',
                background: 'linear-gradient(145deg, #333, #111)',
                border: '3px solid rgba(255, 255, 255, 0.1)',
                'border-radius': '12px',
                'box-shadow': 'inset 0 0 15px rgba(0, 0, 0, 0.8)'
              }}
              onClick={(e) => {
                if (props.onPlayPlaylist) {
                  playButtonPulse(e.currentTarget as HTMLElement);
                  setTimeout(() => props.onPlayPlaylist!(), 200);
                }
              }}
              title="Play this playlist"
            >
              <img 
                src={props.playlist.image || 'https://via.placeholder.com/200x200/1a1a1a/04caf4?text=🎵'}
                alt={`${props.playlist.name} cover`}
                class="w-56 h-56 object-cover rounded-lg"
                style={{
                  filter: 'contrast(1.2) saturate(1.3)'
                }}
              />
              
              {/* Enhanced neon play overlay */}
              <div 
                class="absolute inset-1 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-lg"
                style={{
                  background: 'radial-gradient(circle, rgba(4, 202, 244, 0.9) 0%, rgba(0, 249, 42, 0.7) 100%)',
                  'backdrop-filter': 'blur(3px)'
                }}
              >
                <div 
                  class="w-16 h-16 rounded-full flex items-center justify-center border-3"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    'border-color': '#ffffff',
                    'box-shadow': '0 0 30px rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(4, 202, 244, 0.3)'
                  }}
                >
                  <i 
                    class="fas fa-play text-white text-2xl ml-1 drop-shadow-lg"
                    style={{'text-shadow': '0 0 10px rgba(255, 255, 255, 0.9)'}}
                  ></i>
                </div>
              </div>
            </div>
          </div>
          
          {/* Digital Information Display */}
          <div 
            class="flex-1 p-6 rounded-xl"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(4, 202, 244, 0.2)',
              'box-shadow': 'inset 0 0 10px rgba(0, 0, 0, 0.6)'
            }}
          >
            {/* Playlist Title - Enhanced Typography Scale */}
            <div style={{ marginBottom: 'var(--zen-space-lg)' }}>
              <h1 
                class="font-mono font-bold leading-tight break-words"
                style={{
                  'font-size': 'var(--zen-text-lg)', /* More readable main title size */
                  color: '#04caf4',
                  'text-shadow': '0 0 5px rgba(4, 202, 244, 0.5)',
                  'font-family': 'Courier New, monospace'
                }}
              >
                {props.playlist.name}
                <span style={{ marginLeft: 'var(--zen-space-sm)', fontSize: 'var(--zen-text-lg)' }}>🎸</span>
              </h1>
            </div>

            {/* Creator Info - Compact Single Row Layout */}
            <div style={{ marginBottom: 'var(--zen-space-md)' }}>
              <div class="flex items-center gap-3">
                <span 
                  class="font-mono uppercase tracking-wide"
                  style={{
                    'font-size': 'var(--zen-text-xs)',
                    color: 'rgba(249, 6, 214, 0.6)',
                    'text-shadow': '0 0 2px rgba(249, 6, 214, 0.3)'
                  }}
                >
                  CREATED BY
                </span>
                <button 
                  class="font-mono font-bold transition-all duration-200"
                  style={{
                    'font-size': 'var(--zen-text-md)', /* Clear hierarchy below title */
                    color: '#f906d6',
                    'text-shadow': '0 0 5px rgba(249, 6, 214, 0.5)',
                    'font-family': 'Courier New, monospace'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#00f92a';
                    e.currentTarget.style.textShadow = '0 0 8px rgba(0, 249, 42, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#f906d6';
                    e.currentTarget.style.textShadow = '0 0 5px rgba(249, 6, 214, 0.5)';
                  }}
                  onClick={() => props.onCreatorClick(props.playlist.createdBy)}
                >
                  {props.playlist.createdBy}
                </button>
              </div>
            </div>

            {/* Playlist Description */}
            {props.playlist.description && (
              <div style={{ 'margin-bottom': 'var(--zen-space-md)' }}>
                <p 
                  class="font-mono leading-relaxed"
                  style={{
                    'font-size': 'var(--zen-text-sm)',
                    color: '#ff9b00',
                    'text-shadow': '0 0 3px rgba(255, 155, 0, 0.4)',
                    'font-family': 'Courier New, monospace'
                  }}
                >
                  {props.playlist.description}
                </p>
              </div>
            )}

            {/* Enhanced Action Bar - Zen spacing and touch targets */}
            <div class="flex flex-col sm:flex-row items-center" style={{ gap: 'var(--zen-space-md)' }}>
              {/* Add Track Button - Enhanced touch target */}
              <button
                onClick={handleAddTrack}
                class="zen-touch-target font-mono font-bold transition-all duration-300 w-full sm:w-auto"
                style={{
                  padding: 'var(--zen-space-sm) var(--zen-space-lg)',
                  'font-size': 'var(--zen-text-xs)',
                  background: showReplyBox() 
                    ? 'linear-gradient(145deg, #1a4a1a, #2a2a2a)' 
                    : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                  border: showReplyBox() 
                    ? '2px solid #00f92a'
                    : '2px solid rgba(0, 249, 42, 0.4)',
                  color: showReplyBox() ? '#00f92a' : '#ffffff',
                  'border-radius': '6px',
                  'font-family': 'Courier New, monospace',
                  'letter-spacing': '0.05em',
                  'box-shadow': showReplyBox() 
                    ? '0 0 15px rgba(0, 249, 42, 0.6)'
                    : 'none',
                  'text-shadow': showReplyBox() 
                    ? '0 0 6px rgba(0, 249, 42, 0.6)'
                    : 'none'
                }}
                onMouseEnter={(e: MouseEvent) => {
                  if (!showReplyBox()) {
                    const target = e.currentTarget as HTMLButtonElement;
                    target.style.borderColor = '#00f92a';
                    target.style.boxShadow = '0 0 15px rgba(0, 249, 42, 0.4)';
                    target.style.color = '#00f92a';
                    target.style.textShadow = '0 0 6px rgba(0, 249, 42, 0.6)';
                  }
                }}
                onMouseLeave={(e: MouseEvent) => {
                  if (!showReplyBox()) {
                    const target = e.currentTarget as HTMLButtonElement;
                    target.style.borderColor = 'rgba(0, 249, 42, 0.4)';
                    target.style.boxShadow = 'none';
                    target.style.color = '#ffffff';
                    target.style.textShadow = 'none';
                  }
                }}
                title="Add to this playlist"
              >
                <i class="fas fa-plus mr-2"></i>
                {showReplyBox() ? 'CANCEL' : 'ADD TRACK'}
              </button>
              
              {/* Like Playlist Button */}
              <button
                onClick={() => console.log('Like playlist')}
                class="px-6 py-3 font-mono font-bold text-sm transition-all duration-300 w-full sm:w-auto"
                style={{
                  background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                  border: '2px solid rgba(249, 6, 214, 0.4)',
                  color: '#ffffff',
                  'border-radius': '6px',
                  'min-height': '44px',
                  'font-family': 'Courier New, monospace',
                  'letter-spacing': '0.05em'
                }}
                onMouseEnter={(e: MouseEvent) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.borderColor = '#f906d6';
                  target.style.boxShadow = '0 0 15px rgba(249, 6, 214, 0.4)';
                  target.style.color = '#f906d6';
                  target.style.textShadow = '0 0 6px rgba(249, 6, 214, 0.6)';
                }}
                onMouseLeave={(e: MouseEvent) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.borderColor = 'rgba(249, 6, 214, 0.4)';
                  target.style.boxShadow = 'none';
                  target.style.color = '#ffffff';
                  target.style.textShadow = 'none';
                }}
                title="Like this playlist"
              >
                <i class="fas fa-heart mr-2"></i>
                LIKE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Reply Box */}
      <Show when={showReplyBox()}>
        <div ref={replyBoxRef!} class="win95-panel p-4 mb-4">
          <h3 class="text-sm font-bold text-black mb-3 flex items-center gap-2">
            <i class="fas fa-plus"></i>
            Add to {props.playlist.createdBy}'s playlist
          </h3>
          
          <div class="space-y-4">
            {/* Track URL Section (Optional) */}
            <div class="border-l-4 border-green-400 pl-3">
              <label class="block text-xs font-bold text-black mb-1">
                <i class="fas fa-music mr-1"></i>
                Track URL (optional)
              </label>
              <TextInput
                value={trackUrl()}
                onInput={setTrackUrl}
                placeholder="Paste a YouTube, Spotify, or SoundCloud URL"
              />
              {trackUrl() && !isValidUrl(trackUrl()) && (
                <p class="text-xs text-red-600 mt-1">
                  Please enter a valid URL
                </p>
              )}
            </div>

            {/* Comment Section (Optional) */}
            <div class="border-l-4 border-blue-400 pl-3">
              <label class="block text-xs font-bold text-black mb-1">
                <i class="fas fa-comment mr-1"></i>
                Your comment (optional)
              </label>
              <TextInput
                value={comment()}
                onInput={setComment}
                placeholder="Share your thoughts or just add a track..."
                multiline={true}
                rows={2}
              />
            </div>

            {/* Helper text */}
            <div class="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <i class="fas fa-info-circle mr-1"></i>
              Add a track, leave a comment, or both!
            </div>
            
            <div class="flex gap-2 justify-end">
              <AnimatedButton
                onClick={handleCloseReply}
                class="win95-button px-4 py-2 text-sm font-bold"
                animationType="default"
              >
                Cancel
              </AnimatedButton>
              <AnimatedButton
                onClick={handleSubmitReply}
                disabled={!canSubmit()}
                class="win95-button px-4 py-2 text-sm font-bold"
                classList={{
                  'bg-green-100': canSubmit(),
                  'opacity-50 cursor-not-allowed': !canSubmit()
                }}
                animationType="social"
              >
                <i class="fas fa-plus mr-2"></i>
                Add
              </AnimatedButton>
            </div>
          </div>
        </div>
      </Show>
      
      {/* COMPACT SEARCH AND SORT CONTROLS */}
      {props.searchQuery && props.onSearchInput && (
        <div class="mb-4">
          {/* Single Row Layout: Sort + Search - More Compact */}
          <div class="flex flex-col lg:flex-row gap-4 p-4 rounded-lg" style={{
            background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
            border: '1px solid rgba(249, 6, 214, 0.2)'
          }}>
            {/* Sort Control - Inline Label */}
            {props.sortBy && props.onSortChange && (
              <div class="flex flex-col lg:flex-row lg:items-center gap-3 lg:min-w-80">
                <label 
                  class="text-sm font-mono uppercase tracking-wide flex-shrink-0"
                  style={{
                    color: 'rgba(4, 202, 244, 0.6)',
                    'text-shadow': '0 0 3px rgba(4, 202, 244, 0.4)'
                  }}
                >
                  SORT ORDER:
                </label>
                <select
                  value={props.sortBy()}
                  onChange={(e) => props.onSortChange!(e.currentTarget.value)}
                  class="flex-1 px-4 py-2 font-mono font-bold text-base rounded"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '2px solid rgba(4, 202, 244, 0.4)',
                    color: '#04caf4',
                    'text-shadow': '0 0 5px rgba(4, 202, 244, 0.6)',
                    'font-family': 'Courier New, monospace',
                    'min-height': '44px'
                  }}
                  title="Sort tracks"
                >
                  <option value="recent" style={{ background: '#1a1a1a', color: '#04caf4' }}>📅 MOST RECENT</option>
                  <option value="likes" style={{ background: '#1a1a1a', color: '#04caf4' }}>❤️ MOST LIKED</option>
                  <option value="comments" style={{ background: '#1a1a1a', color: '#04caf4' }}>💬 MOST COMMENTS</option>
                </select>
              </div>
            )}
            
            {/* Search Control - No Label */}
            <div class="flex gap-3 flex-1">
                <input
                  type="text"
                  placeholder="ENTER SEARCH QUERY..."
                  value={props.searchQuery()}
                  onInput={(e) => props.onSearchInput!(e.currentTarget.value)}
                  class="flex-1 px-4 py-2 font-mono font-bold text-base rounded"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '2px solid rgba(0, 249, 42, 0.4)',
                    color: '#00f92a',
                    'text-shadow': '0 0 5px rgba(0, 249, 42, 0.6)',
                    'font-family': 'Courier New, monospace',
                    'min-height': '44px'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#00f92a';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 249, 42, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button 
                  class="px-4 py-2 font-mono font-bold text-base transition-all duration-300 rounded"
                  style={{
                    background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                    border: '2px solid rgba(0, 249, 42, 0.4)',
                    color: '#ffffff',
                    'font-family': 'Courier New, monospace',
                    'min-height': '44px',
                    'min-width': '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00f92a';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 249, 42, 0.6)';
                    e.currentTarget.style.color = '#00f92a';
                    e.currentTarget.style.textShadow = '0 0 8px rgba(0, 249, 42, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.textShadow = 'none';
                  }}
                  title="Execute search"
                >
                  <i class="fas fa-search"></i>
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistHeader;
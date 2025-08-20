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
    <div class="mb-4">
      {/* Playlist Header - Simplified but with key features */}
      <div ref={headerRef!} class="p-4 mb-4">
        <div class="space-y-4">
          
          {/* Mobile-First Layout */}
          <div class="flex flex-col sm:flex-row items-start gap-4">
            {/* Playlist Image - Cyberpunk style with animated border */}
            <div 
              ref={playlistImageRef!}
              class="flex-shrink-0 relative group cursor-pointer self-center sm:self-start"
              style={{
                padding: '4px',
                background: 'linear-gradient(45deg, #3b00fd, #04caf4, #00f92a, #f906d6)',
                'background-size': '400% 400%',
                'border-radius': '12px',
                filter: 'drop-shadow(0 8px 25px rgba(59, 0, 253, 0.4))',
                animation: 'gradient-shift 6s ease infinite'
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
                src={props.playlist.image || 'https://via.placeholder.com/150x150/1a1a1a/04caf4?text=🎵'}
                alt={`${props.playlist.name} cover`}
                class="w-24 h-24 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover border-2 border-black"
                style={{
                  'border-radius': '8px',
                  filter: 'brightness(1.1) contrast(1.2)'
                }}
              />
              {/* Enhanced neon play overlay */}
              <div 
                class="absolute inset-1 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
                style={{
                  'border-radius': '8px',
                  background: 'radial-gradient(circle, rgba(4, 202, 244, 0.9) 0%, rgba(0, 249, 42, 0.7) 100%)',
                  'backdrop-filter': 'blur(2px)'
                }}
              >
                <div 
                  class="w-12 h-12 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-2"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    'border-color': '#ffffff',
                    'box-shadow': '0 0 30px rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(4, 202, 244, 0.3)'
                  }}
                >
                  <i 
                    class="fas fa-play text-white text-2xl sm:text-4xl ml-1 drop-shadow-lg"
                    style={{'text-shadow': '0 0 10px rgba(255, 255, 255, 0.9)'}}
                  ></i>
                </div>
              </div>
            </div>
            
            {/* Playlist Details */}
            <div class="flex-1 min-w-0 text-center sm:text-left">
              {/* Playlist Title - Mobile responsive with neon styling */}
              <h1 
                class="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 break-words"
                style={{
                  background: 'linear-gradient(135deg, #04caf4 0%, #00f92a 50%, #f906d6 100%)',
                  'background-clip': 'text',
                  '-webkit-background-clip': 'text',
                  color: 'transparent',
                  'text-shadow': '0 0 20px rgba(4, 202, 244, 0.5)',
                  filter: 'drop-shadow(0 0 10px rgba(0, 249, 42, 0.3))'
                }}
              >
                {props.playlist.name}
                <span class="ml-2 text-2xl">🎸</span>
              </h1>
              
              {/* Creator Info - Mobile responsive with neon styling */}
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-3 sm:mb-4">
                <span class="text-sm text-gray-600">Created by</span>
                <button 
                  class="text-base sm:text-lg font-bold transition-all duration-200 break-words"
                  style={{
                    color: '#04caf4',
                    'text-shadow': '0 0 10px rgba(4, 202, 244, 0.6)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#00f92a';
                    e.currentTarget.style.textShadow = '0 0 15px rgba(0, 249, 42, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#04caf4';
                    e.currentTarget.style.textShadow = '0 0 10px rgba(4, 202, 244, 0.6)';
                  }}
                  onClick={() => props.onCreatorClick(props.playlist.createdBy)}
                >
                  {props.playlist.createdBy}
                </button>
              </div>
              
              {/* Stats - Mobile responsive with neon glow */}
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm mb-4">
                <button 
                  class="flex items-center gap-1 transition-all duration-200 px-2 py-1 rounded"
                  style={{
                    color: '#04caf4',
                    'text-shadow': '0 0 8px rgba(4, 202, 244, 0.8)',
                    background: 'rgba(4, 202, 244, 0.1)',
                    border: '1px solid rgba(4, 202, 244, 0.3)',
                    'font-weight': '600'
                  }}
                  title="See who liked this playlist"
                  onClick={() => console.log('Show who liked the playlist')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(4, 202, 244, 0.6)';
                    e.currentTarget.style.background = 'rgba(4, 202, 244, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(4, 202, 244, 0.1)';
                  }}
                >
                  <i class="fas fa-heart mr-1"></i>
                  <span>{playlistLikes()} likes</span>
                </button>
                <span class="hidden sm:inline text-gray-400">•</span>
                <span style={{
                  color: '#04caf4',
                  'text-shadow': '0 0 6px rgba(4, 202, 244, 0.6)'
                }}>
                  {props.playlist.trackCount} tracks
                </span>
              </div>
              
              {/* Action Buttons - Mobile responsive with neon effects */}
              <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => console.log('Like playlist')}
                  class="px-5 py-3 font-bold text-sm group relative whitespace-nowrap flex-1 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                    border: '2px solid rgba(249, 6, 214, 0.4)',
                    color: '#ffffff',
                    'border-radius': '0px',
                    'min-height': '44px'
                  }}
                  onMouseEnter={(e: MouseEvent) => {
                    const target = e.currentTarget as HTMLButtonElement;
                    target.style.borderColor = '#f906d6';
                    target.style.boxShadow = '0 0 25px rgba(249, 6, 214, 0.6), 0 0 50px rgba(249, 6, 214, 0.3)';
                    target.style.color = '#f906d6';
                    target.style.textShadow = '0 0 10px rgba(249, 6, 214, 0.8)';
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
                  <span>Like</span>
                </button>
                
                <button
                  onClick={handleAddTrack}
                  class="px-5 py-3 font-bold text-sm group relative whitespace-nowrap flex-1 transition-all duration-300"
                  style={{
                    background: showReplyBox() 
                      ? 'linear-gradient(145deg, #1a4a1a, #2a2a2a)' 
                      : 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
                    border: showReplyBox() 
                      ? '2px solid #00f92a'
                      : '2px solid rgba(0, 249, 42, 0.4)',
                    color: showReplyBox() ? '#00f92a' : '#ffffff',
                    'border-radius': '0px',
                    'min-height': '44px',
                    'box-shadow': showReplyBox() 
                      ? '0 0 25px rgba(0, 249, 42, 0.8), 0 0 50px rgba(0, 249, 42, 0.4)'
                      : 'none',
                    'text-shadow': showReplyBox() 
                      ? '0 0 10px rgba(0, 249, 42, 0.8)'
                      : 'none'
                  }}
                  onMouseEnter={(e: MouseEvent) => {
                    if (!showReplyBox()) {
                      const target = e.currentTarget as HTMLButtonElement;
                      target.style.borderColor = '#00f92a';
                      target.style.boxShadow = '0 0 25px rgba(0, 249, 42, 0.6), 0 0 50px rgba(0, 249, 42, 0.3)';
                      target.style.color = '#00f92a';
                      target.style.textShadow = '0 0 10px rgba(0, 249, 42, 0.8)';
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
                  <span>+ Add to Playlist</span>
                </button>
              </div>
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
      
      {/* Search and Sort Bar */}
      {props.searchQuery && props.onSearchInput && (
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          {/* Sort Dropdown - Left side on desktop, full width on mobile */}
          {props.sortBy && props.onSortChange && (
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <span class="text-xs sm:text-sm font-bold text-black whitespace-nowrap">Sort by:</span>
              <select
                value={props.sortBy()}
                onChange={(e) => props.onSortChange!(e.currentTarget.value)}
                class="win95-panel px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-black flex-1 sm:flex-initial"
                title="Sort tracks"
              >
                <option value="recent">📅 Most Recent</option>
                <option value="likes">❤️ Most Liked</option>
                <option value="comments">💬 Most Comments</option>
              </select>
            </div>
          )}
          
          {/* Search Bar - Right side on desktop, below sort on mobile */}
          <div class="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search this playlist..."
              value={props.searchQuery()}
              onInput={(e) => props.onSearchInput!(e.currentTarget.value)}
              class="win95-panel px-3 py-1.5 sm:py-2 text-sm flex-1"
            />
            <button class="win95-button px-3 py-1.5 sm:py-2">
              <i class="fas fa-search text-sm"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistHeader;
import { Component, createSignal, Show, onMount } from 'solid-js';
import { Playlist } from '../../stores/playlistStore';
import { SortOption } from '../../pages/HomePage';

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

  const handleSubmitReply = () => {
    if (trackUrl() || comment()) {
      props.onAddTrack?.();
      setComment('');
      setTrackUrl('');
      setShowReplyBox(false);
    }
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
    const hasValidUrl = trackUrl().trim() && isValidUrl(trackUrl());
    const hasComment = comment().trim();
    return hasValidUrl || hasComment;
  };

  return (
    <div 
      class="mb-8 p-6 rounded-xl"
      style={{
        background: '#1a1a1a',
        border: '2px solid rgba(4, 202, 244, 0.4)'
      }}
    >
      {/* READY STATUS BAR */}
      <div 
        class="flex items-center justify-between mb-6 px-4 py-2 rounded"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(4, 202, 244, 0.3)'
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
            class="text-base font-mono uppercase tracking-widest"
            style={{
              color: '#04caf4',
              'text-shadow': '0 0 3px rgba(4, 202, 244, 0.5)',
              'font-family': 'Courier New, monospace'
            }}
          >
            PLAYLIST READY
          </span>
        </div>
        <div class="flex items-center gap-3 text-sm font-mono">
          <span style={{ color: 'rgba(4, 202, 244, 0.6)' }}>
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      {/* PLAYLIST INFO & CONTROLS */}
      <div class="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Playlist Image */}
        <div class="flex-shrink-0">
          <div 
            class="relative group cursor-pointer rounded-lg overflow-hidden"
            onClick={() => props.onPlayPlaylist?.()}
            title="Play this playlist"
          >
            <img 
              src={props.playlist.image || 'https://via.placeholder.com/200x200/1a1a1a/04caf4?text=🎵'}
              alt={`${props.playlist.name} cover`}
              class="w-48 h-48 object-cover"
              style={{
                border: '2px solid rgba(4, 202, 244, 0.3)'
              }}
            />
            
            {/* Play overlay */}
            <div 
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
              style={{
                background: 'rgba(0, 0, 0, 0.8)'
              }}
            >
              <div 
                class="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #3b00fd 0%, #04caf4 100%)',
                  'box-shadow': '0 0 20px rgba(59, 0, 253, 0.6)'
                }}
              >
                <i class="fas fa-play text-white text-2xl ml-1"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Playlist Details */}
        <div class="flex-1">
          <div class="mb-4">
            <p 
              class="text-lg mb-3"
              style={{
                color: 'rgba(249, 6, 214, 0.7)'
              }}
            >
              Created by{' '}
              <button
                onClick={() => props.onCreatorClick(props.playlist.createdBy)}
                class="font-bold transition-all duration-200"
                style={{
                  color: '#04caf4',
                  background: 'rgba(4, 202, 244, 0.1)',
                  padding: '2px 8px',
                  'border-radius': '4px',
                  border: '1px solid rgba(4, 202, 244, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(4, 202, 244, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 8px rgba(4, 202, 244, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(4, 202, 244, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {props.playlist.createdBy}
              </button>
            </p>
            <p 
              class="text-lg"
              style={{
                color: 'rgba(255, 255, 255, 0.6)'
              }}
            >
              {props.playlist.description}
            </p>
          </div>

          {/* Stats */}
          <div class="flex items-center gap-6 text-lg">
            <span style={{ color: 'rgba(4, 202, 244, 0.8)' }}>
              <i class="fas fa-music mr-2"></i>
              {props.playlist.trackCount} tracks
            </span>
            <span style={{ color: 'rgba(0, 249, 42, 0.8)' }}>
              <i class="fas fa-heart mr-2"></i>
              47 likes
            </span>
            <span style={{ color: 'rgba(255, 155, 0, 0.8)' }}>
              <i class="fas fa-clock mr-2"></i>
              {props.playlist.timestamp}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div class="flex flex-col gap-3">
          <button
            onClick={() => props.onPlayPlaylist?.()}
            class="px-8 py-4 font-bold text-lg transition-all duration-300 rounded flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, #3b00fd 0%, #04caf4 100%)',
              border: '2px solid #3b00fd',
              color: '#ffffff',
              'box-shadow': '0 0 10px rgba(59, 0, 253, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 0, 253, 0.6)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 10px rgba(59, 0, 253, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <i class="fas fa-play"></i>
            Play All
          </button>
          
          <button
            onClick={() => setShowReplyBox(!showReplyBox())}
            class="px-8 py-4 font-bold text-lg transition-all duration-300 rounded flex items-center gap-3"
            style={{
              background: 'rgba(0, 249, 42, 0.1)',
              border: '2px solid rgba(0, 249, 42, 0.4)',
              color: '#00f92a'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 249, 42, 0.2)';
              e.currentTarget.style.borderColor = '#00f92a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 249, 42, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
            }}
          >
            <i class="fas fa-plus"></i>
            Add Track
          </button>
        </div>
      </div>

      {/* SEARCH & SORT BAR */}
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-1 flex gap-3">
          <input
            type="text"
            placeholder="Search tracks..."
            value={props.searchQuery?.() || ''}
            onInput={(e) => props.onSearchInput?.(e.currentTarget.value)}
            class="flex-1 px-6 py-4 font-bold text-lg rounded"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              border: '2px solid rgba(4, 202, 244, 0.4)',
              color: '#04caf4',
              'min-height': '48px'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#04caf4';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(4, 202, 244, 0.4)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.4)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
        
        <div class="flex items-center gap-3">
          <span 
            class="text-sm font-bold uppercase tracking-wide"
            style={{
              color: 'rgba(0, 249, 42, 0.7)'
            }}
          >
            Sort by:
          </span>
          <select
            value={props.sortBy?.() || 'recent'}
            onChange={(e) => props.onSortChange?.(e.currentTarget.value)}
            class="px-6 py-4 font-bold text-lg rounded cursor-pointer"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              border: '2px solid rgba(0, 249, 42, 0.4)',
              color: '#00f92a',
              'min-height': '48px'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#00f92a';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 249, 42, 0.4)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 249, 42, 0.4)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <option value="recent">Recent</option>
            <option value="likes">Most Liked</option>
            <option value="comments">Most Discussed</option>
          </select>
        </div>
      </div>

      {/* ADD TRACK FORM */}
      <Show when={showReplyBox()}>
        <div 
          class="p-4 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            border: '2px solid rgba(0, 249, 42, 0.4)'
          }}
        >
          <div class="space-y-4">
            <input
              type="url"
              placeholder="Track URL (YouTube, Spotify, SoundCloud)..."
              value={trackUrl()}
              onInput={(e) => setTrackUrl(e.currentTarget.value)}
              class="w-full px-4 py-3 rounded"
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid rgba(4, 202, 244, 0.4)',
                color: '#04caf4'
              }}
            />
            
            <textarea
              placeholder="Add a comment about this track (optional)..."
              value={comment()}
              onInput={(e) => setComment(e.currentTarget.value)}
              class="w-full px-4 py-3 rounded resize-none"
              rows="3"
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid rgba(4, 202, 244, 0.4)',
                color: '#04caf4'
              }}
            />
            
            <div class="flex justify-end gap-3">
              <button
                onClick={() => setShowReplyBox(false)}
                class="px-6 py-2 font-bold rounded transition-all"
                style={{
                  background: 'rgba(255, 155, 0, 0.1)',
                  border: '2px solid rgba(255, 155, 0, 0.4)',
                  color: '#ff9b00'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={!canSubmit()}
                class="px-6 py-2 font-bold rounded transition-all"
                style={{
                  background: canSubmit() 
                    ? 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)' 
                    : 'rgba(100, 100, 100, 0.3)',
                  border: `2px solid ${canSubmit() ? '#00f92a' : 'rgba(100, 100, 100, 0.5)'}`,
                  color: canSubmit() ? '#000000' : '#666666',
                  cursor: canSubmit() ? 'pointer' : 'not-allowed'
                }}
              >
                Add to Playlist
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default PlaylistHeader;
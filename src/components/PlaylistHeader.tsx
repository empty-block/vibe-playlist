import { Component, createSignal, Show, onMount } from 'solid-js';
import { Playlist } from '../stores/playlistStore';
import TextInput from './TextInput';
import AnimatedButton from './AnimatedButton';
import { replyBoxExpand, replyBoxCollapse, slideIn, magnetic, playButtonPulse } from '../utils/animations';

interface PlaylistHeaderProps {
  playlist: Playlist;
  onCreatorClick: (creatorUsername: string) => void;
  searchQuery?: () => string;
  onSearchInput?: (value: string) => void;
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
      <div ref={headerRef!} class="win95-panel p-4 mb-4">
        <div class="space-y-4">
          
          {/* Main Content Row with Image on Left */}
          <div class="flex items-start gap-4">
            {/* Playlist Image - Keep original large size */}
            <div 
              ref={playlistImageRef!}
              class="flex-shrink-0 relative group cursor-pointer"
              onClick={(e) => {
                if (props.onPlayPlaylist) {
                  playButtonPulse(e.currentTarget as HTMLElement);
                  setTimeout(() => props.onPlayPlaylist!(), 200);
                }
              }}
              title="Play this playlist"
            >
              <img 
                src={props.playlist.image || 'https://via.placeholder.com/150x150/c0c0c0/000000?text=🎵'}
                alt={`${props.playlist.name} cover`}
                class="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-lg shadow-lg border-2 border-gray-300 hover:shadow-xl transition-shadow duration-200"
              />
              {/* Purple gradient overlay on hover */}
              <div class="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-blue-600/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div class="w-20 h-20 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-2xl border-2 border-white/30">
                  <i class="fas fa-play text-white text-4xl ml-1 drop-shadow-lg"></i>
                </div>
              </div>
            </div>
            
            {/* Playlist Details */}
            <div class="flex-1 min-w-0">
              {/* Playlist Title - Bigger */}
              <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-3">
                {props.playlist.name}
              </h1>
              
              {/* Creator Info - Slightly bigger */}
              <div class="flex items-center gap-2 mb-4">
                <span class="text-base text-gray-600">Created by</span>
                <button 
                  class="text-lg font-bold text-black hover:text-blue-700 transition-colors"
                  onClick={() => props.onCreatorClick(props.playlist.createdBy)}
                >
                  {props.playlist.createdBy}
                </button>
                <span class="text-base text-gray-500">•</span>
                <span class="text-base text-gray-500">{props.playlist.createdAt}</span>
              </div>
              
              {/* Like count display - clickable to see who liked */}
              <div class="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <button 
                  class="flex items-center gap-2 hover:text-blue-600 transition-colors"
                  title="See who liked this playlist"
                  onClick={() => console.log('Show who liked the playlist')}
                >
                  <span>{playlistLikes()} likes</span>
                </button>
                <span>•</span>
                <span>{props.playlist.trackCount} tracks</span>
              </div>
              
              {/* Action Buttons - Now inside the right column */}
              <div class="flex gap-3">
                <AnimatedButton
                  onClick={() => console.log('Like playlist')}
                  class="win95-button px-3 py-1.5 text-black font-bold text-xs sm:text-sm group relative whitespace-nowrap flex-1"
                  title="Like this playlist"
                  animationType="social"
                >
                  <i class="fas fa-heart mr-1.5"></i>
                  <span>Like</span>
                </AnimatedButton>
                
                <AnimatedButton
                  onClick={handleAddTrack}
                  class="win95-button px-3 py-1.5 text-black font-bold text-xs sm:text-sm group relative whitespace-nowrap flex-1"
                  title="Add to this playlist"
                  classList={{
                    'bg-green-100': showReplyBox()
                  }}
                  animationType="social"
                >
                  <i class="fas fa-plus mr-1.5"></i>
                  <span>Add to Playlist</span>
                </AnimatedButton>
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
                class="win95-button px-4 py-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      {/* Search Bar - Separate from the main cast */}
      {props.searchQuery && props.onSearchInput && (
        <div class="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Search this playlist..."
            value={props.searchQuery()}
            onInput={(e) => props.onSearchInput!(e.currentTarget.value)}
            class="win95-panel px-3 py-2 text-sm flex-1"
          />
          <button class="win95-button px-3 py-2">
            <i class="fas fa-search text-sm"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default PlaylistHeader;
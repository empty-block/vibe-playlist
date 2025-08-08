import { Component, createSignal, Show, onMount } from 'solid-js';
import { Playlist } from '../stores/playlistStore';
import SocialStats from './social/SocialStats';
import TextInput from './TextInput';
import AnimatedButton from './AnimatedButton';
import { replyBoxExpand, replyBoxCollapse, slideIn } from '../utils/animations';

interface PlaylistHeaderProps {
  playlist: Playlist;
  onCreatorClick: (creatorUsername: string) => void;
  searchQuery?: () => string;
  onSearchInput?: (value: string) => void;
  onReply?: () => void;
  onAddTrack?: () => void;
}

const PlaylistHeader: Component<PlaylistHeaderProps> = (props) => {
  const [showReplyBox, setShowReplyBox] = createSignal(false);
  const [replyText, setReplyText] = createSignal('');
  const [trackUrl, setTrackUrl] = createSignal('');
  const [focusField, setFocusField] = createSignal<'comment' | 'track' | null>(null);
  
  let replyBoxRef: HTMLDivElement;
  let headerRef: HTMLDivElement;

  // Mock social stats for the playlist cast
  const playlistStats = () => ({
    likes: 47,
    recasts: 23,
    replies: props.playlist.trackCount + 12 // Tracks + actual comments
  });

  const handleReply = (action: 'comment' | 'track') => {
    if (showReplyBox()) {
      // If already open, just change focus
      setFocusField(action);
    } else {
      // Open the reply box and set focus
      setShowReplyBox(true);
      setFocusField(action);
      
      // Animate the reply box in after it's rendered
      setTimeout(() => {
        if (replyBoxRef) {
          replyBoxExpand(replyBoxRef);
        }
      }, 0);
    }
  };

  const handleCloseReply = () => {
    if (replyBoxRef) {
      // Animate out then hide
      replyBoxCollapse(replyBoxRef).finished.then(() => {
        setShowReplyBox(false);
        setReplyText('');
        setTrackUrl('');
        setFocusField(null);
      });
    } else {
      setShowReplyBox(false);
      setReplyText('');
      setTrackUrl('');
      setFocusField(null);
    }
  };

  const handleSubmitReply = () => {
    console.log('Submitting to playlist:', props.playlist.id);
    
    if (focusField() === 'comment') {
      // Pure comment reply
      console.log('Text reply:', replyText());
      props.onReply?.();
    } else if (focusField() === 'track') {
      // Track addition (with optional comment)
      console.log('Track URL:', trackUrl());
      console.log('Optional comment:', replyText() || 'None');
      props.onAddTrack?.();
    }
    
    // Reset and hide reply box
    setReplyText('');
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
    if (focusField() === 'comment') {
      // Reply mode: only need comment
      return replyText().trim();
    } else if (focusField() === 'track') {
      // Add track mode: only need valid track URL
      return trackUrl().trim() && isValidUrl(trackUrl());
    }
    return false;
  };

  onMount(() => {
    // Animate the header in on mount
    if (headerRef) {
      slideIn.fromTop(headerRef);
    }
  });

  return (
    <div class="mb-4">
      {/* Playlist Cast Header - Like a Farcaster Post */}
      <div ref={headerRef!} class="win95-panel p-4 mb-4">
        {/* Main Content Layout - Always two columns */}
        <div class="flex items-start gap-4">
          
          {/* Left Section: Creator Info & Playlist Content */}
          <div class="flex-1 min-w-0 max-w-[60%]">
            {/* Creator Info Row */}
            <div class="flex items-start gap-3 mb-3">
              <button 
                class="flex-shrink-0 text-2xl hover:scale-110 transition-transform"
                onClick={() => props.onCreatorClick(props.playlist.createdBy)}
                title={`View ${props.playlist.createdBy}'s profile`}
              >
                {props.playlist.creatorAvatar}
              </button>
              
              <div class="flex-1 min-w-0">
                <div class="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-1">
                  <button 
                    class="text-left font-bold text-black hover:text-blue-700 transition-colors"
                    onClick={() => props.onCreatorClick(props.playlist.createdBy)}
                  >
                    {props.playlist.createdBy}
                  </button>
                  <span class="text-sm text-gray-500">
                    {props.playlist.createdAt}
                    {props.playlist.isCollaborative && (
                      <>
                        {' • '}
                        <i class="fas fa-users mr-1"></i>
                        {props.playlist.memberCount} members
                      </>
                    )}
                  </span>
                </div>
                
                {/* Playlist Title & Description - The "Cast Content" */}
                <h1 class="text-xl font-bold text-black mb-2">
                  {props.playlist.name}
                </h1>
                <p class="text-sm text-gray-700 leading-relaxed break-words">
                  {props.playlist.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Social Stats & Actions */}
          <div class="flex-shrink-0 w-[35%]">
            <div class="flex flex-col items-end gap-3">
              {/* Action Buttons - Stack on mobile */}
              <div class="flex flex-col gap-1 w-full">
                <AnimatedButton
                  onClick={() => handleReply('comment')}
                  class="win95-button px-2 py-1 text-black font-bold text-xs group relative whitespace-nowrap w-full"
                  title="Reply with a comment"
                  classList={{
                    'bg-blue-100': showReplyBox() && focusField() === 'comment'
                  }}
                  animationType="social"
                >
                  <i class="fas fa-comment mr-1"></i>
                  <span>Reply</span>
                </AnimatedButton>
                
                <AnimatedButton
                  onClick={() => handleReply('track')}
                  class="win95-button px-2 py-1 text-black font-bold text-xs group relative whitespace-nowrap w-full"
                  title="Add a track to this playlist"
                  classList={{
                    'bg-green-100': showReplyBox() && focusField() === 'track'
                  }}
                  animationType="social"
                >
                  <i class="fas fa-music mr-1"></i>
                  <span>Add Track</span>
                </AnimatedButton>
              </div>
              
              {/* Social Stats - Below action buttons */}
              <div class="w-full">
                <SocialStats
                  likes={playlistStats().likes}
                  recasts={playlistStats().recasts}
                  replies={playlistStats().replies}
                  size="sm"
                  showLabels={true}
                  interactive={true}
                  onLikeClick={() => console.log('Like playlist')}
                  onRepliesClick={() => console.log('View all replies')}
                  className="text-gray-500 justify-start flex-col md:flex-row"
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Unified Reply Box */}
      <Show when={showReplyBox()}>
        <div ref={replyBoxRef!} class="win95-panel p-4 mb-4 relative">
          {/* Close Button */}
          <button 
            onClick={handleCloseReply}
            class="absolute top-2 right-2 win95-button w-6 h-6 text-xs font-bold flex items-center justify-center hover:bg-red-100 transition-colors"
            title="Close"
          >
            ×
          </button>
          
          <h3 class="text-sm font-bold text-black mb-3 flex items-center gap-2 pr-8">
            <i class={focusField() === 'track' ? 'fas fa-music' : 'fas fa-reply'}></i>
            {focusField() === 'track' ? 'Add a track to' : 'Reply to'} {props.playlist.createdBy}'s playlist
          </h3>
          
          <div class="space-y-4">
            {/* Comment Section - Always show with blue highlight */}
            <div class="border-l-4 border-blue-400 pl-3">
              <label class="block text-xs font-bold text-black mb-1">
                <i class="fas fa-comment mr-1"></i>
                {focusField() === 'track' ? 'Your comment (optional)' : 'Your comment'}
              </label>
              <TextInput
                value={replyText()}
                onInput={setReplyText}
                placeholder={focusField() === 'track' 
                  ? "What do you think of this track? (optional)"
                  : "Share your thoughts on this playlist..."
                }
                multiline={true}
                rows={focusField() === 'comment' ? 3 : 2}
              />
            </div>

            {/* Track URL Section - Only show when "Add a Track" was clicked */}
            <Show when={focusField() === 'track'}>
              <div class="border-l-4 border-green-400 pl-3">
                <label class="block text-xs font-bold text-black mb-1">
                  <i class="fas fa-music mr-1"></i>
                  Track URL
                </label>
                <TextInput
                  value={trackUrl()}
                  onInput={setTrackUrl}
                  placeholder="Paste a track URL (YouTube, Spotify, SoundCloud, etc.)"
                />
                {trackUrl() && !isValidUrl(trackUrl()) && (
                  <p class="text-xs text-red-600 mt-1">
                    Please enter a valid URL
                  </p>
                )}
              </div>
            </Show>

            {/* Helper text */}
            <div class="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <i class="fas fa-info-circle mr-1"></i>
              {focusField() === 'track' 
                ? 'Paste a track URL above. Add a comment to share your thoughts about it!'
                : 'Share your thoughts about this playlist.'
              }
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
                  'bg-green-100': canSubmit() && focusField() === 'track',
                  'bg-blue-100': canSubmit() && focusField() === 'comment',
                  'opacity-50 cursor-not-allowed': !canSubmit()
                }}
                animationType={focusField() === 'track' ? 'social' : 'default'}
              >
                <i class={focusField() === 'track' ? 'fas fa-music mr-2' : 'fas fa-paper-plane mr-2'}></i>
                {focusField() === 'track' ? 'Add Track' : 'Reply'}
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
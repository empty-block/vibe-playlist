import { Component, Show, JSX, createSignal, For, onMount } from 'solid-js';
import { currentTrack, isPlaying, setIsPlaying } from '../../stores/playlistStore';
import SocialStats from '../social/SocialStats';
import SocialActions from '../social/SocialActions';
import ReplyItem from '../social/ReplyItem';
import { playbackButtonHover } from '../../utils/animations';

interface PlayerProps {
  isCompact?: () => boolean;
  mediaComponent: JSX.Element;
  onTogglePlay: () => void;
  playerReady: () => boolean;
  currentTime?: () => number;
  duration?: () => number;
  onSeek?: (time: number) => void;
  onForceCompact?: (force: boolean) => void;
}

const Player: Component<PlayerProps> = (props) => {
  const isCompact = () => props.isCompact?.() ?? false;
  
  // State
  const [newComment, setNewComment] = createSignal('');
  const [showAllReplies, setShowAllReplies] = createSignal(false);
  const [showSocialModal, setShowSocialModal] = createSignal(false);
  
  // Refs for animations
  let playButtonRef: HTMLButtonElement;
  let prevButtonRef: HTMLButtonElement;
  let nextButtonRef: HTMLButtonElement;
  let compactPlayButtonRef: HTMLButtonElement;
  let compactPrevButtonRef: HTMLButtonElement;
  let compactNextButtonRef: HTMLButtonElement;
  
  // Handlers
  const handleSkipPrevious = () => {
    console.log('Skip to previous track');
    // TODO: Implement playlist navigation
  };
  
  const handleSkipNext = () => {
    console.log('Skip to next track');
    // TODO: Implement playlist navigation
  };
  
  const handleAddComment = () => {
    const comment = newComment().trim();
    if (!comment) return;
    
    console.log('Adding comment:', comment);
    // TODO: Implement comment posting
    setNewComment('');
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Set up button animations
  onMount(() => {
    const buttons = [
      playButtonRef,
      prevButtonRef, 
      nextButtonRef,
      compactPlayButtonRef,
      compactPrevButtonRef,
      compactNextButtonRef
    ];

    buttons.forEach(button => {
      if (button) {
        button.addEventListener('mouseenter', () => {
          playbackButtonHover.enter(button);
        });

        button.addEventListener('mouseleave', () => {
          playbackButtonHover.leave(button);
        });
      }
    });
  });

  // Desktop Player Component
  const DesktopPlayer = () => (
    <div class="h-full bg-gray-100 flex flex-col">
      {/* Desktop Header */}
      <div class="windows-titlebar p-2 flex justify-between items-center">
        <span><i class="fas fa-play-circle mr-2"></i>Now Playing</span>
        <button 
          class="win95-button w-6 h-4 text-xs font-bold text-black"
          onClick={() => props.onForceCompact?.(true)}
          title="Minimize to compact player"
        >
          _
        </button>
      </div>

      {/* Scrollable Content */}
      <div class="flex-1 p-4 overflow-y-auto">
        {/* Media Player */}
        <div class="win95-panel p-3 mb-4">
          {props.mediaComponent}
        </div>
        
        {/* Track Info */}
        <div class="mb-4">
          <h3 class="font-bold text-black text-xl mb-2 leading-tight">
            {currentTrack()?.title}
          </h3>
          <p class="text-gray-600 text-lg mb-2">{currentTrack()?.artist}</p>
          <p class="text-gray-500 text-base mb-3">
            Added by {currentTrack()?.userAvatar} {currentTrack()?.addedBy}
          </p>
          
          {/* Song Comment */}
          <div class="p-3 bg-blue-50 rounded border-l-4 border-blue-400 mb-4">
            <p class="text-sm text-gray-700 italic font-medium">
              "{currentTrack()?.comment}"
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {currentTrack()?.timestamp}
            </p>
          </div>
        </div>
        
        {/* Progress Bar - For non-YouTube sources */}
        <Show when={currentTrack()?.source !== 'youtube' && (props.currentTime || props.duration)}>
          <div class="mb-3">
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <span>{formatTime(props.currentTime?.() || 0)}</span>
              <div class="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  class="bg-blue-500 h-full transition-all duration-200"
                  style={{
                    width: `${((props.currentTime?.() || 0) / (props.duration?.() || 1)) * 100}%`
                  }}
                ></div>
              </div>
              <span>{formatTime(props.duration?.() || 0)}</span>
            </div>
          </div>
        </Show>

        {/* Desktop Controls */}
        <div class="flex flex-col items-center w-full mb-4">
          <div class="flex items-center justify-center gap-4 mb-3">
            <button 
              ref={prevButtonRef!}
              onClick={handleSkipPrevious}
              class="win95-button w-12 h-12 flex items-center justify-center text-lg"
              disabled={!props.playerReady()}
            >
              <i class="fas fa-step-backward"></i>
            </button>
            
            <button 
              ref={playButtonRef!}
              onClick={props.onTogglePlay}
              class="win95-button w-16 h-16 flex items-center justify-center text-2xl"
              disabled={!props.playerReady()}
            >
              <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'}`}></i>
            </button>
            
            <button 
              ref={nextButtonRef!}
              onClick={handleSkipNext}
              class="win95-button w-12 h-12 flex items-center justify-center text-lg"
              disabled={!props.playerReady()}
            >
              <i class="fas fa-step-forward"></i>
            </button>
          </div>
          
          {/* Player Status */}
          <div class="lcd-text inline-block px-3 py-1 text-sm">
            {props.playerReady() ? 
              (isPlaying() ? '▶ PLAYING' : '⏸ PAUSED') : 
              '⏳ LOADING...'
            }
          </div>
        </div>
        
        {/* Track Stats */}
        <div class="pt-4 border-t border-gray-400 mb-4">
          <SocialStats
            likes={currentTrack()?.likes || 0}
            recasts={currentTrack()?.recasts || 0}
            replies={currentTrack()?.replies || 0}
            size="sm"
            showLabels={false}
          />
        </div>

        {/* Track Actions */}
        <div class="mb-4">
          <SocialActions
            onLike={() => console.log('Like track')}
            onAdd={() => console.log('Add to playlist')}
            onShare={() => console.log('Share track')}
            size="sm"
            variant="buttons"
          />
        </div>
        
        {/* Replies Section */}
        <div>
          <h4 class="text-sm font-bold text-gray-700 mb-2">
            <i class="fas fa-comments mr-1"></i>
            Replies ({currentTrack()?.repliesData?.length || 0})
          </h4>
          
          <div class="bg-gray-50 border-2 border-gray-300 rounded">
            <Show when={currentTrack()?.repliesData && currentTrack()?.repliesData!.length > 0} fallback={
              <div class="p-4 text-center text-gray-500 text-sm">
                No replies yet. Be the first to comment!
              </div>
            }>
              <For each={showAllReplies() ? currentTrack()?.repliesData : currentTrack()?.repliesData?.slice(0, 5)}>
                {(reply) => (
                  <ReplyItem
                    reply={reply}
                    variant="default"
                    onLike={(replyId) => console.log('Like reply:', replyId)}
                    onReply={(replyId) => console.log('Reply to:', replyId)}
                  />
                )}
              </For>
              
              <Show when={currentTrack()?.repliesData && currentTrack()?.repliesData!.length > 5}>
                <div class="p-2 border-t border-gray-300 bg-gray-50">
                  <button
                    onClick={() => setShowAllReplies(!showAllReplies())}
                    class="w-full text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showAllReplies() 
                      ? `Show less` 
                      : `Show ${currentTrack()?.repliesData!.length - 5} more replies`}
                  </button>
                </div>
              </Show>
            </Show>
          </div>
          
          {/* Comment Input */}
          <div class="mt-3">
            <div class="flex gap-2">
              <input
                type="text"
                value={newComment()}
                onInput={(e) => setNewComment(e.target.value)}
                placeholder="Add your reply..."
                class="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment().trim()}
                class="win95-button px-3 py-2 text-xs disabled:opacity-50"
              >
                <i class="fas fa-paper-plane mr-1"></i>
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Compact Player Component
  const CompactPlayer = () => (
    <div class="h-full bg-gray-100 flex items-center px-4 gap-4">
      {/* Media Player Area */}
      <div class="flex-shrink-0">
        {props.mediaComponent}
      </div>
      
      {/* Track Info */}
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-black text-sm leading-tight truncate">
          {currentTrack()?.title}
        </h3>
        <p class="text-gray-600 text-xs truncate">{currentTrack()?.artist}</p>
        <p class="text-gray-500 text-xs truncate hidden sm:block">
          Added by {currentTrack()?.userAvatar} {currentTrack()?.addedBy}
        </p>
      </div>
      
      {/* Compact Controls - Fixed and properly centered */}
      <div class="flex items-center justify-center gap-2">
        <button 
          ref={compactPrevButtonRef!}
          onClick={handleSkipPrevious}
          class="win95-button w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xs sm:text-sm"
          disabled={!props.playerReady()}
          title="Previous track"
        >
          <i class="fas fa-step-backward"></i>
        </button>
        
        <button 
          ref={compactPlayButtonRef!}
          onClick={props.onTogglePlay}
          class="win95-button w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm sm:text-lg"
          disabled={!props.playerReady()}
        >
          <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
        
        <button 
          ref={compactNextButtonRef!}
          onClick={handleSkipNext}
          class="win95-button w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xs sm:text-sm"
          disabled={!props.playerReady()}
          title="Next track"
        >
          <i class="fas fa-step-forward"></i>
        </button>
        
        <button 
          onClick={() => setShowSocialModal(true)}
          class="win95-button w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xs sm:text-sm relative"
          title="View comments and replies"
        >
          <i class="fas fa-comment"></i>
          <Show when={currentTrack()?.replies && currentTrack()!.replies > 0}>
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {currentTrack()?.replies}
            </span>
          </Show>
        </button>
        
        <div class="hidden lg:block">
          <button 
            onClick={() => props.onForceCompact?.(false)}
            class="win95-button w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xs sm:text-sm"
            title="Expand to full player"
          >
            <i class="fas fa-expand-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );

  // Social Modal Component
  const SocialModal = () => (
    <div class="fixed inset-0 z-50 flex items-end justify-center p-4">
      {/* Backdrop */}
      <div 
        class="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setShowSocialModal(false)}
      ></div>
      
      {/* Modal Content */}
      <div class="relative bg-gray-50 w-full max-w-lg max-h-[80vh] rounded-t-lg border-2 border-gray-300 border-b-0 animate-slide-up mb-4">
        {/* Modal Header */}
        <div class="flex items-center justify-between p-3 border-b-2 border-gray-300 bg-gray-100">
          <h3 class="font-bold text-sm flex items-center gap-2">
            <i class="fas fa-comments"></i>
            Comments & Replies
          </h3>
          <button 
            onClick={() => setShowSocialModal(false)}
            class="win95-button w-6 h-6 text-xs font-bold flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        {/* Modal Body */}
        <div class="overflow-y-auto max-h-[60vh]">
          {/* Original Song Comment */}
          <div class="p-4 bg-blue-50 border-b-2 border-gray-300">
            <div class="flex items-start gap-3">
              <span class="text-lg flex-shrink-0">{currentTrack()?.userAvatar}</span>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-bold text-sm">Created by {currentTrack()?.addedBy}</span>
                  <span class="text-xs text-gray-500">{currentTrack()?.timestamp}</span>
                </div>
                <p class="text-sm text-gray-800 font-medium italic">
                  "{currentTrack()?.comment}"
                </p>
                <div class="mt-2">
                  <SocialStats
                    likes={currentTrack()?.likes || 0}
                    recasts={currentTrack()?.recasts || 0}
                    replies={currentTrack()?.replies || 0}
                    size="sm"
                    showLabels={true}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Replies Section */}
          <div class="p-4">
            <h4 class="text-sm font-bold text-gray-700 mb-3">
              Replies ({currentTrack()?.repliesData?.length || 0})
            </h4>
            
            <Show when={currentTrack()?.repliesData && currentTrack()?.repliesData!.length > 0} fallback={
              <div class="text-center text-gray-500 text-sm py-4">
                No replies yet. Be the first to comment!
              </div>
            }>
              <div class="space-y-3">
                <For each={showAllReplies() ? currentTrack()?.repliesData : currentTrack()?.repliesData?.slice(0, 5)}>
                  {(reply) => (
                    <ReplyItem
                      reply={reply}
                      variant="modal"
                      onLike={(replyId) => console.log('Like reply:', replyId)}
                      onReply={(replyId) => console.log('Reply to:', replyId)}
                    />
                  )}
                </For>
                
                <Show when={currentTrack()?.repliesData && currentTrack()?.repliesData!.length > 5}>
                  <div class="text-center">
                    <button
                      onClick={() => setShowAllReplies(!showAllReplies())}
                      class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {showAllReplies() 
                        ? `Show less` 
                        : `Show ${currentTrack()?.repliesData!.length - 5} more replies`}
                    </button>
                  </div>
                </Show>
              </div>
            </Show>
          </div>
        </div>
        
        {/* Comment Input */}
        <div class="p-4 border-t-2 border-gray-300 bg-gray-50">
          <div class="flex gap-2">
            <input
              type="text"
              value={newComment()}
              onInput={(e) => setNewComment(e.target.value)}
              placeholder="Add your reply..."
              class="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment().trim()}
              class="win95-button px-4 py-2 text-sm disabled:opacity-50"
            >
              <i class="fas fa-paper-plane mr-1"></i>
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Show when={currentTrack()}>
      {/* Main Player */}
      {isCompact() ? <CompactPlayer /> : <DesktopPlayer />}
      
      {/* Social Modal - Only in compact mode */}
      <Show when={isCompact() && showSocialModal()}>
        <SocialModal />
      </Show>
    </Show>
  );
};

export default Player;
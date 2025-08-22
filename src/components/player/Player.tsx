import { Component, Show, JSX, createSignal, For, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { currentTrack, isPlaying, playingPlaylistId, setCurrentPlaylistId } from '../../stores/playlistStore';
import SocialStats from '../social/SocialStats';
import SocialActions from '../social/SocialActions';
import ReplyItem from '../social/ReplyItem';
import { playbackButtonHover } from '../../utils/animations';

interface PlayerProps {
  mediaComponent: JSX.Element;
  onTogglePlay: () => void;
  playerReady: () => boolean;
  currentTime?: () => number;
  duration?: () => number;
  onSeek?: (time: number) => void;
}

const Player: Component<PlayerProps> = (props) => {
  // State
  const [newComment, setNewComment] = createSignal('');
  const [showAllReplies, setShowAllReplies] = createSignal(false);
  const [showDiscussionModal, setShowDiscussionModal] = createSignal(false);
  const navigate = useNavigate();
  
  // Refs for animations
  let playButtonRef: HTMLButtonElement | undefined;
  let prevButtonRef: HTMLButtonElement | undefined;
  let nextButtonRef: HTMLButtonElement | undefined;
  let joinButtonRef: HTMLButtonElement | undefined;
  let likeButtonRef: HTMLButtonElement | undefined;
  
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

  const handleGoToPlayingPlaylist = () => {
    // Set the current playlist to the one that's actually playing
    setCurrentPlaylistId(playingPlaylistId());
    // Navigate to player page to show the playing playlist
    navigate('/player');
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Set up button animations
  onMount(() => {
    const playbackButtons = [playButtonRef, prevButtonRef, nextButtonRef].filter(
      (button): button is HTMLButtonElement => button !== undefined
    );

    playbackButtons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        playbackButtonHover.enter(button);
      });

      button.addEventListener('mouseleave', () => {
        playbackButtonHover.leave(button);
      });
    });
  });

  // Discussion Modal Component
  const DiscussionModal = () => (
    <div class="fixed inset-0 z-50 flex items-end justify-center p-4">
      {/* Backdrop */}
      <div 
        class="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setShowDiscussionModal(false)}
      ></div>
      
      {/* Modal Content */}
      <div class="relative bg-gray-50 w-full max-w-lg max-h-[80vh] rounded-t-lg border-2 border-gray-300 border-b-0 animate-slide-up mb-4">
        {/* Modal Header */}
        <div class="flex items-center justify-between p-3 border-b-2 border-gray-300 bg-gray-100">
          <h3 class="font-bold text-sm flex items-center gap-2">
            <i class="fas fa-comments"></i>
            Join Discussion
          </h3>
          <button 
            onClick={() => setShowDiscussionModal(false)}
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
            
            <Show when={currentTrack()?.repliesData && currentTrack()!.repliesData.length > 0} fallback={
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
                
                <Show when={currentTrack()?.repliesData && currentTrack()!.repliesData.length > 5}>
                  <div class="text-center">
                    <button
                      onClick={() => setShowAllReplies(!showAllReplies())}
                      class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {showAllReplies() 
                        ? `Show less` 
                        : `Show ${(currentTrack()?.repliesData?.length || 0) - 5} more replies`}
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
      {/* Bottom Player Bar - Enhanced Design */}
      <div class="h-32 md:h-auto flex items-center px-4 md:px-8 gap-3 md:gap-6 border-t-2" style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
        borderTopColor: 'rgba(4, 202, 244, 0.4)'
      }}>
        
        <div class="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full max-w-7xl mx-auto relative z-10 py-4 md:py-0">
          {/* LEFT SECTION (30%): Hero Track Info */}
          <div class="w-full md:w-[30%] md:flex-shrink-0 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(0, 249, 42, 0.12) 0%, rgba(4, 202, 244, 0.08) 100%)',
            border: '2px solid rgba(0, 249, 42, 0.6)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: `
              0 0 20px rgba(0, 249, 42, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `
          }}>
            {/* Status Indicator */}
            <div class="flex items-center gap-3 mb-3">
              <div class="w-3 h-3 rounded-full animate-pulse" style={{
                background: isPlaying() ? '#00f92a' : '#04caf4',
                boxShadow: isPlaying() ? '0 0 8px #00f92a' : '0 0 8px #04caf4'
              }}></div>
              <span class="text-xs font-mono uppercase tracking-wide" style={{
                color: '#04caf4',
                textShadow: '0 0 4px rgba(4, 202, 244, 0.8)',
                letterSpacing: '0.1em'
              }}>
                {isPlaying() ? 'NOW PLAYING' : 'PAUSED'}
              </span>
              {/* Platform Badge */}
              <div class="ml-auto px-2 py-1 text-xs font-mono rounded" style={{
                background: currentTrack()?.source === 'youtube' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(30, 215, 96, 0.2)',
                color: currentTrack()?.source === 'youtube' ? '#ff0000' : '#1ed760',
                border: `1px solid ${currentTrack()?.source === 'youtube' ? 'rgba(255, 0, 0, 0.4)' : 'rgba(30, 215, 96, 0.4)'}`
              }}>
                {currentTrack()?.source?.toUpperCase()}
              </div>
            </div>

            {/* Enhanced Track Information */}
            <div class="space-y-2">
              <h3 class="font-bold leading-tight truncate" style={{
                color: '#04caf4',
                textShadow: '0 0 8px rgba(4, 202, 244, 0.8)',
                fontFamily: 'Courier New, monospace',
                fontSize: '24px'
              }}>
                {currentTrack()?.title}
              </h3>
              <p class="truncate" style={{
                color: '#00f92a',
                textShadow: '0 0 6px rgba(0, 249, 42, 0.6)',
                fontFamily: 'Courier New, monospace',
                fontSize: '18px'
              }}>
                {currentTrack()?.artist}
              </p>
              <p class="text-sm truncate italic" style={{
                color: 'rgba(255, 155, 0, 0.8)',
                fontFamily: 'Courier New, monospace'
              }}>
                Added by {currentTrack()?.userAvatar} {currentTrack()?.addedBy}
              </p>
            </div>
          </div>

          {/* CENTER SECTION (40%): Neon Command Center */}
          <div class="w-full md:w-[40%] md:flex-shrink-0 relative" style={{
            background: 'linear-gradient(135deg, rgba(59, 0, 253, 0.12) 0%, rgba(4, 202, 244, 0.08) 50%, rgba(0, 249, 42, 0.06) 100%)',
            border: '2px solid rgba(4, 202, 244, 0.6)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: `
              0 0 15px rgba(4, 202, 244, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 2px 4px rgba(0,0,0,0.8)
            `
          }}>
            
            {/* Single Row Layout: Centered Transport Controls with Playlist/Chat */}
            <div class="flex items-center justify-center gap-4">
                {/* Playlist View Button - Orange Neon Accent */}
                <button
                  onClick={handleGoToPlayingPlaylist}
                  class="win95-button"
                  style={{
                    width: '56px',
                    height: '56px',
                    border: '2px solid rgba(255, 155, 0, 0.5)',
                    borderTop: '2px solid rgba(255, 155, 0, 0.7)',
                    borderLeft: '2px solid rgba(255, 155, 0, 0.6)',
                    background: 'linear-gradient(145deg, rgba(255, 155, 0, 0.08) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%)',
                    color: '#ff9b00',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textShadow: '0 0 6px rgba(255, 155, 0, 0.8)',
                    boxShadow: `
                      inset 0 2px 4px rgba(255,255,255,0.1), 
                      inset 0 -1px 3px rgba(0,0,0,0.8), 
                      0 0 8px rgba(255, 155, 0, 0.4)
                    `,
                    fontFamily: 'Courier New, monospace',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  title="View current playlist"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255, 155, 0, 0.2) 0%, rgba(255, 155, 0, 0.1) 50%, rgba(0, 0, 0, 0.8) 100%)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.textShadow = '0 0 8px rgba(255,255,255,0.9)';
                    e.currentTarget.style.borderColor = 'rgba(255, 155, 0, 0.9)';
                    e.currentTarget.style.boxShadow = `
                      inset 0 2px 4px rgba(255,255,255,0.2), 
                      inset 0 -1px 3px rgba(0,0,0,0.5), 
                      0 0 15px rgba(255, 155, 0, 0.7)
                    `;
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255, 155, 0, 0.08) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%)';
                    e.currentTarget.style.color = '#ff9b00';
                    e.currentTarget.style.textShadow = '0 0 6px rgba(255, 155, 0, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(255, 155, 0, 0.5)';
                    e.currentTarget.style.boxShadow = `
                      inset 0 2px 4px rgba(255,255,255,0.1), 
                      inset 0 -1px 3px rgba(0,0,0,0.8), 
                      0 0 8px rgba(255, 155, 0, 0.4)
                    `;
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <i class="fas fa-list"></i>
                </button>
                
                {/* Previous Button - Neon Supporting Design */}
                <button 
                  ref={prevButtonRef!}
                  onClick={handleSkipPrevious}
                  class="win95-button"
                  style={{
                    width: '56px',
                    height: '56px',
                    border: '2px solid rgba(4, 202, 244, 0.5)',
                    borderTop: '2px solid rgba(4, 202, 244, 0.7)',
                    borderLeft: '2px solid rgba(4, 202, 244, 0.6)',
                    background: 'linear-gradient(145deg, rgba(4, 202, 244, 0.08) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%)',
                    color: '#04caf4',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    textShadow: '0 0 6px rgba(4, 202, 244, 0.8)',
                    boxShadow: `
                      inset 0 2px 4px rgba(255,255,255,0.1), 
                      inset 0 -1px 3px rgba(0,0,0,0.8), 
                      0 0 8px rgba(4, 202, 244, 0.4)
                    `,
                    fontFamily: 'Courier New, monospace',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  disabled={!props.playerReady()}
                  title="Previous track"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(4, 202, 244, 0.2) 0%, rgba(4, 202, 244, 0.1) 50%, rgba(0, 0, 0, 0.8) 100%)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.textShadow = '0 0 8px rgba(255,255,255,0.9)';
                    e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.9)';
                    e.currentTarget.style.boxShadow = `
                      inset 0 2px 4px rgba(255,255,255,0.2), 
                      inset 0 -1px 3px rgba(0,0,0,0.5), 
                      0 0 15px rgba(4, 202, 244, 0.7)
                    `;
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(4, 202, 244, 0.08) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%)';
                    e.currentTarget.style.color = '#04caf4';
                    e.currentTarget.style.textShadow = '0 0 6px rgba(4, 202, 244, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.5)';
                    e.currentTarget.style.boxShadow = `
                      inset 0 2px 4px rgba(255,255,255,0.1), 
                      inset 0 -1px 3px rgba(0,0,0,0.8), 
                      0 0 8px rgba(4, 202, 244, 0.4)
                    `;
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <i class="fas fa-step-backward"></i>
                </button>
                
                {/* HERO Play/Pause Button - Multi-layer Neon Glow */}
                <button 
                  ref={playButtonRef!}
                  onClick={props.onTogglePlay}
                  class="win95-button"
                  style={{
                    width: '80px',
                    height: '80px',
                    border: '3px solid rgba(59, 0, 253, 0.8)',
                    borderTop: '3px solid rgba(4, 202, 244, 0.9)',
                    borderLeft: '3px solid rgba(0, 249, 42, 0.7)',
                    background: isPlaying() 
                      ? 'linear-gradient(145deg, rgba(0, 249, 42, 0.9) 0%, rgba(4, 202, 244, 0.8) 30%, rgba(59, 0, 253, 0.7) 70%, rgba(0, 0, 0, 0.3) 100%)'
                      : 'linear-gradient(145deg, rgba(59, 0, 253, 0.9) 0%, rgba(4, 202, 244, 0.8) 30%, rgba(0, 249, 42, 0.7) 70%, rgba(0, 0, 0, 0.3) 100%)',
                    color: '#ffffff',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    textShadow: `
                      0 0 4px rgba(255,255,255,1),
                      0 0 8px rgba(255,255,255,0.8),
                      0 0 12px ${isPlaying() ? 'rgba(0, 249, 42, 0.8)' : 'rgba(59, 0, 253, 0.8)'}
                    `,
                    boxShadow: isPlaying() 
                      ? `
                        inset 0 3px 6px rgba(255,255,255,0.2), 
                        inset 0 -2px 4px rgba(0,0,0,0.8),
                        0 0 10px rgba(0, 249, 42, 0.6),
                        0 0 20px rgba(4, 202, 244, 0.4),
                        0 0 30px rgba(59, 0, 253, 0.3)
                      `
                      : `
                        inset 0 3px 6px rgba(255,255,255,0.2), 
                        inset 0 -2px 4px rgba(0,0,0,0.8),
                        0 0 10px rgba(59, 0, 253, 0.6),
                        0 0 20px rgba(4, 202, 244, 0.4),
                        0 0 30px rgba(0, 249, 42, 0.3)
                      `,
                    fontFamily: 'Courier New, monospace',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  disabled={!props.playerReady()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                    e.currentTarget.style.boxShadow = isPlaying() 
                      ? `
                        inset 0 4px 8px rgba(255,255,255,0.3), 
                        inset 0 -3px 6px rgba(0,0,0,0.6),
                        0 0 15px rgba(0, 249, 42, 0.8),
                        0 0 25px rgba(4, 202, 244, 0.6),
                        0 0 35px rgba(59, 0, 253, 0.5),
                        0 0 45px rgba(249, 6, 214, 0.3)
                      `
                      : `
                        inset 0 4px 8px rgba(255,255,255,0.3), 
                        inset 0 -3px 6px rgba(0,0,0,0.6),
                        0 0 15px rgba(59, 0, 253, 0.8),
                        0 0 25px rgba(4, 202, 244, 0.6),
                        0 0 35px rgba(0, 249, 42, 0.5),
                        0 0 45px rgba(249, 6, 214, 0.3)
                      `;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = isPlaying() 
                      ? `
                        inset 0 3px 6px rgba(255,255,255,0.2), 
                        inset 0 -2px 4px rgba(0,0,0,0.8),
                        0 0 10px rgba(0, 249, 42, 0.6),
                        0 0 20px rgba(4, 202, 244, 0.4),
                        0 0 30px rgba(59, 0, 253, 0.3)
                      `
                      : `
                        inset 0 3px 6px rgba(255,255,255,0.2), 
                        inset 0 -2px 4px rgba(0,0,0,0.8),
                        0 0 10px rgba(59, 0, 253, 0.6),
                        0 0 20px rgba(4, 202, 244, 0.4),
                        0 0 30px rgba(0, 249, 42, 0.3)
                      `;
                  }}
                >
                  <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'}`} style={{
                    marginLeft: isPlaying() ? '0' : '4px'
                  }}></i>
                </button>
                
                {/* Next Button - Neon Supporting Design */}
                <button 
                  ref={nextButtonRef!}
                  onClick={handleSkipNext}
                  class="win95-button"
                  style={{
                    width: '56px',
                    height: '56px',
                    border: '2px solid rgba(4, 202, 244, 0.5)',
                    borderTop: '2px solid rgba(4, 202, 244, 0.7)',
                    borderLeft: '2px solid rgba(4, 202, 244, 0.6)',
                    background: 'linear-gradient(145deg, rgba(4, 202, 244, 0.08) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%)',
                    color: '#04caf4',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    textShadow: '0 0 6px rgba(4, 202, 244, 0.8)',
                    boxShadow: `
                      inset 0 2px 4px rgba(255,255,255,0.1), 
                      inset 0 -1px 3px rgba(0,0,0,0.8), 
                      0 0 8px rgba(4, 202, 244, 0.4)
                    `,
                    fontFamily: 'Courier New, monospace',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  disabled={!props.playerReady()}
                  title="Next track"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(4, 202, 244, 0.2) 0%, rgba(4, 202, 244, 0.1) 50%, rgba(0, 0, 0, 0.8) 100%)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.textShadow = '0 0 8px rgba(255,255,255,0.9)';
                    e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.9)';
                    e.currentTarget.style.boxShadow = `
                      inset 0 2px 4px rgba(255,255,255,0.2), 
                      inset 0 -1px 3px rgba(0,0,0,0.5), 
                      0 0 15px rgba(4, 202, 244, 0.7)
                    `;
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(4, 202, 244, 0.08) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%)';
                    e.currentTarget.style.color = '#04caf4';
                    e.currentTarget.style.textShadow = '0 0 6px rgba(4, 202, 244, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(4, 202, 244, 0.5)';
                    e.currentTarget.style.boxShadow = `
                      inset 0 2px 4px rgba(255,255,255,0.1), 
                      inset 0 -1px 3px rgba(0,0,0,0.8), 
                      0 0 8px rgba(4, 202, 244, 0.4)
                    `;
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <i class="fas fa-step-forward"></i>
                </button>
                
                {/* Chat Button - Purple Neon to balance Tracklist */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Open chat');
                  }}
                  class="win95-button"
                  style={{
                    width: '56px',
                    height: '56px',
                    border: '2px solid rgba(249, 6, 214, 0.5)',
                    borderTop: '2px solid rgba(249, 6, 214, 0.7)',
                    borderLeft: '2px solid rgba(249, 6, 214, 0.6)',
                    background: 'linear-gradient(145deg, rgba(249, 6, 214, 0.08) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%)',
                    color: '#f906d6',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textShadow: '0 0 6px rgba(249, 6, 214, 0.8)',
                    boxShadow: `
                      inset 0 2px 4px rgba(255,255,255,0.1), 
                      inset 0 -1px 3px rgba(0,0,0,0.8), 
                      0 0 8px rgba(249, 6, 214, 0.4)
                    `,
                    fontFamily: 'Courier New, monospace',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  title="Open chat"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(249, 6, 214, 0.2) 0%, rgba(249, 6, 214, 0.1) 50%, rgba(0, 0, 0, 0.8) 100%)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.textShadow = '0 0 8px rgba(255,255,255,0.9)';
                    e.currentTarget.style.borderColor = 'rgba(249, 6, 214, 0.9)';
                    e.currentTarget.style.boxShadow = `
                      inset 0 2px 4px rgba(255,255,255,0.2), 
                      inset 0 -1px 3px rgba(0,0,0,0.5), 
                      0 0 15px rgba(249, 6, 214, 0.7)
                    `;
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(145deg, rgba(249, 6, 214, 0.08) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.9) 100%)';
                    e.currentTarget.style.color = '#f906d6';
                    e.currentTarget.style.textShadow = '0 0 6px rgba(249, 6, 214, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(249, 6, 214, 0.5)';
                    e.currentTarget.style.boxShadow = `
                      inset 0 2px 4px rgba(255,255,255,0.1), 
                      inset 0 -1px 3px rgba(0,0,0,0.8), 
                      0 0 8px rgba(249, 6, 214, 0.4)
                    `;
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  <i class="fas fa-comment"></i>
                </button>
            </div>
          </div>

          {/* RIGHT SECTION (30%): Video Embed */}
          <div class="hidden md:flex items-center justify-center relative overflow-hidden md:w-[30%]" style={{
            background: 'rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px'
          }}>
            {/* Media Player Container */}
            <div class="w-full flex-shrink-0">
              {props.mediaComponent}
            </div>
          </div>
        </div>

        {/* Progress Bar - For non-YouTube sources */}
        <Show when={currentTrack()?.source !== 'youtube' && (props.currentTime || props.duration)}>
          <div class="mt-3 max-w-7xl mx-auto px-8">
            <div class="flex items-center gap-4" style={{
              background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
              border: '2px solid #333',
              'border-radius': '8px',
              padding: '12px',
              'box-shadow': 'inset 0 2px 4px rgba(0,0,0,0.8)'
            }}>
              <span style={{
                color: '#04caf4',
                'font-family': 'monospace',
                'text-shadow': '0 0 4px #04caf4',
                'font-size': '14px'
              }}>{formatTime(props.currentTime?.() || 0)}</span>
              <div class="flex-1 h-3 rounded-full overflow-hidden cursor-pointer" style={{
                background: 'linear-gradient(180deg, #000 0%, #222 100%)',
                border: '1px solid #444',
                'box-shadow': 'inset 0 1px 3px rgba(0,0,0,0.8)'
              }}>
                <div 
                  class="h-full transition-all duration-200"
                  style={{
                    width: `${((props.currentTime?.() || 0) / (props.duration?.() || 1)) * 100}%`,
                    background: 'linear-gradient(90deg, #3b00fd 0%, #04caf4 50%, #00f92a 100%)',
                    'box-shadow': '0 0 6px rgba(4, 202, 244, 0.8)'
                  }}
                ></div>
              </div>
              <span style={{
                color: '#04caf4',
                'font-family': 'monospace',
                'text-shadow': '0 0 4px #04caf4',
                'font-size': '14px'
              }}>{formatTime(props.duration?.() || 0)}</span>
            </div>
          </div>
        </Show>
      </div>
      
      {/* Discussion Modal */}
      <Show when={showDiscussionModal()}>
        <DiscussionModal />
      </Show>
    </Show>
  );
};

export default Player;
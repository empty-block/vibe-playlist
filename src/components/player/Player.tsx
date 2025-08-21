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
      {/* Bottom Player Bar */}
      <div class="h-full bg-gray-900 flex items-center px-8 gap-8 border-t border-gray-700">
        
        <div class="flex items-center gap-8 w-full max-w-7xl mx-auto relative z-10">
          {/* LEFT SECTION (30%): Track Details */}
          <div class="flex items-center gap-3 flex-shrink-0 relative" style={{
            width: '30%',
            background: '#1a1a1a',
            border: '1px solid #333',
            'border-radius': '8px',
            padding: '12px'
          }}>
            {/* Track Info - Clean Display Style */}
            <div class="flex-1 min-w-0 relative" style={{
              background: '#000',
              border: '1px solid #333',
              'border-radius': '4px',
              padding: '8px'
            }}>
              <h3 class="font-bold text-lg sm:text-xl leading-tight truncate" style={{
                color: '#04caf4',
                'text-shadow': '0 0 4px rgba(4, 202, 244, 0.8)',
                'font-family': 'monospace'
              }}>
                {currentTrack()?.title}
              </h3>
              <p class="text-base sm:text-lg truncate mt-1" style={{
                color: '#00f92a',
                'text-shadow': '0 0 4px rgba(0, 249, 42, 0.8)',
                'font-family': 'monospace'
              }}>
                {currentTrack()?.artist}
              </p>
              <p class="text-sm sm:text-base truncate mt-1" style={{
                color: '#d1f60a',
                'text-shadow': '0 0 4px #d1f60a',
                'font-family': 'monospace',
                opacity: '0.8'
              }}>
                Added by {currentTrack()?.userAvatar} {currentTrack()?.addedBy}
              </p>
            </div>
            
            {/* Go to Playing Playlist Button */}
            <button
              onClick={handleGoToPlayingPlaylist}
              class="flex-shrink-0 retro-social-button relative overflow-hidden font-bold transition-all duration-200"
              style={{
                width: '40px',
                height: '40px',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '6px',
                border: '2px solid #333',
                'border-top': '2px solid #555',
                'border-left': '2px solid #444',
                background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)',
                color: '#d1f60a',
                'text-shadow': '0 0 4px rgba(211, 246, 10, 0.6)',
                'box-shadow': 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(211, 246, 10, 0.3)',
                'font-family': 'monospace',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center'
              }}
              title="View current playlist"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(145deg, #d1f60a 0%, #cddc39 50%, #9e9d24 100%)';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.textShadow = '0 0 6px rgba(0,0,0,0.8)';
                e.currentTarget.style.borderTopColor = '#d1f60a';
                e.currentTarget.style.borderLeftColor = '#cddc39';
                e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -1px 3px rgba(0,0,0,0.5), 0 0 12px rgba(211, 246, 10, 0.6)';
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)';
                e.currentTarget.style.color = '#d1f60a';
                e.currentTarget.style.textShadow = '0 0 4px rgba(211, 246, 10, 0.6)';
                e.currentTarget.style.borderTopColor = '#555';
                e.currentTarget.style.borderLeftColor = '#444';
                e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(211, 246, 10, 0.3)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              <i class="fas fa-list" style={{ fontSize: '14px' }}></i>
            </button>
          </div>

          {/* CENTER SECTION (40%): Media Player Only - Clean Minimal Design */}
          <div class="flex items-center justify-center relative" style={{
            width: '40%',
            background: '#1a1a1a',
            border: '1px solid #333',
            'border-radius': '8px',
            padding: '8px',
            position: 'relative'
          }}>
            {/* Media Player - Clean Hero Element */}
            <div class="flex-shrink-0">
              {props.mediaComponent}
            </div>
          </div>

          {/* RIGHT SECTION (30%): Two-Row Layout */}
          <div class="flex flex-col justify-center gap-3 flex-shrink-0 relative" style={{
            width: '30%',
            background: '#1a1a1a',
            border: '1px solid #333',
            'border-radius': '8px',
            padding: '12px',
            position: 'relative'
          }}>
            
            {/* TOP ROW: Transport Controls */}
            <div class="flex items-center justify-center gap-3 relative" style={{
              background: '#0f0f0f',
              border: '1px solid #444',
              'border-radius': '8px',
              padding: '8px',
              'box-shadow': '0 1px 3px rgba(0,0,0,0.5)'
            }}>
              {/* Previous Button */}
              <button 
                ref={prevButtonRef!}
                onClick={handleSkipPrevious}
                class="transport-button"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '6px',
                  border: '1px solid #555',
                  background: '#2a2a2a',
                  color: '#d1f60a',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  'font-size': '16px',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                disabled={!props.playerReady()}
                title="Previous track"
              >
                <i class="fas fa-step-backward"></i>
              </button>
              
              {/* Play/Pause Button */}
              <button 
                ref={playButtonRef!}
                onClick={props.onTogglePlay}
                class="transport-button play-button"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  border: '1px solid #555',
                  background: isPlaying() ? '#00f92a' : '#3b00fd',
                  color: '#ffffff',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  'font-size': '18px',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                disabled={!props.playerReady()}
              >
                <i class={`fas ${isPlaying() ? 'fa-pause' : 'fa-play'}`} style={{
                  marginLeft: isPlaying() ? '0' : '2px'
                }}></i>
              </button>
              
              {/* Next Button */}
              <button 
                ref={nextButtonRef!}
                onClick={handleSkipNext}
                class="transport-button"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '6px',
                  border: '1px solid #555',
                  background: '#2a2a2a',
                  color: '#d1f60a',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  'font-size': '16px',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                disabled={!props.playerReady()}
                title="Next track"
              >
                <i class="fas fa-step-forward"></i>
              </button>
            </div>

            {/* BOTTOM ROW: Join and Like Buttons */}
            <div class="flex items-center justify-center gap-2">
              {/* Join Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDiscussionModal(true);
                }}
                class="retro-social-button relative overflow-hidden font-bold transition-all duration-200"
                style={{
                  width: '48px',
                  height: '32px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  border: '2px solid #333',
                  'border-top': '2px solid #555',
                  'border-left': '2px solid #444',
                  background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)',
                  color: '#04caf4',
                  'text-shadow': '0 0 4px rgba(4, 202, 244, 0.6)',
                  'box-shadow': 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(4, 202, 244, 0.3)',
                  'font-family': 'monospace',
                  'white-space': 'nowrap',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center'
                }}
                title="Join discussion"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #04caf4 0%, #0288d1 50%, #01579b 100%)';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.textShadow = '0 0 6px rgba(255,255,255,0.8)';
                  e.currentTarget.style.borderTopColor = '#04caf4';
                  e.currentTarget.style.borderLeftColor = '#0288d1';
                  e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -1px 3px rgba(0,0,0,0.5), 0 0 12px rgba(4, 202, 244, 0.6)';
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)';
                  e.currentTarget.style.color = '#04caf4';
                  e.currentTarget.style.textShadow = '0 0 4px rgba(4, 202, 244, 0.6)';
                  e.currentTarget.style.borderTopColor = '#555';
                  e.currentTarget.style.borderLeftColor = '#444';
                  e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(4, 202, 244, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <i class="fas fa-comments" style={{ fontSize: '12px' }}></i>
                <Show when={currentTrack()?.replies && currentTrack()!.replies > 0}>
                  <div class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none" style={{
                    'font-size': '8px',
                    'box-shadow': '0 0 4px rgba(255,0,0,0.6)'
                  }}>
                    {currentTrack()?.replies}
                  </div>
                </Show>
              </button>
              
              {/* Like Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Like track');
                  // TODO: Implement like functionality
                }}
                class="retro-social-button relative overflow-hidden font-bold transition-all duration-200"
                style={{
                  width: '48px',
                  height: '32px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  border: '2px solid #333',
                  'border-top': '2px solid #555',
                  'border-left': '2px solid #444',
                  background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)',
                  color: '#f906d6',
                  'text-shadow': '0 0 4px rgba(249, 6, 214, 0.6)',
                  'box-shadow': 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(249, 6, 214, 0.3)',
                  'font-family': 'monospace',
                  display: 'flex',
                  'align-items': 'center',
                  'justify-content': 'center'
                }}
                title="Like this track"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #f906d6 0%, #e91e63 50%, #ad1457 100%)';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.textShadow = '0 0 6px rgba(255,255,255,0.8)';
                  e.currentTarget.style.borderTopColor = '#f906d6';
                  e.currentTarget.style.borderLeftColor = '#e91e63';
                  e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -1px 3px rgba(0,0,0,0.5), 0 0 12px rgba(249, 6, 214, 0.6)';
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%)';
                  e.currentTarget.style.color = '#f906d6';
                  e.currentTarget.style.textShadow = '0 0 4px rgba(249, 6, 214, 0.6)';
                  e.currentTarget.style.borderTopColor = '#555';
                  e.currentTarget.style.borderLeftColor = '#444';
                  e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(249, 6, 214, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <i class="fas fa-heart" style={{ fontSize: '12px' }}></i>
                <Show when={currentTrack()?.likes && currentTrack()!.likes > 0}>
                  <span class="ml-1" style={{ fontSize: '8px' }}>{currentTrack()?.likes}</span>
                </Show>
              </button>
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
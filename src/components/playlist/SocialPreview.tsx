import { Component, createSignal, createEffect, onMount, For, Show } from 'solid-js';
import anime from 'animejs';

interface Track {
  id: string;
  title: string;
  artist: string;
  source: 'youtube' | 'spotify';
  sourceId: string;
}

interface SocialPreviewProps {
  playlistTitle?: string;
  threadText?: string;
  tracks: Track[];
  vibeType?: string;
  onEngagementPredict?: () => void;
}

interface MockReply {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isTrackSuggestion?: boolean;
  suggestedTrack?: Track;
}

const SocialPreview: Component<SocialPreviewProps> = (props) => {
  const [engagementScore, setEngagementScore] = createSignal(0);
  const [predictedReplies, setPredictedReplies] = createSignal(0);
  const [reachEstimate, setReachEstimate] = createSignal(0);
  const [mockReplies, setMockReplies] = createSignal<MockReply[]>([]);

  let containerRef: HTMLDivElement;
  let threadRef: HTMLDivElement;
  let statsRef: HTMLDivElement;

  onMount(() => {
    // Initial animation
    if (containerRef) {
      anime({
        targets: containerRef,
        opacity: [0, 1],
        translateX: [30, 0],
        duration: 600,
        easing: 'easeOutCubic'
      });
    }

    // Generate mock community engagement
    generateMockReplies();
  });

  createEffect(() => {
    // Update engagement predictions based on tracks and content
    const trackCount = props.tracks.length;
    const hasThreadText = !!props.threadText?.trim();
    const hasVibe = !!props.vibeType;
    
    let score = 20; // Base score
    
    if (trackCount >= 3) score += 30; // Good track count
    if (trackCount >= 5) score += 20; // Great track count
    if (hasThreadText) score += 25; // Has conversation starter
    if (hasVibe) score += 15; // Has clear vibe
    if (props.threadText?.includes('?')) score += 10; // Asks a question
    
    setEngagementScore(Math.min(score, 95)); // Cap at 95%
    setPredictedReplies(Math.floor(trackCount * 2.5 + (hasThreadText ? 5 : 0)));
    setReachEstimate(Math.floor(score * 8 + Math.random() * 100));

    // Animate stats update
    if (statsRef) {
      anime({
        targets: statsRef.querySelectorAll('.stat-value'),
        scale: [1, 1.1, 1],
        color: ['#04caf4', '#00f92a', '#04caf4'],
        duration: 500,
        easing: 'easeOutCubic'
      });
    }
  });

  const generateMockReplies = () => {
    const mockUsers = [
      { name: 'Alex Chen', handle: 'alexbeats', avatar: '🎧' },
      { name: 'Sarah M', handle: 'sarahmusic', avatar: '🎵' },
      { name: 'DJ Mike', handle: 'djmikez', avatar: '🎛️' },
      { name: 'Luna', handle: 'moonvibes', avatar: '🌙' },
      { name: 'Rico', handle: 'ricobeats', avatar: '🔥' }
    ];

    const replyTemplates = [
      "This vibe hits different! 🔥",
      "Added to my rotation immediately",
      "That second track though... *chef's kiss*",
      "Perfect timing, needed exactly this energy",
      "The transitions between these tracks are *seamless*"
    ];

    const trackSuggestions = [
      { title: "Resonance", artist: "HOME", source: "youtube" as const, sourceId: "8GW6sLrK40k", id: "suggestion-1" },
      { title: "A Real Hero", artist: "College & Electric Youth", source: "youtube" as const, sourceId: "-DSVDcw6iW8", id: "suggestion-2" },
      { title: "Nightcall", artist: "Kavinsky", source: "youtube" as const, sourceId: "MV_3Dpw-BRY", id: "suggestion-3" }
    ];

    const replies: MockReply[] = mockUsers.slice(0, 3).map((user, index) => ({
      id: `reply-${index}`,
      author: user.name,
      handle: user.handle,
      avatar: user.avatar,
      content: replyTemplates[index] || "Love this selection!",
      timestamp: `${Math.floor(Math.random() * 5) + 1}m`,
      likes: Math.floor(Math.random() * 8) + 1,
      isTrackSuggestion: index === 1,
      suggestedTrack: index === 1 ? trackSuggestions[0] : undefined
    }));

    setMockReplies(replies);
  };

  const formatTimeAgo = (timestamp: string) => {
    return timestamp;
  };

  return (
    <div 
      ref={containerRef!}
      class="h-full flex flex-col bg-black text-white overflow-y-auto"
      style={{ opacity: 0 }}
    >
      {/* Header */}
      <div class="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-cyan-500/30 p-4 z-10">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-sm">
            📱
          </div>
          <div>
            <h3 class="font-semibold" style={{ color: '#04caf4' }}>
              Farcaster Thread Preview
            </h3>
            <p class="text-xs text-gray-400">
              How your playlist will appear on social
            </p>
          </div>
        </div>

        {/* Engagement Prediction */}
        <div 
          ref={statsRef!}
          class="grid grid-cols-3 gap-3 text-center"
        >
          <div class="bg-gray-900/50 rounded-lg p-2">
            <div class="stat-value text-lg font-bold" style={{ color: '#00f92a' }}>
              {engagementScore()}%
            </div>
            <div class="text-xs text-gray-400">Engagement</div>
          </div>
          <div class="bg-gray-900/50 rounded-lg p-2">
            <div class="stat-value text-lg font-bold" style={{ color: '#04caf4' }}>
              {predictedReplies()}
            </div>
            <div class="text-xs text-gray-400">Est. Replies</div>
          </div>
          <div class="bg-gray-900/50 rounded-lg p-2">
            <div class="stat-value text-lg font-bold" style={{ color: '#f906d6' }}>
              {reachEstimate()}
            </div>
            <div class="text-xs text-gray-400">Est. Reach</div>
          </div>
        </div>
      </div>

      {/* Thread Content */}
      <div ref={threadRef!} class="flex-1 p-4 space-y-4">
        {/* Main Thread Post */}
        <div class="bg-gray-900/50 rounded-lg p-4 border border-gray-700 relative">
          {/* User Header */}
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
              YU
            </div>
            <div class="flex-1">
              <div class="font-medium">You</div>
              <div class="text-xs text-gray-400">@yourhandle • now</div>
            </div>
            <div class="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded-full">
              Thread
            </div>
          </div>

          {/* Thread Text */}
          <div class="mb-4">
            {props.threadText ? (
              <p class="text-gray-100 leading-relaxed">
                {props.threadText}
              </p>
            ) : (
              <p class="text-gray-400 italic border-l-2 border-purple-500/50 pl-3">
                Your conversation starter text will appear here...
                <br />
                <span class="text-xs text-gray-500">
                  Tip: Ask a question to encourage replies!
                </span>
              </p>
            )}
          </div>

          {/* Playlist Preview */}
          <Show when={props.tracks.length > 0}>
            <div class="bg-gray-800/50 rounded-lg p-3 border border-gray-600 mb-3">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-sm">🎵</span>
                <span class="text-sm font-medium text-cyan-300">
                  {props.playlistTitle || `${props.vibeType || 'New'} Playlist`}
                </span>
                <span class="text-xs text-gray-500">
                  {props.tracks.length} tracks
                </span>
              </div>
              
              {/* First few tracks preview */}
              <div class="space-y-1">
                <For each={props.tracks.slice(0, 3)}>
                  {(track, index) => (
                    <div class="text-xs text-gray-300 flex items-center space-x-2">
                      <span class="text-gray-500">{index() + 1}.</span>
                      <span class="truncate">{track.title} - {track.artist}</span>
                      <div class="w-3 h-3 rounded-full" style={{
                        background: track.source === 'youtube' ? '#ff0000' : '#1db954'
                      }}></div>
                    </div>
                  )}
                </For>
                
                <Show when={props.tracks.length > 3}>
                  <div class="text-xs text-gray-500 italic">
                    +{props.tracks.length - 3} more tracks...
                  </div>
                </Show>
              </div>
            </div>
          </Show>

          {/* Social Stats */}
          <div class="flex items-center space-x-6 text-xs text-gray-500">
            <button class="hover:text-red-400 transition-colors flex items-center space-x-1">
              <span>❤️</span>
              <span>0</span>
            </button>
            <button class="hover:text-green-400 transition-colors flex items-center space-x-1">
              <span>🔄</span>
              <span>0</span>
            </button>
            <button class="hover:text-blue-400 transition-colors flex items-center space-x-1">
              <span>💬</span>
              <span>{mockReplies().length}</span>
            </button>
            <button class="hover:text-purple-400 transition-colors">
              <span>🔗</span>
            </button>
          </div>
        </div>

        {/* Track Contributions (as replies) */}
        <Show when={props.tracks.length > 0}>
          <div class="ml-8 space-y-3">
            <div class="text-sm text-gray-400 font-medium">Track contributions:</div>
            
            <For each={props.tracks.slice(0, Math.min(props.tracks.length, 3))}>
              {(track) => (
                <div class="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                  <div class="flex items-center space-x-2 mb-2">
                    <div class="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center text-xs font-bold">
                      YU
                    </div>
                    <span class="text-sm text-gray-400">You • 1s</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs">
                      🎵
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-medium text-white">{track.title}</div>
                      <div class="text-xs text-gray-400">{track.artist}</div>
                    </div>
                    <div class="w-3 h-3 rounded-full" style={{
                      background: track.source === 'youtube' ? '#ff0000' : '#1db954'
                    }}></div>
                  </div>
                </div>
              )}
            </For>

            {/* Show remaining tracks as collapsed */}
            <Show when={props.tracks.length > 3}>
              <div class="bg-gray-800/30 rounded-lg p-3 border border-dashed border-gray-600">
                <div class="text-sm text-gray-500 text-center">
                  + {props.tracks.length - 3} more track contributions
                </div>
              </div>
            </Show>
          </div>
        </Show>

        {/* Mock Community Replies */}
        <Show when={mockReplies().length > 0}>
          <div class="ml-8 space-y-3">
            <div class="text-sm text-gray-400 font-medium">Community responses:</div>
            
            <For each={mockReplies()}>
              {(reply) => (
                <div class="bg-gray-800/30 rounded-lg p-3 border border-gray-600/50">
                  <div class="flex items-center space-x-2 mb-2">
                    <div class="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-xs">
                      {reply.avatar}
                    </div>
                    <span class="text-sm text-gray-300">{reply.author}</span>
                    <span class="text-xs text-gray-500">@{reply.handle} • {reply.timestamp}</span>
                  </div>
                  
                  <p class="text-sm text-gray-200 mb-2">{reply.content}</p>
                  
                  <Show when={reply.isTrackSuggestion && reply.suggestedTrack}>
                    <div class="bg-gray-700/50 rounded p-2 mt-2 border border-gray-600/30">
                      <div class="flex items-center space-x-2">
                        <span class="text-xs">🎵</span>
                        <span class="text-xs text-gray-300">
                          {reply.suggestedTrack!.title} - {reply.suggestedTrack!.artist}
                        </span>
                      </div>
                    </div>
                  </Show>
                  
                  <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span class="flex items-center space-x-1">
                      <span>❤️</span>
                      <span>{reply.likes}</span>
                    </span>
                    <span>💬</span>
                    <span>🔄</span>
                  </div>
                </div>
              )}
            </For>

            {/* Invitation for more replies */}
            <div class="bg-gray-800/20 rounded-lg p-3 border border-dashed border-gray-600/50">
              <div class="text-sm text-gray-500 text-center flex items-center justify-center space-x-2">
                <span>✨</span>
                <span>More community additions will appear here</span>
                <span>✨</span>
              </div>
            </div>
          </div>
        </Show>

        {/* Engagement Tips */}
        <div class="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
          <h4 class="text-sm font-semibold mb-3 text-purple-300 flex items-center space-x-2">
            <span>💡</span>
            <span>Tips to maximize engagement</span>
          </h4>
          <div class="text-xs text-gray-400 space-y-2">
            <div class="flex items-start space-x-2">
              <span class={props.threadText?.includes('?') ? "text-green-400" : "text-gray-500"}>
                {props.threadText?.includes('?') ? "✅" : "📝"}
              </span>
              <span>Ask a question to encourage replies</span>
            </div>
            <div class="flex items-start space-x-2">
              <span class={props.tracks.length >= 3 ? "text-green-400" : "text-gray-500"}>
                {props.tracks.length >= 3 ? "✅" : "🎵"}
              </span>
              <span>Include 3-5 tracks for good engagement</span>
            </div>
            <div class="flex items-start space-x-2">
              <span class="text-gray-500">🕐</span>
              <span>Best time to post: Evenings & weekends</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPreview;
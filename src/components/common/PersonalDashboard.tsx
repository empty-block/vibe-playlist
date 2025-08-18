import { Component, onMount, For, createSignal, Show } from 'solid-js';
import { currentUser, setIsAuthenticated } from '../../stores/authStore';
import { currentTrack, setCurrentTrack, type Track } from '../../stores/playlistStore';
import { pageEnter, staggeredFadeIn, buttonHover, counterAnimation, slideIn } from '../../utils/animations';

const PersonalDashboard: Component = () => {
  const [statsVisible, setStatsVisible] = createSignal(false);
  let pageRef: HTMLDivElement;
  let statsRef: HTMLDivElement;

  // Mock data - in real app this would come from your backend
  const recentActivity = [
    { type: 'added', track: 'Smells Like Teen Spirit', artist: 'Nirvana', time: '2 min ago', user: currentUser().username },
    { type: 'liked', track: 'Blue Monday', artist: 'New Order', time: '5 min ago', user: 'synth_lover_85' },
    { type: 'shared', track: 'Midnight City', artist: 'M83', time: '12 min ago', user: 'indie_explorer' },
    { type: 'followed', track: '', artist: '', time: '18 min ago', user: 'grunge_kid_92' }
  ];

  const yourStats = {
    tracksAdded: 23,
    totalLikes: 156,
    followers: 42,
    streak: 7
  };

  const recommendations = [
    { title: 'Creep', artist: 'Radiohead', reason: 'Based on your love for grunge' },
    { title: 'Just', artist: 'Radiohead', reason: 'Others like you enjoyed this' },
    { title: 'High and Dry', artist: 'Radiohead', reason: 'From your favorite era' }
  ];

  const trendingInYourNetwork = [
    { title: 'Black Hole Sun', artist: 'Soundgarden', plays: 45 },
    { title: 'Touch Me I\'m Going to Scream', artist: 'My Morning Jacket', plays: 32 },
    { title: 'Paranoid Android', artist: 'Radiohead', plays: 28 }
  ];

  onMount(() => {
    if (pageRef) {
      pageEnter(pageRef);
    }

    setTimeout(() => {
      // Animate sections
      const sections = pageRef?.querySelectorAll('.dashboard-section');
      if (sections) {
        staggeredFadeIn(sections);
      }

      // Animate stats when they become visible
      setTimeout(() => {
        setStatsVisible(true);
        if (statsRef) {
          const statNumbers = statsRef.querySelectorAll('.stat-number');
          statNumbers.forEach((stat, index) => {
            const target = parseInt(stat.getAttribute('data-target') || '0');
            setTimeout(() => {
              counterAnimation(stat as HTMLElement, 0, target);
            }, index * 150);
          });
        }
      }, 800);
    }, 300);
  });

  const handlePlayRecommendation = (track: string, artist: string) => {
    const newTrack: Track = {
      id: `rec_${Date.now()}`,
      title: track,
      artist: artist,
      duration: '4:03',
      source: 'youtube',
      sourceId: 'sample_id',
      videoId: 'sample_id',
      thumbnail: 'https://via.placeholder.com/120x90?text=CD',
      addedBy: 'recommendations',
      userAvatar: '🤖',
      timestamp: 'now',
      comment: 'Recommended for you',
      likes: 0,
      replies: 0,
      recasts: 0
    };
    setCurrentTrack(newTrack);
  };

  const handleButtonHover = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    buttonHover.enter(button);
  };

  const handleButtonLeave = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    buttonHover.leave(button);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.setItem('demo_authenticated', 'false');
  };

  return (
    <div ref={pageRef!} class="p-8 pb-20" style={{ opacity: '0' }}>
      {/* Welcome Header */}
      <div class="dashboard-section mb-8" style={{ opacity: '0' }}>
        <div class="win95-panel p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="text-4xl">{currentUser().avatar}</div>
            <div>
              <h1 class="text-3xl font-bold text-black">Welcome back, {currentUser().username}! 🎵</h1>
              <p class="text-gray-700">Here's what's happening in your music world</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div ref={statsRef!} class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="win95-panel p-3 text-center">
              <div class="stat-number text-2xl font-bold text-black" data-target={yourStats.tracksAdded}>0</div>
              <div class="text-xs text-gray-600">Tracks Added</div>
            </div>
            <div class="win95-panel p-3 text-center">
              <div class="stat-number text-2xl font-bold text-red-600" data-target={yourStats.totalLikes}>0</div>
              <div class="text-xs text-gray-600">Total Likes</div>
            </div>
            <div class="win95-panel p-3 text-center">
              <div class="stat-number text-2xl font-bold text-blue-600" data-target={yourStats.followers}>0</div>
              <div class="text-xs text-gray-600">Followers</div>
            </div>
            <div class="win95-panel p-3 text-center">
              <div class="stat-number text-2xl font-bold text-green-600" data-target={yourStats.streak}>0</div>
              <div class="text-xs text-gray-600">Day Streak 🔥</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div class="dashboard-section space-y-6" style={{ opacity: '0' }}>
          <div class="win95-panel p-6">
            <h3 class="text-xl font-bold text-black mb-4 flex items-center">
              <i class="fas fa-clock text-blue-600 mr-2"></i>Recent Activity
            </h3>
            <div class="space-y-3">
              <For each={recentActivity}>
                {(activity) => (
                  <div class="win95-panel p-3 hover:bg-gray-50">
                    <div class="flex items-center gap-3">
                      <div class="text-lg">
                        {activity.type === 'added' && '🎵'}
                        {activity.type === 'liked' && '❤️'}
                        {activity.type === 'shared' && '🔗'}
                        {activity.type === 'followed' && '👥'}
                      </div>
                      <div class="flex-1 text-sm">
                        <Show when={activity.type !== 'followed'}>
                          <span class="font-bold text-black">{activity.user}</span>
                          <span class="text-gray-600"> {activity.type} </span>
                          <span class="text-black">"{activity.track}" by {activity.artist}</span>
                        </Show>
                        <Show when={activity.type === 'followed'}>
                          <span class="font-bold text-black">{activity.user}</span>
                          <span class="text-gray-600"> started following you</span>
                        </Show>
                        <div class="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Trending in Your Network */}
          <div class="win95-panel p-6">
            <h3 class="text-xl font-bold text-black mb-4 flex items-center">
              <i class="fas fa-fire text-red-500 mr-2"></i>Trending in Your Network
            </h3>
            <div class="space-y-2">
              <For each={trendingInYourNetwork}>
                {(track, index) => (
                  <div class="win95-panel p-3 hover:bg-gray-50 cursor-pointer">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <span class="text-sm font-bold text-gray-600">#{index() + 1}</span>
                        <div>
                          <div class="font-bold text-black text-sm">{track.title}</div>
                          <div class="text-xs text-gray-600">{track.artist}</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-green-600">📈 {track.plays}</span>
                        <button 
                          class="win95-button px-2 py-1 text-xs"
                          onMouseEnter={handleButtonHover}
                          onMouseLeave={handleButtonLeave}
                        >
                          <i class="fas fa-play"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div class="dashboard-section space-y-6" style={{ opacity: '0' }}>
          {/* Recommendations */}
          <div class="win95-panel p-6">
            <h3 class="text-xl font-bold text-black mb-4 flex items-center">
              <i class="fas fa-magic text-purple-600 mr-2"></i>Recommended for You
            </h3>
            <div class="space-y-3">
              <For each={recommendations}>
                {(rec) => (
                  <div class="win95-panel p-3 hover:bg-gray-50">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <div class="font-bold text-black text-sm">{rec.title}</div>
                        <div class="text-xs text-gray-600">{rec.artist}</div>
                        <div class="text-xs text-blue-600 mt-1">💡 {rec.reason}</div>
                      </div>
                      <button 
                        class="win95-button px-3 py-1 text-xs"
                        onClick={() => handlePlayRecommendation(rec.title, rec.artist)}
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={handleButtonLeave}
                      >
                        <i class="fas fa-play mr-1"></i>Play
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Quick Actions */}
          <div class="win95-panel p-6">
            <h3 class="text-xl font-bold text-black mb-4 flex items-center">
              <i class="fas fa-bolt text-yellow-500 mr-2"></i>Quick Actions
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <button 
                class="win95-button p-3 text-center hover:bg-gray-50"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                <div class="text-2xl mb-1">🎵</div>
                <div class="text-xs font-bold">Add Track</div>
              </button>
              <button 
                class="win95-button p-3 text-center hover:bg-gray-50"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                <div class="text-2xl mb-1">📋</div>
                <div class="text-xs font-bold">New Playlist</div>
              </button>
              <button 
                class="win95-button p-3 text-center hover:bg-gray-50"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                <div class="text-2xl mb-1">🔍</div>
                <div class="text-xs font-bold">Discover</div>
              </button>
              <button 
                class="win95-button p-3 text-center hover:bg-gray-50"
                onClick={handleSignOut}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                title="Sign out to see landing page"
              >
                <div class="text-2xl mb-1">🚪</div>
                <div class="text-xs font-bold">Sign Out</div>
              </button>
            </div>
          </div>

          {/* Currently Playing Widget */}
          <Show when={currentTrack()}>
            <div class="win95-panel p-6">
              <h3 class="text-xl font-bold text-black mb-4 flex items-center">
                <i class="fas fa-music text-green-600 mr-2"></i>Now Playing
              </h3>
              <div class="win95-panel p-4 bg-black">
                <div class="lcd-text text-center">
                  <div class="text-sm font-bold mb-1">{currentTrack()?.title}</div>
                  <div class="text-xs">{currentTrack()?.artist}</div>
                  <div class="text-xs text-green-400 mt-2">♪ ♫ ♪ ♫ ♪</div>
                </div>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;
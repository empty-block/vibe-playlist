import { Component, onMount } from 'solid-js';
import { pageEnter, staggeredFadeIn } from '../utils/animations';

// Community components
import LiveActivityPulse from '../components/community/LiveActivityPulse';
import ActiveConversations from '../components/community/ActiveConversations';
import CommunitySidebar from '../components/community/CommunitySidebar';
import CuratorSpotlights from '../components/discover/CuratorSpotlights';
import NetworkAnalytics from '../components/network/NetworkAnalytics';

// Community store
import {
  activeConversations,
  liveActivities,
  networkActivity,
  communityPlaylists,
  curatorSuggestions,
  isConversationsLoading,
  isActivitiesLoading,
  isNetworkLoading,
  isPlaylistsLoading,
  isSuggestionsLoading,
  initializeCommunityData
} from '../stores/communityStore';

// Import from discover store for curators
import {
  featuredCurators,
  isCuratorsLoading
} from '../stores/discoverStore';

const NetworkPage: Component = () => {
  let pageRef: HTMLDivElement | undefined;

  onMount(async () => {
    // Initialize community data
    await initializeCommunityData();
    
    if (pageRef) {
      pageEnter(pageRef);
      
      // Staggered fade-in for sections
      setTimeout(() => {
        const sections = pageRef!.querySelectorAll('.community-section');
        if (sections) {
          staggeredFadeIn(sections);
        }
      }, 300);
    }
  });

  return (
    <div 
      ref={pageRef!} 
      class="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800"
      style={{ opacity: '0' }}
    >
      <div class="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* Community Header */}
        <div class="community-section mb-8" style={{ opacity: '0' }}>
          <div class="text-center mb-6">
            <div class="flex items-center justify-center gap-4 mb-4">
              <div class="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse shadow-lg shadow-purple-400/50"></div>
              <h1 class="font-bold text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 font-mono tracking-wider">
                NETWORK_HUB.EXE
              </h1>
              <div class="w-4 h-4 rounded-full bg-gradient-to-r from-pink-400 to-cyan-400 animate-pulse shadow-lg shadow-pink-400/50"></div>
            </div>
            <p class="text-purple-300/70 font-mono text-lg">
              Curator discovery & network intelligence system
            </p>
          </div>
        </div>

        {/* Network Analytics Dashboard */}
        <div class="community-section" style={{ opacity: '0' }}>
          <NetworkAnalytics 
            isLoading={isNetworkLoading()} 
          />
        </div>

        {/* Live Activity Pulse Bar */}
        <div class="community-section" style={{ opacity: '0' }}>
          <LiveActivityPulse 
            activities={liveActivities()} 
            isLoading={isActivitiesLoading()} 
          />
        </div>

        {/* Featured Curators Section (moved from Discovery) */}
        <div class="community-section mb-8" style={{ opacity: '0' }}>
          <CuratorSpotlights 
            curators={featuredCurators()} 
            isLoading={isCuratorsLoading()} 
          />
        </div>

        {/* Main Content Layout */}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed - Active Conversations */}
          <div class="lg:col-span-2">
            <div class="community-section" style={{ opacity: '0' }}>
              <div class="mb-6">
                <div class="flex items-center gap-3 mb-2">
                  <i class="fas fa-comments text-purple-400"></i>
                  <h2 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Active Conversations
                  </h2>
                </div>
                <p class="text-purple-300/70 font-mono">
                  Join the music discussion happening right now
                </p>
              </div>

              <ActiveConversations 
                conversations={activeConversations()} 
                isLoading={isConversationsLoading()} 
              />
            </div>
          </div>

          {/* Sidebar - Discovery */}
          <div class="lg:col-span-1">
            <div class="community-section" style={{ opacity: '0' }}>
              <div class="mb-6">
                <h2 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                  Discover & Connect
                </h2>
                <p class="text-cyan-300/70 font-mono text-sm">
                  Expand your musical network
                </p>
              </div>

              <CommunitySidebar 
                networkActivity={networkActivity()}
                communityPlaylists={communityPlaylists()}
                curatorSuggestions={curatorSuggestions()}
                isNetworkLoading={isNetworkLoading()}
                isPlaylistsLoading={isPlaylistsLoading()}
                isSuggestionsLoading={isSuggestionsLoading()}
              />
            </div>
          </div>
        </div>

        {/* Community Features Footer */}
        <div class="community-section mt-12" style={{ opacity: '0' }}>
          <div class="bg-gradient-to-r from-slate-800/60 to-slate-700/40 border-2 border-cyan-400/20 rounded-xl p-6 text-center">
            <h3 class="text-cyan-300 font-bold text-lg mb-2">
              Build Your Music Network
            </h3>
            <p class="text-cyan-200/70 mb-4">
              Every track is a conversation starter. Connect with curators who share your taste.
            </p>
            <div class="flex flex-wrap justify-center gap-4">
              <button class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <i class="fas fa-search mr-2"></i>
                Find Curators
              </button>
              <button class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <i class="fas fa-plus mr-2"></i>
                Start Discussion
              </button>
              <button class="px-4 py-2 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <i class="fas fa-list mr-2"></i>
                Create Playlist
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NetworkPage;
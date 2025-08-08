import { Component, onMount, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { pageEnter, staggeredFadeIn, buttonHover, float, typewriter, particleBurst, glitch } from '../utils/animations';
import { setIsAuthenticated } from '../stores/authStore';
import anime from 'animejs';

const LandingPageA: Component = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = createSignal(false);
  const [currentTrack, setCurrentTrack] = createSignal(0);
  let pageRef: HTMLDivElement;
  let heroTextRef: HTMLHeadingElement;
  let cdRef: HTMLDivElement;
  let statsRef: HTMLDivElement;

  const demoTracks = [
    { title: "Smells Like Teen Spirit", artist: "Nirvana" },
    { title: "Blue Monday", artist: "New Order" },
    { title: "Midnight City", artist: "M83" },
    { title: "Creep", artist: "Radiohead" }
  ];

  onMount(() => {
    // Page entrance animation
    if (pageRef) {
      pageEnter(pageRef);
    }

    setTimeout(() => {
      // Typewriter effect for hero text
      if (heroTextRef) {
        typewriter(heroTextRef, 'Welcome to JAMZY', 80);
      }

      // Float animation for CD
      if (cdRef) {
        float(cdRef);
      }

      // Stagger animate feature cards
      const featureCards = pageRef?.querySelectorAll('.feature-card');
      if (featureCards) {
        staggeredFadeIn(featureCards);
      }

      // Animate stats counting up
      if (statsRef) {
        const statNumbers = statsRef.querySelectorAll('.stat-number');
        statNumbers.forEach((stat, index) => {
          const target = parseInt(stat.getAttribute('data-target') || '0');
          setTimeout(() => {
            anime({
              targets: { value: 0 },
              value: target,
              duration: 1500,
              easing: 'easeOutQuad',
              update: (anim) => {
                stat.textContent = Math.round(anim.animations[0].currentValue).toLocaleString();
              }
            });
          }, index * 200);
        });
      }

      // Rotate through demo tracks
      setInterval(() => {
        setCurrentTrack(prev => (prev + 1) % demoTracks.length);
      }, 3000);
    }, 500);
  });

  const handleSignIn = () => {
    setIsLoading(true);
    // In real app, this would trigger Farcaster auth
    // For demo, we'll just set authenticated to true
    setTimeout(() => {
      setIsAuthenticated(true);
      localStorage.setItem('demo_authenticated', 'true');
      navigate('/');
      setIsLoading(false);
    }, 1500);
  };

  const handleExplore = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    particleBurst(button);
    setTimeout(() => {
      setIsAuthenticated(true);
      localStorage.setItem('demo_authenticated', 'true');
      navigate('/');
    }, 500);
  };

  const handleButtonHover = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    buttonHover.enter(button);
  };

  const handleButtonLeave = (e: MouseEvent) => {
    const button = e.currentTarget as HTMLElement;
    buttonHover.leave(button);
  };

  return (
    <div ref={pageRef!} class="min-h-screen bg-gradient-to-b from-gray-200 to-gray-300" style={{ opacity: '0' }}>
      {/* Hero Section */}
      <div class="container mx-auto px-8 py-16">
        <div class="text-center mb-12">
          {/* Hero Text */}
          <h1 ref={heroTextRef!} class="text-5xl font-bold text-black mb-4"></h1>
          <p class="text-xl text-gray-700 mb-8">Share tracks, discover vibes, connect through sound.</p>

          {/* CTA Buttons */}
          <div class="flex gap-4 justify-center mb-12">
            <button
              class="win95-button px-8 py-4 text-lg font-bold bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleSignIn}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              disabled={isLoading()}
            >
              {isLoading() ? (
                <span><i class="fas fa-spinner fa-spin mr-2"></i>Connecting...</span>
              ) : (
                <span><i class="fas fa-sign-in-alt mr-2"></i>Sign in with Farcaster</span>
              )}
            </button>
            <button
              class="win95-button px-8 py-4 text-lg"
              onClick={handleExplore}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              <i class="fas fa-play mr-2"></i>Explore App
            </button>
          </div>

          {/* Animated CD with Track Display */}
          <div ref={cdRef!} class="inline-block mb-8">
            <div class="relative">
              {/* CD Container */}
              <div class="relative w-64 h-64 mx-auto" style="filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.3));">
                {/* Outer CD Surface - Main disc body */}
                <div class="absolute inset-0 rounded-full animate-spin-slow" style="background: conic-gradient(from 0deg, #c0c0c0, #e0e0e0, #c0c0c0, #f0f0f0, #c0c0c0, #e0e0e0, #c0c0c0);">
                  {/* Rainbow refraction effect */}
                  <div class="absolute inset-0 rounded-full opacity-60" style="background: conic-gradient(from 45deg, transparent, rgba(255,0,255,0.2), rgba(0,255,255,0.2), rgba(255,255,0,0.2), transparent, rgba(255,0,255,0.2), rgba(0,255,255,0.2), transparent);"></div>
                </div>
                
                {/* Data tracks area (recordable area) */}
                <div class="absolute inset-3 rounded-full animate-spin-slow" style="background: linear-gradient(145deg, #b8b8b8, #d8d8d8);">
                  {/* Circular track lines */}
                  <div class="absolute inset-0 rounded-full" style="background: repeating-radial-gradient(circle at center, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px);"></div>
                </div>
                
                {/* Inner clear ring */}
                <div class="absolute inset-20 rounded-full animate-spin-slow bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner"></div>
                
                {/* Center hole - matches page background */}
                <div class="absolute inset-24 rounded-full animate-spin-slow" style="background: #d1d5db; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);"></div>
                
                {/* Light reflection overlay - doesn't spin */}
                <div class="absolute inset-0 rounded-full pointer-events-none" style="background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 55%, transparent 70%); mix-blend-mode: overlay;"></div>
              </div>
              
              {/* Now Playing Display */}
              <div class="win95-panel p-2 mt-4 bg-black">
                <div class="lcd-text text-center">
                  <div class="text-xs text-green-400 mb-1">NOW PLAYING</div>
                  <div class="text-sm font-bold overflow-hidden whitespace-nowrap">
                    <span class="inline-block animate-pulse">
                      {demoTracks[currentTrack()].title} - {demoTracks[currentTrack()].artist}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Discover Feature */}
          <div class="feature-card win95-panel p-6 hover:shadow-xl transition-all" style={{ opacity: '0' }}>
            <div class="text-4xl mb-4 text-center">🎵</div>
            <h3 class="text-xl font-bold text-black mb-3">Discover Music</h3>
            <p class="text-gray-700">
              Find your next favorite track through curated playlists, trending charts, and personalized recommendations based on your vibe.
            </p>
            <ul class="mt-4 text-sm text-gray-600">
              <li class="mb-2"><i class="fas fa-check text-green-600 mr-2"></i>Hidden gems from favorite artists</li>
              <li class="mb-2"><i class="fas fa-check text-green-600 mr-2"></i>Similar users with your taste</li>
              <li><i class="fas fa-check text-green-600 mr-2"></i>Top curators to follow</li>
            </ul>
          </div>

          {/* Share Feature */}
          <div class="feature-card win95-panel p-6 hover:shadow-xl transition-all" style={{ opacity: '0' }}>
            <div class="text-4xl mb-4 text-center">🎸</div>
            <h3 class="text-xl font-bold text-black mb-3">Share Your Sound</h3>
            <p class="text-gray-700">
              Create playlists, share tracks with the community, and build your reputation as a tastemaker in the JAMZY ecosystem.
            </p>
            <ul class="mt-4 text-sm text-gray-600">
              <li class="mb-2"><i class="fas fa-check text-green-600 mr-2"></i>YouTube & Spotify support</li>
              <li class="mb-2"><i class="fas fa-check text-green-600 mr-2"></i>Personal & collaborative playlists</li>
              <li><i class="fas fa-check text-green-600 mr-2"></i>Track your music stats</li>
            </ul>
          </div>

          {/* Connect Feature */}
          <div class="feature-card win95-panel p-6 hover:shadow-xl transition-all" style={{ opacity: '0' }}>
            <div class="text-4xl mb-4 text-center">💿</div>
            <h3 class="text-xl font-bold text-black mb-3">Connect & Vibe</h3>
            <p class="text-gray-700">
              Join a community of music lovers. Like, comment, and recast tracks. Follow curators and discover new music friends.
            </p>
            <ul class="mt-4 text-sm text-gray-600">
              <li class="mb-2"><i class="fas fa-check text-green-600 mr-2"></i>Social features powered by Farcaster</li>
              <li class="mb-2"><i class="fas fa-check text-green-600 mr-2"></i>Real-time trending charts</li>
              <li><i class="fas fa-check text-green-600 mr-2"></i>Build your music network</li>
            </ul>
          </div>
        </div>

        {/* Recently Played Ticker */}
        <div class="mt-8 overflow-hidden">
          <div class="win95-panel p-2 bg-black">
            <div class="flex items-center gap-4">
              <span class="text-yellow-400 font-bold text-xs">LIVE</span>
              <div class="flex-1 overflow-hidden">
                <div class="flex gap-8 animate-scroll-left">
                  <span class="text-green-400 text-xs whitespace-nowrap">🎵 grunge_kid_92 is playing "Black Hole Sun" by Soundgarden</span>
                  <span class="text-green-400 text-xs whitespace-nowrap">🎸 synth_lover_85 added "Take On Me" to Summer Vibes</span>
                  <span class="text-green-400 text-xs whitespace-nowrap">💿 vinyl_archaeologist discovered "Space Oddity" by David Bowie</span>
                  <span class="text-green-400 text-xs whitespace-nowrap">🎵 indie_explorer is playing "Time to Dance" by The Sounds</span>
                  <span class="text-green-400 text-xs whitespace-nowrap">🎵 grunge_kid_92 is playing "Black Hole Sun" by Soundgarden</span>
                  <span class="text-green-400 text-xs whitespace-nowrap">🎸 synth_lover_85 added "Take On Me" to Summer Vibes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <div class="mt-16 text-center">
          <p class="text-gray-600 mb-4">Join the growing community of music lovers</p>
          <div ref={statsRef!} class="flex justify-center gap-8">
            <div class="win95-panel px-6 py-3 hover:shadow-xl transition-all">
              <div class="stat-number text-2xl font-bold text-black" data-target="1337">0</div>
              <div class="text-sm text-gray-600">Active Users</div>
            </div>
            <div class="win95-panel px-6 py-3 hover:shadow-xl transition-all">
              <div class="stat-number text-2xl font-bold text-black" data-target="42069">0</div>
              <div class="text-sm text-gray-600">Tracks Shared</div>
            </div>
            <div class="win95-panel px-6 py-3 hover:shadow-xl transition-all">
              <div class="stat-number text-2xl font-bold text-black" data-target="256">0</div>
              <div class="text-sm text-gray-600">Playlists Created</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div class="mt-16 text-center text-sm text-gray-600">
          <p class="mb-2">Built with ❤️ for the Farcaster community</p>
          <div class="flex justify-center gap-4">
            <a href="#" class="hover:text-blue-600"><i class="fab fa-github mr-1"></i>GitHub</a>
            <a href="#" class="hover:text-blue-600"><i class="fab fa-twitter mr-1"></i>Twitter</a>
            <a href="#" class="hover:text-blue-600"><i class="fas fa-book mr-1"></i>Docs</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageA;
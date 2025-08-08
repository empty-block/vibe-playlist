import { Component, onMount, createSignal, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { typewriter, glitch, slideIn, buttonHover } from '../utils/animations';
import anime from 'animejs';

const LandingPageB: Component = () => {
  const navigate = useNavigate();
  const [bootStage, setBootStage] = createSignal(0);
  const [loadingProgress, setLoadingProgress] = createSignal(0);
  const [showMainScreen, setShowMainScreen] = createSignal(false);
  let consoleRef: HTMLDivElement;
  let mainScreenRef: HTMLDivElement;

  const bootMessages = [
    'JAMZY OS v1.0.2024',
    'Loading Audio System... OK',
    'Starting JAMZY...'
  ];

  onMount(() => {
    // Start boot sequence
    startBootSequence();
  });

  const startBootSequence = async () => {
    // Show boot messages one by one (faster)
    for (let i = 0; i < bootMessages.length; i++) {
      setBootStage(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Start progress bar immediately
    await new Promise(resolve => setTimeout(resolve, 200));
    animateProgressBar();
  };

  const animateProgressBar = () => {
    const progressAnimation = anime({
      targets: { value: 0 },
      value: 100,
      duration: 1500, // Faster loading
      easing: 'easeInOutQuad',
      update: (anim) => {
        setLoadingProgress(Math.round(anim.animations[0].currentValue));
      },
      complete: () => {
        setTimeout(() => {
          setShowMainScreen(true);
          if (mainScreenRef) {
            slideIn.fromBottom(mainScreenRef);
          }
        }, 200);
      }
    });
  };

  const handleSignIn = () => {
    // Add glitch effect before navigation
    if (mainScreenRef) {
      glitch(mainScreenRef.querySelector('h1')!);
    }
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleExplore = () => {
    // Add glitch effect before navigation
    if (mainScreenRef) {
      glitch(mainScreenRef.querySelector('h1')!);
    }
    setTimeout(() => {
      navigate('/');
    }, 1000);
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
    <div class="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative">
      {/* Boot Sequence Screen */}
      <Show when={!showMainScreen()}>
        <div ref={consoleRef!} class="p-8">
          <div class="max-w-4xl mx-auto">
            {/* ASCII Art Logo */}
            <pre class="text-green-400 text-xs mb-8 leading-none">
{`
     ██╗ █████╗ ███╗   ███╗███████╗██╗   ██╗
     ██║██╔══██╗████╗ ████║╚══███╔╝╚██╗ ██╔╝
     ██║███████║██╔████╔██║  ███╔╝  ╚████╔╝ 
██   ██║██╔══██║██║╚██╔╝██║ ███╔╝    ╚██╔╝  
╚█████╔╝██║  ██║██║ ╚═╝ ██║███████╗   ██║   
 ╚════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝   ╚═╝   
`}
            </pre>

            {/* Boot Messages */}
            <div class="space-y-1 mb-8">
              <For each={bootMessages.slice(0, bootStage() + 1)}>
                {(message, index) => (
                  <div class="text-green-400 text-sm animate-pulse">
                    {index() === bootStage() && '> '}{message}
                  </div>
                )}
              </For>
            </div>

            {/* Progress Bar */}
            <Show when={bootStage() >= bootMessages.length - 1}>
              <div class="mt-8">
                <div class="text-center mb-4">
                  <span class="text-yellow-400">Loading JAMZY...</span>
                </div>
                <div class="win95-panel p-2 bg-gray-800 max-w-md mx-auto">
                  <div class="bg-black p-1">
                    <div 
                      class="bg-green-400 h-4 transition-all duration-100"
                      style={{ width: `${loadingProgress()}%` }}
                    ></div>
                  </div>
                </div>
                <div class="text-center mt-2 text-yellow-400">
                  {loadingProgress()}%
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Main Screen (After Boot) */}
      <Show when={showMainScreen()}>
        <div ref={mainScreenRef!} class="min-h-screen flex items-center justify-center p-8">
          <div class="max-w-4xl w-full">
            {/* Window Frame */}
            <div class="win95-window bg-gray-200">
              {/* Title Bar */}
              <div class="win95-title-bar bg-gradient-to-r from-blue-800 to-blue-600 px-2 py-1 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <i class="fas fa-music text-white"></i>
                  <span class="text-white font-bold text-sm">JAMZY.exe - Welcome</span>
                </div>
                <div class="flex gap-1">
                  <button class="win95-button px-2 py-0 text-xs">_</button>
                  <button class="win95-button px-2 py-0 text-xs">□</button>
                  <button class="win95-button px-2 py-0 text-xs bg-red-600 text-white">X</button>
                </div>
              </div>

              {/* Window Content */}
              <div class="p-8 bg-gray-100">
                {/* Logo and Welcome */}
                <div class="text-center mb-8">
                  <div class="inline-block mb-4">
                    <div class="relative w-32 h-32 mx-auto">
                      {/* Simplified CD for smaller size */}
                      <div class="absolute inset-0 rounded-full animate-spin-slow" style="background: conic-gradient(from 0deg, #c0c0c0, #e0e0e0, #c0c0c0, #f0f0f0, #c0c0c0, #e0e0e0, #c0c0c0); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));">
                        <div class="absolute inset-0 rounded-full opacity-50" style="background: conic-gradient(from 45deg, transparent, rgba(255,0,255,0.3), rgba(0,255,255,0.3), rgba(255,255,0,0.3), transparent);"></div>
                      </div>
                      <div class="absolute inset-1 rounded-full animate-spin-slow bg-gradient-to-br from-gray-300 to-gray-400"></div>
                      <div class="absolute inset-10 rounded-full animate-spin-slow bg-gradient-to-br from-gray-100 to-gray-200"></div>
                      <div class="absolute inset-12 rounded-full animate-spin-slow bg-gray-900"></div>
                      <div class="absolute inset-0 rounded-full" style="background: linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%);"></div>
                    </div>
                  </div>
                  <h1 class="text-4xl font-bold text-black mb-2">Welcome to JAMZY</h1>
                  <p class="text-gray-700">Social music discovery platform</p>
                </div>

                {/* System Info Box */}
                <div class="win95-panel p-4 mb-6 bg-white">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-600">System:</span>
                      <span class="text-black ml-2 font-bold">JAMZY OS</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Version:</span>
                      <span class="text-black ml-2 font-bold">1.0.1337</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Audio Engine:</span>
                      <span class="text-black ml-2 font-bold">SoundBlaster Pro</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Network:</span>
                      <span class="text-green-600 ml-2 font-bold">Connected</span>
                    </div>
                  </div>
                </div>

                {/* Feature List */}
                <div class="win95-panel p-4 mb-6 bg-white">
                  <h3 class="font-bold text-black mb-3">System Features:</h3>
                  <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-check-square text-green-600"></i>
                      <span class="text-black">Multi-source audio playback (YouTube, Spotify)</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="fas fa-check-square text-green-600"></i>
                      <span class="text-black">Social integration via Farcaster protocol</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="fas fa-check-square text-green-600"></i>
                      <span class="text-black">Collaborative playlist management</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="fas fa-check-square text-green-600"></i>
                      <span class="text-black">Real-time trending analysis</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="fas fa-check-square text-green-600"></i>
                      <span class="text-black">Nostalgic Windows 95 interface</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div class="flex gap-4 justify-center">
                  <button
                    class="win95-button px-6 py-3 font-bold flex items-center gap-2"
                    onClick={handleSignIn}
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                  >
                    <i class="fas fa-user text-blue-600"></i>
                    <span class="text-black">Sign In with Farcaster</span>
                  </button>
                  <button
                    class="win95-button px-6 py-3 font-bold flex items-center gap-2"
                    onClick={handleExplore}
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                  >
                    <i class="fas fa-play text-green-600"></i>
                    <span class="text-black">Launch Demo Mode</span>
                  </button>
                </div>

                {/* Footer */}
                <div class="mt-6 text-center text-xs text-gray-600">
                  <p>© 2024 JAMZY. All rights reserved.</p>
                  <p class="mt-1">Press F1 for help | ESC to exit</p>
                </div>
              </div>
            </div>

            {/* Taskbar */}
            <div class="win95-taskbar mt-4 bg-gray-300 border-t-2 border-white p-1 flex items-center justify-between">
              <button class="win95-button px-3 py-1 font-bold text-sm flex items-center gap-1">
                <div class="w-4 h-4 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500"></div>
                Start
              </button>
              <div class="flex items-center gap-2 text-xs text-black">
                <i class="fas fa-volume-up"></i>
                <i class="fas fa-network-wired"></i>
                <span class="font-bold">3:14 PM</span>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default LandingPageB;
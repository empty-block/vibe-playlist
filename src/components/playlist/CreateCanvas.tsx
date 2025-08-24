import { Component, createEffect, onMount, Show, Switch, Match } from 'solid-js';
import anime from 'animejs';
import { creationStore } from '../../stores/creationStore';
import VibeSelector from './VibeSelector';
import ConversationalDiscovery from './ConversationalDiscovery';
import PlaylistComposer from './PlaylistComposer';

interface CreateCanvasProps {
  onComplete?: (playlist: any) => void;
}

const CreateCanvas: Component<CreateCanvasProps> = (props) => {
  const { 
    currentStep, 
    selectedVibe,
    selectedTracks,
    threadText,
    playlistTitle,
    isStepComplete,
    canProceed,
    getProgress
  } = creationStore;
  
  let canvasRef: HTMLDivElement;
  let creationPanelRef: HTMLDivElement;
  let headerRef: HTMLDivElement;

  onMount(() => {
    // Initial canvas entrance animation
    if (canvasRef) {
      anime({
        targets: canvasRef,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: 'easeOutCubic'
      });
    }

    // Panel entrance animation
    if (creationPanelRef) {
      anime({
        targets: creationPanelRef,
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 600,
        delay: 400,
        easing: 'easeOutCubic'
      });
    }

    // Header glow effect
    if (headerRef) {
      anime({
        targets: headerRef,
        boxShadow: [
          '0 0 0px #3b00fd',
          '0 0 20px #3b00fd',
          '0 0 0px #3b00fd'
        ],
        duration: 2000,
        loop: true,
        direction: 'alternate',
        easing: 'easeInOutSine'
      });
    }
  });

  // Animate step transitions
  createEffect(() => {
    const step = currentStep();

    // Step transition animation
    if (creationPanelRef) {
      anime({
        targets: creationPanelRef,
        scale: [0.98, 1],
        opacity: [0.8, 1],
        duration: 300,
        easing: 'easeOutCubic'
      });
    }
  });

  const handleStepChange = (newStep: typeof currentStep) => {
    // Only allow navigation if current step is complete or going backwards
    const steps = ['vibe', 'discovery', 'composition', 'social', 'publish'];
    const currentIndex = steps.indexOf(currentStep());
    const newIndex = steps.indexOf(newStep());
    
    if (newIndex <= currentIndex || isStepComplete()) {
      // Animate out current step
      if (creationPanelRef) {
        anime({
          targets: creationPanelRef,
          scale: [1, 0.95],
          opacity: [1, 0.7],
          duration: 200,
          easing: 'easeInCubic',
          complete: () => {
            creationStore.setCurrentStep(newStep());
          }
        });
      }
    }
  };

  const handleVibeSelect = (vibe: any) => {
    creationStore.setSelectedVibe(vibe);
    // Auto-advance if vibe is selected
    if (vibe) {
      setTimeout(() => creationStore.nextStep(), 800);
    }
  };

  const handleCustomVibeDescribe = (description: string) => {
    creationStore.setCustomVibeDescription(description);
    // Auto-advance if custom vibe is described
    if (description.trim()) {
      setTimeout(() => creationStore.nextStep(), 800);
    }
  };

  const handleTracksSelected = (tracks: any[]) => {
    creationStore.setSelectedTracks(tracks);
  };

  const handleDiscoveryComplete = (tracks: any[]) => {
    creationStore.setSelectedTracks(tracks);
    // Auto-advance to composition step
    setTimeout(() => creationStore.setCurrentStep('composition'), 500);
  };

  const handleCompletePlaylist = () => {
    try {
      const playlist = creationStore.createPlaylist();
      props.onComplete?.(playlist);
    } catch (error) {
      console.error('Failed to create playlist:', error);
      alert('Please complete all required fields before publishing');
    }
  };

  // Dynamic titles and descriptions
  const getStepTitle = () => {
    const step = currentStep();
    const progress = getProgress();
    
    const titles = {
      vibe: 'Start Your Musical Conversation',
      discovery: 'Chat with Your Music Assistant', 
      composition: 'Craft Your Playlist',
      social: 'Frame Your Thread',
      publish: 'Share Your Vibes'
    };
    
    return `${titles[step]} (${progress.currentStep}/${progress.totalSteps})`;
  };

  const getStepDescription = () => {
    const step = currentStep();
    const vibe = selectedVibe();
    const trackCount = selectedTracks().length;
    
    const descriptions = {
      vibe: "What's the vibe? Set the mood for your playlist",
      discovery: vibe ? `Let's discover some music that captures the ${vibe.name.toLowerCase()} vibe` : "Tell me about the music you're looking for",
      composition: `Name it, style it, make it yours - ${trackCount} track${trackCount !== 1 ? 's' : ''} ready`,
      social: "Write the conversation starter for your Farcaster thread",
      publish: "Ready to launch your playlist into the world!"
    };
    
    return descriptions[step];
  };

  return (
    <div 
      ref={canvasRef!} 
      class="h-full w-full flex flex-col bg-black text-white"
      style={{
        opacity: 0,
        background: 'linear-gradient(135deg, #000000 0%, #1a0033 50%, #000000 100%)'
      }}
    >
      {/* Header */}
      <div 
        ref={headerRef!}
        class="flex-shrink-0 p-6 text-center border-b border-purple-900/30"
        style={{
          background: 'linear-gradient(135deg, #3b00fd 0%, #04caf4 100%)',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent'
        }}
      >
        <h1 class="text-4xl font-bold mb-2">{getStepTitle()}</h1>
        <p class="text-lg opacity-80">
          {getStepDescription()}
        </p>
      </div>

      {/* Progress Indicator */}
      <div class="flex-shrink-0 px-6 py-3 border-b border-purple-900/30">
        <div class="flex justify-center space-x-4">
          {(['vibe', 'discovery', 'composition', 'social', 'publish']).map((step, index) => {
            const isActive = currentStep() === step;
            const isComplete = index < ['vibe', 'discovery', 'composition', 'social', 'publish'].indexOf(currentStep());
            const canAccess = isComplete || isActive || (index <= ['vibe', 'discovery', 'composition', 'social', 'publish'].indexOf(currentStep()) && isStepComplete());
            
            return (
              <button
                onClick={() => canAccess && handleStepChange(() => step)}
                disabled={!canAccess}
                class="flex items-center space-x-2 px-3 py-1 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isActive 
                    ? 'linear-gradient(135deg, #3b00fd 0%, #04caf4 100%)'
                    : isComplete 
                    ? 'rgba(0, 249, 42, 0.2)'
                    : 'rgba(255,255,255,0.1)',
                  border: isActive ? '2px solid #00f92a' : '2px solid transparent'
                }}
              >
                <div 
                  class="w-2 h-2 rounded-full"
                  style={{
                    background: isActive ? '#00f92a' : isComplete ? '#00f92a' : '#666'
                  }}
                />
                <span class="text-sm font-medium capitalize">{step}</span>
                {isComplete && <span class="text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Full Width */}
      <div class="flex-1 overflow-hidden">
        {/* Creation Panel (Full Width) */}
        <div 
          ref={creationPanelRef!}
          class="w-full h-full p-6 overflow-y-auto"
          style={{
            opacity: 0,
            background: 'linear-gradient(180deg, rgba(59, 0, 253, 0.05) 0%, rgba(0, 0, 0, 0.1) 100%)'
          }}
        >
          <div class="w-full h-full">
            {/* Step Content */}
            <Switch>
              <Match when={currentStep() === 'vibe'}>
                <div class="h-full flex flex-col">
                  <div class="flex-1">
                    <VibeSelector
                      selectedVibe={selectedVibe()?.id}
                      onVibeSelect={handleVibeSelect}
                      onCustomVibeDescribe={handleCustomVibeDescribe}
                    />
                  </div>
                  <div class="flex justify-end mt-4">
                    <button
                      onClick={() => creationStore.skipStep()}
                      class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all duration-300"
                    >
                      Skip →
                    </button>
                  </div>
                </div>
              </Match>
              
              <Match when={currentStep() === 'discovery'}>
                <div class="h-full">
                  <ConversationalDiscovery
                    selectedVibe={selectedVibe()}
                    onTracksSelected={handleTracksSelected}
                    onComplete={handleDiscoveryComplete}
                  />
                </div>
              </Match>
              
              <Match when={currentStep() === 'composition'}>
                <div class="h-full">
                  <PlaylistComposer
                    selectedVibe={selectedVibe()}
                    selectedTracks={selectedTracks()}
                    onComplete={() => creationStore.nextStep()}
                  />
                </div>
              </Match>
              
              <Match when={currentStep() === 'social'}>
                <div class="flex items-center justify-center h-full p-6">
                  <div class="w-full max-w-2xl">
                    <div class="text-center mb-8">
                      <div class="text-6xl mb-4">💬</div>
                      <h3 class="text-xl font-semibold mb-2 text-white">
                        Craft Your Thread Starter
                      </h3>
                      <p class="text-gray-400">
                        Write something to invite others to contribute tracks
                      </p>
                    </div>
                    
                    <textarea
                      value={threadText()}
                      onInput={(e) => creationStore.setThreadText(e.currentTarget.value)}
                      placeholder="Tell the community about this playlist and invite them to add tracks... 

Example: 'Just curated some perfect tracks for late-night coding sessions. What songs help you focus when the world gets quiet?'"
                      class="w-full p-4 rounded-lg bg-gray-900/50 border border-purple-500/30 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-400"
                      rows="6"
                    />
                    
                    <div class="flex justify-between mt-6">
                      <button
                        onClick={() => creationStore.previousStep()}
                        class="px-6 py-3 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-800 transition-all duration-300"
                      >
                        ← Back
                      </button>
                      <div class="flex space-x-3">
                        <button
                          onClick={() => creationStore.skipStep()}
                          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all duration-300"
                        >
                          Skip
                        </button>
                        <button
                          onClick={() => creationStore.nextStep()}
                          disabled={!threadText().trim() || threadText().trim().length < 20}
                          class="px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                          style={{
                            background: threadText().trim().length >= 20
                              ? 'linear-gradient(135deg, #00f92a 0%, #04caf4 100%)'
                              : 'rgba(255,255,255,0.1)'
                          }}
                        >
                          Ready to Publish →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Match>
              
              <Match when={currentStep() === 'publish'}>
                <div class="flex items-center justify-center h-full">
                  <div class="text-center p-8">
                    <div class="text-6xl mb-4">🚀</div>
                    <h3 class="text-xl font-semibold mb-2 text-white">
                      Launch Your Playlist!
                    </h3>
                    <p class="text-gray-400 mb-6">
                      Your playlist is ready to become a Farcaster thread
                    </p>
                    
                    <div class="bg-gray-900/50 rounded-lg p-4 mb-6 text-left">
                      <div class="text-sm text-gray-300 mb-2">
                        <strong>{playlistTitle()}</strong> ({selectedTracks().length} tracks)
                      </div>
                      <div class="text-xs text-gray-500 italic">
                        "{threadText().slice(0, 100)}..."
                      </div>
                    </div>
                    
                    <div class="flex space-x-3 justify-center">
                      <button
                        onClick={() => creationStore.previousStep()}
                        class="px-6 py-3 rounded-lg font-medium border border-gray-600 text-gray-300 hover:bg-gray-800 transition-all duration-300"
                      >
                        ← Edit
                      </button>
                      <button
                        onClick={handleCompletePlaylist}
                        class="px-8 py-3 rounded-lg font-medium transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, #f906d6 0%, #ff9b00 100%)',
                          boxShadow: '0 0 0px #f906d6'
                        }}
                        onMouseEnter={(e) => {
                          anime({
                            targets: e.currentTarget,
                            boxShadow: '0 0 30px #f906d6',
                            scale: 1.05,
                            duration: 300
                          });
                        }}
                        onMouseLeave={(e) => {
                          anime({
                            targets: e.currentTarget,
                            boxShadow: '0 0 0px #f906d6',
                            scale: 1,
                            duration: 300
                          });
                        }}
                      >
                        Launch Playlist 🚀
                      </button>
                    </div>
                  </div>
                </div>
              </Match>
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCanvas;
// Central animation hub - provides access to both legacy and modular animations
// Components can import from this central location during migration

// Re-export shared utilities and types
export * from './types';
export * from './core';

// For backward compatibility, re-export the original animations
export * from '../animations';

// New modular animations are available for direct import:
// import { playButtonPulse } from '@/components/player/player.animations' 
// import { buttonHover } from '@/components/ui/animations/buttons.animations'
// import { slideIn } from '@/components/ui/animations/transitions.animations'
// import { particleBurst } from '@/components/ui/animations/effects.animations'
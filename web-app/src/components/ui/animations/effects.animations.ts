import anime from 'animejs';

// ====== SPECIAL EFFECTS ANIMATIONS ======

// Counter animation with number counting up
export const counterAnimation = (element: HTMLElement, from: number, to: number) => {
  const obj = { count: from };
  anime({
    targets: obj,
    count: to,
    round: 1,
    duration: 800,
    easing: 'easeOutQuad',
    update: () => {
      element.textContent = obj.count.toString();
    }
  });
};

// Floating animation for special elements
export const float = (element: HTMLElement) => {
  anime({
    targets: element,
    translateY: [0, -8, 0],
    duration: 3000,
    easing: 'easeInOutSine',
    loop: true
  });
};

// Shimmer loading effect
export const shimmer = (element: HTMLElement) => {
  element.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
  element.style.backgroundSize = '200% 100%';
  
  anime({
    targets: element,
    backgroundPosition: ['-200% 0', '200% 0'],
    duration: 1500,
    easing: 'linear',
    loop: true
  });
};

// Typewriter effect
export const typewriter = (element: HTMLElement, text: string, speed: number = 50) => {
  element.textContent = '';
  const chars = text.split('');
  let i = 0;
  
  const timer = setInterval(() => {
    if (i < chars.length) {
      element.textContent += chars[i];
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);
};

// Glitch effect
export const glitch = (element: HTMLElement) => {
  const originalText = element.textContent;
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      element.textContent = originalText?.split('').map(char => 
        Math.random() < 0.3 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
      ).join('') || '';
      
      anime({
        targets: element,
        textShadow: [
          '2px 0 #ff0000, -2px 0 #00ffff',
          '0 0 transparent'
        ],
        duration: 150,
        complete: () => {
          if (i === 2) element.textContent = originalText;
        }
      });
    }, i * 100);
  }
};

// Terminal cursor blink effect
export const cursorBlink = (element: HTMLElement) => {
  anime({
    targets: element,
    opacity: [1, 0],
    duration: 800,
    direction: 'alternate',
    loop: true,
    easing: 'linear'
  });
};

// Neon glow pulse for special elements
export const neonPulse = (element: HTMLElement, color: string = '#04caf4') => {
  anime({
    targets: element,
    boxShadow: [
      `0 0 5px ${color}`,
      `0 0 20px ${color}, 0 0 35px ${color}`,
      `0 0 5px ${color}`
    ],
    duration: 2000,
    loop: true,
    easing: 'easeInOutSine'
  });
};

// Loading dots animation
export const loadingDots = (element: HTMLElement) => {
  const dots = element.textContent || '...';
  let count = 0;
  
  const animate = () => {
    count = (count + 1) % 4;
    element.textContent = '.'.repeat(count);
  };
  
  const interval = setInterval(animate, 500);
  
  // Return cleanup function
  return () => clearInterval(interval);
};
import anime from 'animejs';

// ====== BUTTON INTERACTION ANIMATIONS ======

// General button hover effect
export const buttonHover = {
  enter: (element: HTMLElement) => {
    anime({
      targets: element,
      scale: 1.05,
      translateY: -2,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      duration: 200,
      easing: 'easeOutQuad'
    });
  },
  
  leave: (element: HTMLElement) => {
    anime({
      targets: element,
      scale: 1,
      translateY: 0,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      duration: 200,
      easing: 'easeOutQuad'
    });
  }
};

// Social button click animation
export const socialButtonClick = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 0.95, 1],
    duration: 150,
    easing: 'easeInOutQuad'
  });
};

// Heart beat effect for like buttons
export const heartBeat = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 1.3, 1],
    duration: 400,
    easing: 'easeInOutQuad'
  });
};

// Icon spin animation
export const iconSpin = (element: HTMLElement) => {
  anime({
    targets: element,
    rotate: '1turn',
    duration: 500,
    easing: 'easeInOutQuad'
  });
};

// Magnetic button effect
export const magnetic = (element: HTMLElement, strength: number = 20) => {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.1;
    const deltaY = (e.clientY - centerY) * 0.1;
    
    anime({
      targets: element,
      translateX: deltaX,
      translateY: deltaY,
      duration: 200,
      easing: 'easeOutQuad'
    });
  };
  
  const handleMouseLeave = () => {
    anime({
      targets: element,
      translateX: 0,
      translateY: 0,
      duration: 300,
      easing: 'easeOutElastic'
    });
  };
  
  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);
};

// Particle burst effect for special button clicks
export const particleBurst = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'absolute w-2 h-2 rounded-full pointer-events-none z-50';
    particle.style.backgroundColor = '#04caf4';
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    document.body.appendChild(particle);
    
    const angle = (i * 30) * Math.PI / 180;
    const distance = 80 + Math.random() * 40;
    
    anime({
      targets: particle,
      translateX: Math.cos(angle) * distance,
      translateY: Math.sin(angle) * distance,
      opacity: [1, 0],
      scale: [0.5, 0],
      duration: 800,
      easing: 'easeOutCubic',
      complete: () => {
        particle.remove();
      }
    });
  }
};
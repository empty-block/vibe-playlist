import anime from 'animejs';

// ====== UI TRANSITION ANIMATIONS ======

// Slide in animations
export const slideIn = {
  fromTop: (element: HTMLElement) => {
    anime({
      targets: element,
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutCubic'
    });
  },
  
  fromBottom: (element: HTMLElement) => {
    anime({
      targets: element,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutCubic'
    });
  },
  
  fromLeft: (element: HTMLElement) => {
    anime({
      targets: element,
      translateX: [-30, 0],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutCubic',
      complete: () => {
        // Ensure transform is properly reset after animation
        element.style.transform = 'translateZ(0)';
      }
    });
  }
};

// Slide out animations
export const slideOut = {
  toTop: (element: HTMLElement) => {
    return anime({
      targets: element,
      translateY: [0, -20],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInCubic'
    });
  },
  
  toBottom: (element: HTMLElement) => {
    return anime({
      targets: element,
      translateY: [0, 20],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInCubic'
    });
  }
};

// Reply box expand/collapse
export const replyBoxExpand = (element: HTMLElement) => {
  // Set initial state
  element.style.transform = 'scaleY(0)';
  element.style.transformOrigin = 'top';
  element.style.opacity = '0';
  
  anime({
    targets: element,
    scaleY: [0, 1],
    opacity: [0, 1],
    duration: 300,
    easing: 'easeOutQuart'
  });
};

export const replyBoxCollapse = (element: HTMLElement) => {
  return anime({
    targets: element,
    scaleY: [1, 0],
    opacity: [1, 0],
    duration: 250,
    easing: 'easeInQuart'
  });
};

// Page entrance animation
export const pageEnter = (element: HTMLElement) => {
  anime({
    targets: element,
    opacity: [0, 1],
    translateY: [30, 0],
    scale: [0.95, 1],
    duration: 600,
    easing: 'easeOutCubic',
    delay: 100
  });
};

// Smooth state transition for dual-purpose components
export const morphTransition = (fromElement: HTMLElement, toElement: HTMLElement) => {
  // Fade out current content
  anime({
    targets: fromElement,
    opacity: [1, 0],
    scale: [1, 0.95],
    duration: 300,
    easing: 'easeInCubic',
    complete: () => {
      fromElement.style.display = 'none';
      toElement.style.display = 'block';
      
      // Fade in new content
      anime({
        targets: toElement,
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 400,
        easing: 'easeOutCubic'
      });
    }
  });
};

// Staggered fade in for multiple elements
export const staggeredFadeIn = (elements: NodeListOf<Element> | Element[]) => {
  anime({
    targets: elements,
    opacity: [0, 1],
    translateY: [15, 0],
    duration: 400,
    delay: anime.stagger(100),
    easing: 'easeOutCubic',
    complete: () => {
      // Ensure transforms are properly reset after stagger animation
      Array.from(elements).forEach(el => {
        (el as HTMLElement).style.transform = 'translateZ(0)';
      });
    }
  });
};
tailwind.config = {
  theme: {
    extend: {
      colors: {
        grunge: {
          yellow: '#ffff00',
          magenta: '#ff00ff',
          cyan: '#00ffff',
          lime: '#00ff00',
          orange: '#ff8800',
          purple: '#8000ff'
        },
        windows: {
          gray: '#c0c0c0',
          darkgray: '#808080',
          blue: '#0000ff',
          teal: '#008080'
        }
      },
      fontFamily: {
        'pixel': ['VT323', 'monospace'],
        'terminal': ['Courier New', 'monospace'],
        'impact': ['Impact', 'Arial Black', 'sans-serif']
      },
      animation: {
        'blink': 'blink 1s linear infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'glitch-90s': 'glitch-90s 0.2s ease-in-out'
      }
    }
  }
}
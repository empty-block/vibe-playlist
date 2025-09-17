import { Component, createSignal, onMount, onCleanup, For, Show, createEffect } from 'solid-js';
import anime from 'animejs';

interface Node {
  id: string;
  type: 'user' | 'track';
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number;
  influence?: number;
  avatar?: string;
  artist?: string;
  cover?: string;
}

interface Edge {
  source: string;
  target: string;
  type: 'share' | 'like' | 'reply';
  strength: number;
}

interface NetworkGraphProps {
  networkType: 'personal' | 'extended' | 'community' | 'genre';
}

const NetworkGraph: Component<NetworkGraphProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  
  const [dimensions, setDimensions] = createSignal({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = createSignal<Node | null>(null);
  const [selectedNode, setSelectedNode] = createSignal<Node | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [zoomLevel, setZoomLevel] = createSignal(1);
  const [panOffset, setPanOffset] = createSignal({ x: 0, y: 0 });
  
  // Generate mock network data
  const generateNetworkData = (): { nodes: Node[], edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Get initial dimensions
    const { width, height } = dimensions();
    const centerX = width / 2 || 400;
    const centerY = height / 2 || 300;
    
    // Create central user node
    const centralUser: Node = {
      id: 'user-0',
      type: 'user',
      label: 'You',
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      connections: 15,
      influence: 95,
      avatar: '/api/placeholder/40/40'
    };
    nodes.push(centralUser);
    
    // Generate user nodes
    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 100 + Math.random() * 80;
      nodes.push({
        id: `user-${i}`,
        type: 'user',
        label: `User ${i}`,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        connections: Math.floor(Math.random() * 10) + 2,
        influence: Math.floor(Math.random() * 80) + 20,
        avatar: '/api/placeholder/40/40'
      });
    }
    
    // Generate track nodes
    for (let i = 1; i <= 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 120 + Math.random() * 100;
      nodes.push({
        id: `track-${i}`,
        type: 'track',
        label: `Track ${i}`,
        artist: `Artist ${Math.floor(Math.random() * 5) + 1}`,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        connections: Math.floor(Math.random() * 8) + 1,
        cover: '/api/placeholder/40/40'
      });
    }
    
    // Generate edges
    const edgeTypes: Edge['type'][] = ['share', 'like', 'reply'];
    
    // Connect central user to some nodes
    for (let i = 1; i <= 8; i++) {
      edges.push({
        source: 'user-0',
        target: `user-${i}`,
        type: edgeTypes[Math.floor(Math.random() * 3)],
        strength: Math.random() * 0.8 + 0.2
      });
    }
    
    // Connect users to tracks
    for (let i = 1; i <= 8; i++) {
      const userIndex = Math.floor(Math.random() * 12) + 1;
      edges.push({
        source: `user-${userIndex}`,
        target: `track-${i}`,
        type: edgeTypes[Math.floor(Math.random() * 3)],
        strength: Math.random() * 0.6 + 0.2
      });
    }
    
    // Some user-to-user connections
    for (let i = 0; i < 10; i++) {
      const source = Math.floor(Math.random() * 12) + 1;
      const target = Math.floor(Math.random() * 12) + 1;
      if (source !== target) {
        edges.push({
          source: `user-${source}`,
          target: `user-${target}`,
          type: edgeTypes[Math.floor(Math.random() * 3)],
          strength: Math.random() * 0.5 + 0.1
        });
      }
    }
    
    return { nodes, edges };
  };
  
  const [networkData, setNetworkData] = createSignal<{ nodes: Node[], edges: Edge[] }>({ nodes: [], edges: [] });
  
  // Particle system for animated connections
  class Particle {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    progress: number;
    speed: number;
    color: string;
    
    constructor(startX: number, startY: number, endX: number, endY: number, color: string) {
      this.x = startX;
      this.y = startY;
      this.targetX = endX;
      this.targetY = endY;
      this.progress = 0;
      this.speed = 0.005 + Math.random() * 0.01;
      this.color = color;
    }
    
    update() {
      this.progress += this.speed;
      if (this.progress >= 1) {
        this.progress = 0;
      }
      
      this.x = this.x + (this.targetX - this.x) * this.progress;
      this.y = this.y + (this.targetY - this.y) * this.progress;
    }
  }
  
  const particles: Particle[] = [];
  
  // Initialize particles for edges
  const initParticles = () => {
    networkData().edges.forEach(edge => {
      const sourceNode = networkData().nodes.find(n => n.id === edge.source);
      const targetNode = networkData().nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const color = edge.type === 'share' ? '#00ffff' : 
                     edge.type === 'like' ? '#00ff88' : '#ff00ff';
        
        // Create 1-3 particles per edge based on strength
        const particleCount = Math.ceil(edge.strength * 3);
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle(
            sourceNode.x, sourceNode.y,
            targetNode.x, targetNode.y,
            color
          ));
        }
      }
    });
  };
  
  // Canvas drawing function
  const draw = () => {
    if (!canvasRef) return;
    
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = dimensions();
    ctx.clearRect(0, 0, width, height);
    
    // Save context state
    ctx.save();
    
    // Apply zoom and pan
    ctx.translate(panOffset().x, panOffset().y);
    ctx.scale(zoomLevel(), zoomLevel());
    
    // Draw grid background
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw edges
    networkData().edges.forEach(edge => {
      const source = networkData().nodes.find(n => n.id === edge.source);
      const target = networkData().nodes.find(n => n.id === edge.target);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        
        const color = edge.type === 'share' ? 'rgba(0, 255, 255, 0.3)' :
                     edge.type === 'like' ? 'rgba(0, 255, 136, 0.3)' :
                     'rgba(255, 0, 255, 0.3)';
        
        ctx.strokeStyle = color;
        ctx.lineWidth = edge.strength * 3;
        ctx.stroke();
      }
    });
    
    // Draw particles
    particles.forEach(particle => {
      particle.update();
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = particle.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    
    // Draw nodes
    networkData().nodes.forEach(node => {
      const isHovered = hoveredNode()?.id === node.id;
      const isSelected = selectedNode()?.id === node.id;
      
      // Node shape based on type
      if (node.type === 'user') {
        // Circle for users
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20 + node.connections * 0.5, 0, Math.PI * 2);
        
        if (isSelected) {
          ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
          ctx.fill();
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 3;
        } else if (isHovered) {
          ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
          ctx.fill();
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 2;
        } else {
          ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
        
      } else {
        // Hexagon for tracks
        const size = 15 + node.connections * 0.5;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = node.x + size * Math.cos(angle);
          const y = node.y + size * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        
        if (isSelected) {
          ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
          ctx.fill();
          ctx.strokeStyle = '#ff00ff';
          ctx.lineWidth = 3;
        } else if (isHovered) {
          ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
          ctx.fill();
          ctx.strokeStyle = '#ff00ff';
          ctx.lineWidth = 2;
        } else {
          ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }
      
      // Draw label
      ctx.fillStyle = isHovered || isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      ctx.font = isHovered || isSelected ? 'bold 12px Space Grotesk' : '10px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + 35);
    });
    
    // Restore context state
    ctx.restore();
  };
  
  // Animation loop
  let animationId: number;
  const animate = () => {
    draw();
    animationId = requestAnimationFrame(animate);
  };
  
  // Handle resize
  const handleResize = () => {
    if (containerRef) {
      const rect = containerRef.getBoundingClientRect();
      const width = Math.max(rect.width, 100);
      const height = Math.max(rect.height, 100);
      setDimensions({ width, height });
      if (canvasRef) {
        canvasRef.width = width;
        canvasRef.height = height;
      }
    }
  };
  
  // Handle mouse events
  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef) return;
    
    const rect = canvasRef.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset().x) / zoomLevel();
    const y = (e.clientY - rect.top - panOffset().y) / zoomLevel();
    
    // Find hovered node
    const node = networkData().nodes.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 30;
    });
    
    setHoveredNode(node || null);
    canvasRef.style.cursor = node ? 'pointer' : 'default';
  };
  
  const handleClick = (e: MouseEvent) => {
    if (hoveredNode()) {
      setSelectedNode(hoveredNode());
    }
  };
  
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(2, prev * delta)));
  };
  
  onMount(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Generate network data after dimensions are set
    setTimeout(() => {
      const data = generateNetworkData();
      setNetworkData(data);
      initParticles();
      setIsLoading(false);
    }, 100);
    
    // Start animation
    animate();
  });
  
  onCleanup(() => {
    window.removeEventListener('resize', handleResize);
    if (animationId) cancelAnimationFrame(animationId);
  });
  
  return (
    <div ref={containerRef!} class="relative w-full h-full min-h-[400px] bg-black/50 rounded-xl overflow-hidden border border-cyan-400/20">
      {/* Loading overlay */}
      <Show when={isLoading()}>
        <div class="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div class="text-center">
            <div class="mb-4">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
            </div>
            <p class="text-cyan-400 font-mono animate-pulse">INITIALIZING NETWORK MATRIX...</p>
          </div>
        </div>
      </Show>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef!}
        class="block w-full h-full"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onWheel={handleWheel}
      />
      
      {/* Controls */}
      <div class="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setZoomLevel(prev => Math.min(2, prev * 1.2))}
          class="w-10 h-10 bg-black/60 border border-cyan-400/30 rounded-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 transition-all"
        >
          <i class="fas fa-plus"></i>
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(0.5, prev * 0.8))}
          class="w-10 h-10 bg-black/60 border border-cyan-400/30 rounded-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 transition-all"
        >
          <i class="fas fa-minus"></i>
        </button>
        <button
          onClick={() => {
            setZoomLevel(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          class="w-10 h-10 bg-black/60 border border-cyan-400/30 rounded-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 transition-all"
        >
          <i class="fas fa-compress"></i>
        </button>
      </div>
      
      {/* Node info tooltip */}
      <Show when={selectedNode()}>
        <div class="absolute bottom-4 left-4 bg-black/80 border border-cyan-400/30 rounded-lg p-4 max-w-xs z-10">
          <div class="flex items-start gap-3">
            {selectedNode()!.type === 'user' ? (
              <>
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
                  <i class="fas fa-user text-white"></i>
                </div>
                <div class="flex-1">
                  <h4 class="text-cyan-400 font-bold">{selectedNode()!.label}</h4>
                  <p class="text-cyan-300/70 text-sm mb-2">Music Curator</p>
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between">
                      <span class="text-gray-400">Connections:</span>
                      <span class="text-cyan-400 font-mono">{selectedNode()!.connections}</span>
                    </div>
                    {selectedNode()!.influence && (
                      <div class="flex justify-between">
                        <span class="text-gray-400">Influence:</span>
                        <span class="text-green-400 font-mono">{selectedNode()!.influence}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <i class="fas fa-music text-white"></i>
                </div>
                <div class="flex-1">
                  <h4 class="text-purple-400 font-bold">{selectedNode()!.label}</h4>
                  <p class="text-purple-300/70 text-sm mb-2">{selectedNode()!.artist}</p>
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between">
                      <span class="text-gray-400">Shares:</span>
                      <span class="text-purple-400 font-mono">{selectedNode()!.connections}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Show>
    </div>
  );
};

export default NetworkGraph;
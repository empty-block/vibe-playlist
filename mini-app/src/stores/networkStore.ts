import { createSignal, createRoot } from 'solid-js';

export interface NetworkNode {
  id: string;
  type: 'user' | 'track';
  label: string;
  connections: number;
  influence?: number;
  avatar?: string;
  artist?: string;
  cover?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: 'share' | 'like' | 'reply';
  strength: number;
}

export interface NetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface NetworkStats {
  connectedUsers: number;
  sharedTracks: number;
  networkReach: number;
  influenceScore: number;
  tasteMatch: number;
}

const createNetworkStore = () => {
  const [selectedNetwork, setSelectedNetwork] = createSignal<string>('personal');
  const [networkData, setNetworkData] = createSignal<NetworkData | null>(null);
  const [networkStats, setNetworkStats] = createSignal<NetworkStats | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  
  // Fetch network data based on selected network type
  const fetchNetworkData = async (networkType: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock data based on network type
      const mockData = generateMockNetworkData(networkType);
      setNetworkData(mockData);
      
      // Generate mock stats
      const mockStats = generateMockNetworkStats(networkType);
      setNetworkStats(mockStats);
    } catch (err) {
      setError('Failed to load network data');
      console.error('Network data error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate mock network data
  const generateMockNetworkData = (networkType: string): NetworkData => {
    const nodeCount = networkType === 'personal' ? 20 : 
                     networkType === 'extended' ? 50 : 
                     100;
    
    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];
    
    // Generate nodes
    for (let i = 0; i < nodeCount; i++) {
      const isTrack = Math.random() > 0.6;
      nodes.push({
        id: `${isTrack ? 'track' : 'user'}-${i}`,
        type: isTrack ? 'track' : 'user',
        label: isTrack ? `Track ${i}` : `User ${i}`,
        connections: Math.floor(Math.random() * 20) + 1,
        influence: !isTrack ? Math.floor(Math.random() * 100) : undefined,
        avatar: !isTrack ? '/api/placeholder/40/40' : undefined,
        artist: isTrack ? `Artist ${Math.floor(Math.random() * 10)}` : undefined,
        cover: isTrack ? '/api/placeholder/40/40' : undefined
      });
    }
    
    // Generate edges
    const edgeCount = Math.floor(nodeCount * 1.5);
    const edgeTypes: NetworkEdge['type'][] = ['share', 'like', 'reply'];
    
    for (let i = 0; i < edgeCount; i++) {
      const sourceIndex = Math.floor(Math.random() * nodeCount);
      const targetIndex = Math.floor(Math.random() * nodeCount);
      
      if (sourceIndex !== targetIndex) {
        edges.push({
          source: nodes[sourceIndex].id,
          target: nodes[targetIndex].id,
          type: edgeTypes[Math.floor(Math.random() * 3)],
          strength: Math.random() * 0.8 + 0.2
        });
      }
    }
    
    return { nodes, edges };
  };
  
  // Generate mock network stats
  const generateMockNetworkStats = (networkType: string): NetworkStats => {
    const multiplier = networkType === 'personal' ? 1 : 
                      networkType === 'extended' ? 10 : 
                      100;
    
    return {
      connectedUsers: Math.floor(147 * multiplier),
      sharedTracks: Math.floor(2800 * multiplier),
      networkReach: Math.floor(48300 * multiplier),
      influenceScore: Math.floor(87 - (multiplier - 1) * 2),
      tasteMatch: Math.floor(92 - (multiplier - 1) * 3)
    };
  };
  
  // Initialize with personal network
  fetchNetworkData('personal');
  
  return {
    selectedNetwork,
    setSelectedNetwork,
    networkData,
    networkStats,
    isLoading,
    error,
    fetchNetworkData
  };
};

export const {
  selectedNetwork,
  setSelectedNetwork,
  networkData,
  networkStats,
  isLoading,
  error,
  fetchNetworkData
} = createRoot(createNetworkStore);
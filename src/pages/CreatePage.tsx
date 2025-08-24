import { Component, onMount, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { pageEnter } from '../utils/animations';
import CreateCanvas from '../components/playlist/CreateCanvas';
import { creationStore } from '../stores/creationStore';

export type PlaylistType = 'personal' | 'collaborative' | 'ai_curated';

const CreatePage: Component = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = createSignal(false);
  const [createdPlaylist, setCreatedPlaylist] = createSignal(null);

  let pageRef: HTMLDivElement;

  onMount(() => {
    // Add page animations
    if (pageRef) {
      pageEnter(pageRef);
    }

    // Reset creation store when entering the page
    creationStore.reset();
  });

  const handlePlaylistComplete = (playlist: any) => {
    console.log('Playlist created:', playlist);
    setCreatedPlaylist(playlist);
    setShowSuccessModal(true);
    
    // Show success animation
    setTimeout(() => {
      // In a real app, this would integrate with Farcaster to post the thread
      alert(`🎵 Playlist "${playlist.title}" created successfully!\n\nIn the full app, this would post to Farcaster as a thread.`);
      
      // Navigate back to home or to the new playlist
      navigate('/');
    }, 2000);
  };
  return (
    <div ref={pageRef!} class="h-screen w-full bg-black">
      <CreateCanvas onComplete={handlePlaylistComplete} />
    </div>
  );
};

export default CreatePage;
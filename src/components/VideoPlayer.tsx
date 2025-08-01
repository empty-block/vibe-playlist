import { Component, Show, onMount, onCleanup, createEffect } from 'solid-js'
import { Song } from '../types'

interface VideoPlayerProps {
  song?: Song
  isPlaying: boolean
  onEnded: () => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

const VideoPlayer: Component<VideoPlayerProps> = (props) => {
  let player: any
  let playerContainer: HTMLDivElement
  
  onMount(() => {
    // Load YouTube API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)
    
    window.onYouTubeIframeAPIReady = () => {
      player = new window.YT.Player(playerContainer, {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          showinfo: 0,
          modestbranding: 1
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              props.onEnded()
            }
          }
        }
      })
    }
  })
  
  createEffect(() => {
    if (player && props.song) {
      player.loadVideoById(props.song.video_id)
    }
  })
  
  createEffect(() => {
    if (player && player.getPlayerState) {
      if (props.isPlaying) {
        player.playVideo()
      } else {
        player.pauseVideo()
      }
    }
  })
  
  onCleanup(() => {
    if (player) {
      player.destroy()
    }
  })
  
  return (
    <div class="flex-1 bg-black flex flex-col">
      <div class="flex-1 relative">
        <div ref={playerContainer!} class="w-full h-full" />
        
        <Show when={!props.song}>
          <div class="absolute inset-0 flex items-center justify-center text-white/50">
            <div class="text-center">
              <i class="fas fa-play-circle text-6xl mb-4"></i>
              <p class="text-lg">Select a song to start playing</p>
            </div>
          </div>
        </Show>
      </div>
      
      <Show when={props.song}>
        <div class="bg-black/50 p-4 border-t border-white/10">
          <h3 class="text-white font-bold mb-2">Now Playing</h3>
          <div class="flex items-center gap-4">
            <img 
              src={props.song!.thumbnail} 
              alt={props.song!.title}
              class="w-16 h-12 rounded object-cover"
            />
            <div>
              <div class="text-white font-semibold">{props.song!.title}</div>
              <div class="text-white/70 text-sm">{props.song!.artist}</div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default VideoPlayer
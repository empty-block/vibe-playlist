export interface Song {
  id: string
  title: string
  artist: string
  duration: string
  video_id: string
  thumbnail: string
  added_by: string
  position: number
}

export interface User {
  id: string
  username: string
  color: string
}

export interface PlaylistState {
  id: string
  name: string
  songs: Song[]
  users: User[]
  currentSong: string | null
  isPlaying: boolean
}
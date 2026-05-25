import { createSlice } from '@reduxjs/toolkit'

const playerSlice = createSlice({
  name: 'player',
  initialState: {
    currentSong: null,
    isPlaying: false,
    volume: 0.7,
    progress: 0,
    duration: 0,
    queue: [],
    repeat: false,
    shuffle: false,
  },
  reducers: {
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload
      state.isPlaying = true
      state.progress = 0
    },
    play: (state) => {
      state.isPlaying = true
    },
    pause: (state) => {
      state.isPlaying = false
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying
    },
    setVolume: (state, action) => {
      state.volume = action.payload
    },
    setProgress: (state, action) => {
      state.progress = action.payload
    },
    setDuration: (state, action) => {
      state.duration = action.payload
    },
    addToQueue: (state, action) => {
      state.queue.push(action.payload)
    },
    clearQueue: (state) => {
      state.queue = []
    },
    nextSong: (state) => {
      if (state.queue.length > 0) {
        state.currentSong = state.queue.shift()
        state.progress = 0
        state.isPlaying = true
      }
    },
  },
})

export const {
  setCurrentSong,
  play,
  pause,
  togglePlay,
  setVolume,
  setProgress,
  setDuration,
  addToQueue,
  clearQueue,
  nextSong,
} = playerSlice.actions

export default playerSlice.reducer
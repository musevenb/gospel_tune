import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../api/apiClient'
import toast from 'react-hot-toast'

export const fetchSongs = createAsyncThunk('songs/fetchSongs', async () => {
  const response = await apiClient.get('/songs')
  return response.data
})

export const fetchSongById = createAsyncThunk('songs/fetchSongById', async (id) => {
  const response = await apiClient.get(`/songs/${id}`)
  return response.data
})

export const fetchUserSongs = createAsyncThunk('songs/fetchUserSongs', async () => {
  const response = await apiClient.get('/users/my-songs')
  return response.data
})

export const createSong = createAsyncThunk('songs/createSong', async (songData) => {
  const response = await apiClient.post('/songs', songData)
  toast.success('Song uploaded! Waiting for admin approval 🙏')
  return response.data
})

export const createSongWithAudio = createAsyncThunk('songs/createSongWithAudio', async (formData) => {
  const response = await apiClient.post('/songs/with-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  toast.success('Song uploaded! Waiting for admin approval 🙏')
  return response.data
})

export const updateSong = createAsyncThunk('songs/updateSong', async ({ id, data }) => {
  const response = await apiClient.put(`/songs/${id}`, data)
  toast.success('Song updated successfully!')
  return response.data
})

export const deleteSong = createAsyncThunk('songs/deleteSong', async (id) => {
  await apiClient.delete(`/songs/${id}`)
  toast.success('Song deleted successfully')
  return id
})

export const likeSong = createAsyncThunk('songs/likeSong', async (id) => {
  const response = await apiClient.post(`/users/save-song/${id}`)
  return { id, liked: response.data.saved, likes: response.data.likes }
})

export const shareSong = createAsyncThunk('songs/shareSong', async (id) => {
  const response = await apiClient.post(`/songs/${id}/share`)
  toast.success('Song shared! 🎵')
  return { id, shares: response.data.shares }
})

export const addSubtitle = createAsyncThunk('songs/addSubtitle', async ({ id, subtitleData }) => {
  const response = await apiClient.post(`/songs/${id}/subtitles`, subtitleData)
  toast.success('Subtitle added! Waiting for approval')
  return response.data
})

const songSlice = createSlice({
  name: 'songs',
  initialState: {
    songs: [],
    userSongs: [],
    currentSong: null,
    isLoading: false,
    error: null,
    searchResults: [],
  },
  reducers: {
    setSearchResults: (state, action) => {
      state.searchResults = action.payload
    },
    clearSearch: (state) => {
      state.searchResults = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSongs.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchSongs.fulfilled, (state, action) => {
        state.isLoading = false
        state.songs = action.payload.songs
      })
      .addCase(fetchSongs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
      })
      .addCase(fetchSongById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchSongById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentSong = action.payload
      })
      .addCase(fetchUserSongs.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchUserSongs.fulfilled, (state, action) => {
        state.isLoading = false
        state.userSongs = action.payload
      })
      .addCase(fetchUserSongs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
      })
      .addCase(createSong.fulfilled, (state, action) => {
        state.songs.unshift(action.payload)
        state.userSongs.unshift(action.payload)
      })
      .addCase(createSongWithAudio.fulfilled, (state, action) => {
        state.songs.unshift(action.payload)
        state.userSongs.unshift(action.payload)
      })
      .addCase(deleteSong.fulfilled, (state, action) => {
        state.songs = state.songs.filter(song => song._id !== action.payload)
        state.userSongs = state.userSongs.filter(song => song._id !== action.payload)
      })
      .addCase(updateSong.fulfilled, (state, action) => {
        const index = state.userSongs.findIndex(song => song._id === action.payload._id)
        if (index !== -1) {
          state.userSongs[index] = action.payload
        }
        const songIndex = state.songs.findIndex(song => song._id === action.payload._id)
        if (songIndex !== -1) {
          state.songs[songIndex] = action.payload
        }
      })
      .addCase(likeSong.fulfilled, (state, action) => {
        const song = state.songs.find(s => s._id === action.payload.id)
        if (song) {
          if (song.stats) {
            song.stats.likes = action.payload.likes
          } else {
            song.stats = { likes: action.payload.likes }
          }
        }
        const userSong = state.userSongs.find(s => s._id === action.payload.id)
        if (userSong) {
          if (userSong.stats) {
            userSong.stats.likes = action.payload.likes
          } else {
            userSong.stats = { likes: action.payload.likes }
          }
        }
      })
      .addCase(shareSong.fulfilled, (state, action) => {
        const song = state.songs.find(s => s._id === action.payload.id)
        if (song && song.stats) {
          song.stats.shares = action.payload.shares
        }
      })
  },
})

export const { setSearchResults, clearSearch } = songSlice.actions
export default songSlice.reducer
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../api/apiClient'
import toast from 'react-hot-toast'

export const register = createAsyncThunk('auth/register', async (userData) => {
  const response = await apiClient.post('/auth/register', userData)
  if (response.data.token) {
    localStorage.setItem('token', response.data.token)
  }
  toast.success('Registration successful! Welcome to Gospel Tune 🙏')
  return response.data
})

export const login = createAsyncThunk('auth/login', async (userData) => {
  const response = await apiClient.post('/auth/login', userData)
  if (response.data.token) {
    localStorage.setItem('token', response.data.token)
  }
  toast.success(`Welcome back ${response.data.username}! 🎵`)
  return response.data
})

export const fetchUserProfile = createAsyncThunk('auth/fetchProfile', async () => {
  const response = await apiClient.get('/users/profile')
  return response.data
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData) => {
  const response = await apiClient.put('/users/profile', userData)
  toast.success('Profile updated successfully!')
  return response.data
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token')
      state.user = null
      state.token = null
      toast.success('Logged out successfully')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.token = action.payload.token
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
        toast.error(action.error.message)
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
        toast.error('Invalid email or password')
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload }
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload }
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
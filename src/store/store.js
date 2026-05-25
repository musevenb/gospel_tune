import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import songReducer from './slices/songSlice'
import playerReducer from './slices/playerSlice'
import commentReducer from './slices/commentSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    songs: songReducer,
    player: playerReducer,
    comments: commentReducer,
    notifications: notificationReducer,
  },
})
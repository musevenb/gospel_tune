import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../api/apiClient'

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const response = await apiClient.get('/notifications')
  return response.data
})

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (id) => {
  const response = await apiClient.put(`/notifications/${id}/read`)
  return response.data
})

export const markAllAsRead = createAsyncThunk('notifications/markAllAsRead', async () => {
  await apiClient.put('/notifications/read-all')
  return null
})

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload._id)
        if (index !== -1) {
          state.notifications[index].isRead = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.isRead = true)
        state.unreadCount = 0
      })
  },
})

export default notificationSlice.reducer
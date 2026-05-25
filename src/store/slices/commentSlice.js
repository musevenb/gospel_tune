import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../api/apiClient'
import toast from 'react-hot-toast'

export const fetchComments = createAsyncThunk('comments/fetchComments', async (songId) => {
  const response = await apiClient.get(`/comments/${songId}`)
  return response.data.comments
})

export const addComment = createAsyncThunk('comments/addComment', async ({ songId, text }) => {
  const response = await apiClient.post(`/comments/${songId}`, { text })
  toast.success('Comment added!')
  return response.data
})

export const likeComment = createAsyncThunk('comments/likeComment', async (commentId) => {
  const response = await apiClient.post(`/comments/${commentId}/like`)
  return { commentId, liked: response.data.liked, likeCount: response.data.likeCount }
})

export const replyToComment = createAsyncThunk('comments/replyToComment', async ({ commentId, text }) => {
  const response = await apiClient.post(`/comments/${commentId}/reply`, { text })
  toast.success('Reply added!')
  return response.data
})

const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false
        state.comments = action.payload
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.unshift(action.payload)
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        const comment = state.comments.find(c => c._id === action.payload.commentId)
        if (comment) {
          comment.likeCount = action.payload.likeCount
        }
      })
      .addCase(replyToComment.fulfilled, (state, action) => {
        const index = state.comments.findIndex(c => c._id === action.payload._id)
        if (index !== -1) {
          state.comments[index] = action.payload
        }
      })
  },
})

export default commentSlice.reducer
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchComments, addComment, likeComment, replyToComment } from '../../store/slices/commentSlice'

const CommentSection = ({ songId }) => {
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const { comments, isLoading } = useSelector((state) => state.comments)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchComments(songId))
  }, [dispatch, songId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    await dispatch(addComment({ songId, text: newComment }))
    setNewComment('')
  }

  const handleLike = async (commentId) => {
    await dispatch(likeComment(commentId))
  }

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return
    await dispatch(replyToComment({ commentId, text: replyText }))
    setReplyTo(null)
    setReplyText('')
  }

  return (
    <div className="max-w-2xl mx-auto">
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this song..."
            className="input-field w-full"
            rows="3"
          ></textarea>
          <button type="submit" className="btn-primary mt-2">
            Post Comment
          </button>
        </form>
      ) : (
        <div className="bg-white/10 rounded-lg p-4 text-center mb-8">
          <p>Login to share your thoughts about this song 🙏</p>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-400">No comments yet. Be the first to share!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gospel-gold">
                  🙏 {comment.username || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-200 mb-2">{comment.text}</p>
              <div className="flex items-center space-x-4 text-sm">
                <button 
                  onClick={() => handleLike(comment._id)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  ❤️ {comment.likeCount || 0}
                </button>
                {user && (
                  <button 
                    onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                    className="text-gray-400 hover:text-gospel-gold transition"
                  >
                    💬 Reply
                  </button>
                )}
              </div>
              
              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 mt-3 space-y-2 border-l-2 border-white/10 pl-4">
                  {comment.replies.map((reply, idx) => (
                    <div key={idx} className="bg-white/5 rounded p-2">
                      <span className="font-semibold text-gospel-gold text-sm">🙏 {reply.username}</span>
                      <p className="text-gray-300 text-sm">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Reply form */}
              {replyTo === comment._id && (
                <div className="mt-3 ml-8">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="input-field text-sm"
                    rows="2"
                  ></textarea>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleReply(comment._id)} className="btn-primary text-sm py-1 px-3">
                      Reply
                    </button>
                    <button onClick={() => setReplyTo(null)} className="btn-secondary text-sm py-1 px-3">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSection
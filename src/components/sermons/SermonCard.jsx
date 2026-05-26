import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartIcon, ShareIcon, PlayIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

const SermonCard = ({ sermon, isLiked = false }) => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    if (sermon?._id) {
      navigate(`/player/sermon/${sermon._id}`)
    }
  }

  const handleLike = (e) => {
    e.stopPropagation()
    if (sermon?._id) {
      console.log('Like sermon:', sermon._id)
      // Add your like API call here
    }
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    const shareUrl = window.location.origin + `/player/sermon/${sermon?._id}`
    const shareTitle = sermon?.title || 'Sermon'
    const shareText = `Listen to "${shareTitle}" by ${sermon?.preacher || 'Gospel Tune'} on Gospel Tune`
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (!sermon) {
    return null
  }

  const isPending = sermon.status === 'pending'
  const isRejected = sermon.status === 'rejected'

  const typeIcon = {
    sermon: '🙏',
    documentary: '🎬',
    song_history: '🎵',
    bible_study: '✝️',
    testimony: '💝'
  }

  return (
    <div 
      className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden hover:scale-105 transition transform duration-300 cursor-pointer group" 
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={sermon.thumbnail || 'https://via.placeholder.com/300x200?text=Sermon'}
          alt={sermon.title || 'Sermon'}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Sermon'
          }}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <PlayIcon className="h-16 w-16 text-white drop-shadow-lg" />
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-black/70 text-xs px-2 py-1 rounded-full">
            {typeIcon[sermon.type] || '📖'} {sermon.type?.replace('_', ' ') || 'Sermon'}
          </span>
        </div>
        {isPending && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-xs px-2 py-1 rounded-full">
            ⏳ Pending
          </div>
        )}
        {isRejected && (
          <div className="absolute top-2 left-2 bg-red-500 text-xs px-2 py-1 rounded-full">
            ❌ Rejected
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{sermon.title || 'Untitled'}</h3>
        <p className="text-gospel-gold text-sm mb-2">by {sermon.preacher || 'Unknown'}</p>
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{sermon.description || 'No description available'}</p>
        
        {sermon.songId && (
          <div className="mb-3 p-2 bg-gospel-purple/20 rounded-lg">
            <p className="text-xs text-gospel-gold">Related Song:</p>
            <p className="text-sm font-semibold">
              {typeof sermon.songId === 'object' ? sermon.songId.title : sermon.songId}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-sm">
            <span className="flex items-center gap-1 text-gray-400">
              👁️ {sermon.stats?.views || 0}
            </span>
            <button 
              onClick={handleLike}
              className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition"
            >
              {isLiked ? <HeartSolid className="h-4 w-4 text-red-500" /> : <HeartIcon className="h-4 w-4" />}
              {sermon.stats?.likes || 0}
            </button>
          </div>
          <button 
            onClick={handleShare}
            className="text-gray-400 hover:text-gospel-gold transition"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SermonCard

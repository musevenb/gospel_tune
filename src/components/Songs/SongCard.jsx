import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCurrentSong, play } from '../../store/slices/playerSlice'
import { PlayIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { likeSong, shareSong } from '../../store/slices/songSlice'
import toast from 'react-hot-toast'

const SongCard = ({ song, isLiked = false }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handlePlay = (e) => {
    e.stopPropagation()
    dispatch(setCurrentSong(song))
    dispatch(play())
    toast.success(`Now playing: ${song.title}`)
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    await dispatch(likeSong(song._id))
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    await dispatch(shareSong(song._id))
    const shareUrl = `${window.location.origin}/player/song/${song._id}`
    
    if (navigator.share) {
      navigator.share({
        title: song.title,
        text: `Listen to ${song.title} by ${song.artist} on Gospel Tune`,
        url: shareUrl
      }).catch(() => {
        // User cancelled share
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleCardClick = () => {
    navigate(`/player/song/${song._id}`)
  }

  const isPending = song.status === 'pending'
  const isRejected = song.status === 'rejected'
  const isFeatured = song.status === 'featured'

  return (
    <div className="song-card group relative cursor-pointer" onClick={handleCardClick}>
      {/* Status Badges */}
      {isFeatured && (
        <div className="absolute top-2 right-2 bg-gospel-gold text-gospel-dark text-xs px-2 py-1 rounded-full z-10 font-semibold">
          ⭐ Featured
        </div>
      )}
      {isPending && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full z-10">
          ⏳ Pending
        </div>
      )}
      {isRejected && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
          ❌ Rejected
        </div>
      )}
      
      {/* Song Image with Play Overlay */}
      <div className="relative">
        <img
          src={song.albumArt || 'https://via.placeholder.com/300x300?text=Gospel+Song'}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-lg mb-3"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=Gospel+Song'
          }}
        />
        <button
          onClick={handlePlay}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-lg"
        >
          <PlayIcon className="h-16 w-16 text-white drop-shadow-lg transform scale-90 group-hover:scale-110 transition-transform duration-300" />
        </button>
      </div>
      
      {/* Song Info */}
      <h3 className="font-semibold text-lg truncate" title={song.title}>{song.title}</h3>
      <p className="text-gray-300 text-sm truncate" title={song.artist}>{song.artist}</p>
      
      {/* Genre and Actions */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs bg-gospel-purple/30 px-2 py-1 rounded-full">
          {song.genre}
        </span>
        <div className="flex space-x-2">
          <button 
            onClick={handleLike} 
            className="hover:scale-110 transition-transform"
            aria-label="Like song"
          >
            {isLiked ? (
              <HeartSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 hover:text-red-500 transition-colors" />
            )}
          </button>
          <button 
            onClick={handleShare} 
            className="hover:text-gospel-gold transition-colors hover:scale-110 transition-transform"
            aria-label="Share song"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>❤️ {song.stats?.likes || 0}</span>
        <span>👀 {song.stats?.plays || 0}</span>
        <span>🔄 {song.stats?.shares || 0}</span>
      </div>
    </div>
  )
}

export default SongCard
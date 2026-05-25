import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../store/api/apiClient'
import { HeartIcon, ShareIcon, PlayIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

const SermonDetailPage = () => {
  const { id } = useParams()
  const [sermon, setSermon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    fetchSermon()
  }, [id])

  const fetchSermon = async () => {
    try {
      const response = await apiClient.get(`/sermons/${id}`)
      setSermon(response.data)
    } catch (error) {
      console.error('Error fetching sermon:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      await apiClient.post(`/sermons/${id}/like`)
      setLiked(true)
      setSermon({
        ...sermon,
        stats: { ...sermon.stats, likes: sermon.stats.likes + 1 }
      })
    } catch (error) {
      console.error('Error liking sermon:', error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: sermon.title,
        text: `Check out this sermon: ${sermon.title} by ${sermon.preacher}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gospel-gold"></div>
      </div>
    )
  }

  if (!sermon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Sermon not found</p>
      </div>
    )
  }

  const typeIcons = {
    sermon: '🙏',
    documentary: '🎬',
    song_history: '🎵',
    bible_study: '✝️',
    testimony: '💝'
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{typeIcons[sermon.type]}</span>
            <span className="bg-gospel-purple/30 px-3 py-1 rounded-full text-sm">
              {sermon.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{sermon.title}</h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <img
                src={sermon.preacherId?.profilePicture || `https://ui-avatars.com/api/?name=${sermon.preacher}&background=6B46C1&color=fff`}
                alt={sermon.preacher}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold">{sermon.preacher}</p>
                <p className="text-sm text-gray-400">{new Date(sermon.publishedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
              >
                {liked ? <HeartSolid className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
                {sermon.stats?.likes || 0}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
              >
                <ShareIcon className="h-5 w-5" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail/Video */}
        {(sermon.videoUrl || sermon.audioUrl) && (
          <div className="mb-8 rounded-xl overflow-hidden">
            {sermon.videoUrl ? (
              <iframe
                src={sermon.videoUrl}
                title={sermon.title}
                className="w-full aspect-video"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="bg-black/50 p-8 text-center">
                <PlayIcon className="h-16 w-16 text-gospel-gold mx-auto mb-2" />
                <audio controls className="w-full">
                  <source src={sermon.audioUrl} />
                </audio>
              </div>
            )}
          </div>
        )}

        {/* Scripture References */}
        {sermon.scriptureReferences && sermon.scriptureReferences.length > 0 && (
          <div className="mb-8 bg-gospel-purple/20 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <BookmarkIcon className="h-5 w-5" />
              Scripture References
            </h3>
            <div className="space-y-2">
              {sermon.scriptureReferences.map((ref, idx) => (
                <div key={idx} className="border-l-2 border-gospel-gold pl-4">
                  <p className="font-semibold">{ref.book} {ref.chapter}:{ref.verse}</p>
                  <p className="text-gray-300 italic">"{ref.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {sermon.content}
          </div>
        </div>

        {/* Related Song */}
        {sermon.songId && (
          <div className="mt-8 p-6 bg-white/5 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">Related Song</h3>
            <Link to={`/song/${sermon.songId._id}`} className="flex items-center gap-4 hover:bg-white/10 p-3 rounded-lg transition">
              <img
                src={sermon.songId.albumArt || 'https://via.placeholder.com/60x60'}
                alt={sermon.songId.title}
                className="w-12 h-12 rounded"
              />
              <div>
                <p className="font-semibold">{sermon.songId.title}</p>
                <p className="text-sm text-gray-400">{sermon.songId.artist}</p>
              </div>
              <PlayIcon className="h-5 w-5 ml-auto text-gospel-gold" />
            </Link>
          </div>
        )}

        {/* Tags */}
        {sermon.tags && sermon.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {sermon.tags.map((tag, idx) => (
              <span key={idx} className="bg-white/10 px-3 py-1 rounded-full text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SermonDetailPage
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSongById } from '../store/slices/songSlice'
import { setCurrentSong, play } from '../store/slices/playerSlice'
import { fetchComments } from '../store/slices/commentSlice'
import LyricsDisplay from '../components/Songs/LyricsDisplay'
import CommentSection from '../components/Comments/CommentSection'
import LoadingSpinner from '../components/Common/LoadingSpinner'

const SongPlayerPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentSong, isLoading } = useSelector((state) => state.songs)
  const [activeTab, setActiveTab] = useState('lyrics')
  const [documentary, setDocumentary] = useState(null)

  useEffect(() => {
    if (id) {
      dispatch(fetchSongById(id))
      dispatch(fetchComments(id))
      fetchDocumentary()
    }
  }, [dispatch, id])

  const fetchDocumentary = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/documentary/${id}`)
      if (response.ok) {
        const data = await response.json()
        setDocumentary(data)
      }
    } catch (error) {
      console.log('No documentary yet')
    }
  }

  const handlePlayNow = () => {
    if (currentSong) {
      console.log('Playing song:', currentSong)
      dispatch(setCurrentSong(currentSong))
      dispatch(play())
    }
  }

  if (isLoading || !currentSong) return <LoadingSpinner />

  // Determine if it's a YouTube source
  const isYouTube = currentSong.audioUrl?.includes('youtube.com') || 
                    currentSong.audioUrl?.includes('youtu.be') ||
                    currentSong.sourceType === 'youtube'

  return (
    <div className="min-h-screen pb-32 pt-8">
      <div className="container mx-auto px-6">
        {/* Song Hero */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <img
            src={currentSong.albumArt || 'https://via.placeholder.com/300x300?text=Gospel+Song'}
            alt={currentSong.title}
            className="w-64 h-64 rounded-2xl shadow-2xl mx-auto md:mx-0 object-cover"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{currentSong.title}</h1>
            <p className="text-xl text-gospel-gold mb-4">{currentSong.artist}</p>
            <p className="text-gray-300 mb-2">{currentSong.album} • {currentSong.genre}</p>
            {isYouTube && (
              <p className="text-sm text-red-400 mb-4">📺 YouTube Source</p>
            )}
            <button onClick={handlePlayNow} className="btn-primary text-lg px-8 py-3">
              ▶ Play Now
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/20 mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`pb-3 px-1 transition ${
                activeTab === 'lyrics'
                  ? 'border-b-2 border-gospel-gold text-gospel-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📝 Lyrics
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 px-1 transition ${
                activeTab === 'comments'
                  ? 'border-b-2 border-gospel-gold text-gospel-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💬 Comments
            </button>
            <button
              onClick={() => setActiveTab('documentary')}
              className={`pb-3 px-1 transition ${
                activeTab === 'documentary'
                  ? 'border-b-2 border-gospel-gold text-gospel-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📖 The Story Behind
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-black/30 rounded-2xl p-6 min-h-[400px]">
          {activeTab === 'lyrics' && (
            <LyricsDisplay lyrics={currentSong.parsedLyrics || []} />
          )}
          {activeTab === 'comments' && <CommentSection songId={id} />}
          {activeTab === 'documentary' && (
            <div className="max-w-3xl mx-auto">
              {documentary ? (
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-gospel-gold">{documentary.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{documentary.historicalBackground}</p>
                  {documentary.sermonNotes && (
                    <div className="mt-6">
                      <h4 className="text-xl font-semibold mb-2">Sermon Notes</h4>
                      <p className="text-gray-300">{documentary.sermonNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400">No documentary available for this song yet</p>
                  <p className="text-sm mt-2">Check back later for the story behind this song!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SongPlayerPage
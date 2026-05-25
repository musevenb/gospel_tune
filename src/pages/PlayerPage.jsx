import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ReactPlayer from 'react-player'
import apiClient from '../store/api/apiClient'
import { setVolume } from '../store/slices/playerSlice'
import toast from 'react-hot-toast'
import { 
  PlayIcon, PauseIcon, ForwardIcon, BackwardIcon,
  SpeakerWaveIcon, SpeakerXMarkIcon, HeartIcon, 
  ShareIcon, ArrowsPointingOutIcon, ChatBubbleLeftRightIcon, 
  MusicalNoteIcon, XMarkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

const PlayerPage = () => {
  const { id, type } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { volume } = useSelector((state) => state.player)
  
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDurationState] = useState(0)
  const [activeLine, setActiveLine] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const [showLyrics, setShowLyrics] = useState(true)
  const [parsedLyrics, setParsedLyrics] = useState([])
  const [audioError, setAudioError] = useState(false)
  const [audioLoading, setAudioLoading] = useState(true)
  
  const playerRef = useRef(null)
  const audioRef = useRef(null)
  const lyricsRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (id && type) {
      fetchContent()
    }
  }, [id, type])

  const fetchContent = async () => {
    try {
      setLoading(true)
      let response
      if (type === 'song') {
        response = await apiClient.get(`/songs/${id}`)
        setContent(response.data)
        console.log('Song data loaded:', response.data)
        
        // Parse LRC lyrics
        if (response.data.lyrics) {
          parseLyrics(response.data.lyrics)
        } else {
          // Show message if no lyrics
          setParsedLyrics([])
        }
      } else if (type === 'sermon') {
        response = await apiClient.get(`/sermons/${id}`)
        setContent(response.data)
      }
      
      // Fetch comments
      try {
        const commentsRes = await apiClient.get(`/comments/${id}`)
        setComments(commentsRes.data.comments || [])
      } catch (error) {
        console.log('No comments yet')
      }
      
    } catch (error) {
      console.error('Error fetching content:', error)
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  // Parse LRC lyrics - FIXED VERSION
  const parseLyrics = (lrcContent) => {
    if (!lrcContent || lrcContent.trim() === '') {
      setParsedLyrics([])
      return
    }
    
    const lines = lrcContent.split('\n')
    const parsed = []
    // Match [00:12.00] or [00:12.000] or [00:12:00]
    const timeRegex = /\[(\d{2}):(\d{2})(?:[.:](\d{2,3}))?\]/
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue
      
      const match = trimmedLine.match(timeRegex)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const milliseconds = match[3] ? parseInt(match[3]) / (match[3].length === 2 ? 100 : 1000) : 0
        const timeInSeconds = (minutes * 60) + seconds + milliseconds
        const text = trimmedLine.replace(timeRegex, '').trim()
        
        if (text) {
          parsed.push({ time: timeInSeconds, text })
        }
      } else if (!trimmedLine.startsWith('[')) {
        // Plain text line without timestamp
        parsed.push({ time: null, text: trimmedLine })
      }
    }
    
    console.log('Parsed lyrics count:', parsed.length)
    setParsedLyrics(parsed)
  }

  // Update active lyric line based on current time
  useEffect(() => {
    if (parsedLyrics.length > 0 && currentTime > 0) {
      let activeIndex = -1
      for (let i = 0; i < parsedLyrics.length; i++) {
        if (parsedLyrics[i].time !== null && parsedLyrics[i].time <= currentTime) {
          activeIndex = i
        } else if (parsedLyrics[i].time !== null && parsedLyrics[i].time > currentTime) {
          break
        }
      }
      
      if (activeIndex !== -1 && activeIndex !== activeLine) {
        setActiveLine(activeIndex)
        // Auto-scroll to active lyric
        setTimeout(() => {
          if (lyricsRef.current) {
            const activeElement = lyricsRef.current.children[activeIndex]
            activeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      }
    }
  }, [currentTime, parsedLyrics])

  const handlePlayPause = () => {
    if (audioError) {
      toast.error('Cannot play: Audio source unavailable')
      return
    }
    setIsPlaying(!isPlaying)
  }

  const handleAudioTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime)
  }

  const handleAudioLoadedMetadata = (e) => {
    setDurationState(e.target.duration)
    setAudioLoading(false)
    setAudioError(false)
    console.log('Audio loaded successfully')
  }

  const handleAudioError = (e) => {
    console.error('Audio error:', e)
    setAudioError(true)
    setAudioLoading(false)
    toast.error('Unable to play audio. The audio source may be unavailable.')
  }

  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds)
  }

  const handleDuration = (dur) => {
    setDurationState(dur)
    setAudioLoading(false)
  }

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value)
    setCurrentTime(seekTime)
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime
    }
    if (playerRef.current) {
      playerRef.current.seekTo(seekTime)
    }
  }

  const handleSkip = (seconds) => {
    const newTime = Math.min(Math.max(0, currentTime + seconds), duration)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
    if (playerRef.current) {
      playerRef.current.seekTo(newTime)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    dispatch(setVolume(newVolume))
  }

  const handleLike = async () => {
    try {
      if (type === 'song') {
        await apiClient.post(`/users/save-song/${id}`)
      } else {
        await apiClient.post(`/sermons/${id}/like`)
      }
      setLiked(!liked)
      toast.success(liked ? 'Removed like' : 'Liked!')
    } catch (error) {
      console.error('Error liking:', error)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: content?.title,
        text: `Check out "${content?.title}" on Gospel Tune`,
        url: url
      })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    try {
      const response = await apiClient.post(`/comments/${id}`, { text: newComment })
      setComments([response.data, ...comments])
      setNewComment('')
      toast.success('Comment added!')
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const handleFullscreen = () => {
    if (!containerRef.current) return
    
    if (!fullscreen) {
      containerRef.current.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const isYouTube = content?.audioUrl?.includes('youtube.com') || 
                     content?.audioUrl?.includes('youtu.be') ||
                     content?.sourceType === 'youtube'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gospel-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Loading {type === 'song' ? 'song' : 'sermon'}...</p>
        </div>
      </div>
    )
  }

  if (!content && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">{type === 'song' ? 'Song' : 'Sermon'} not found</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">Go Home</button>
        </div>
      </div>
    )
  }

  const title = content?.title || 'Unknown Title'
  const artist = type === 'sermon' ? content?.preacher : (content?.artist || 'Unknown Artist')
  const thumbnail = type === 'sermon' ? content?.thumbnail : (content?.albumArt || 'https://via.placeholder.com/200x200?text=Gospel+Tune')
  const audioUrl = content?.audioUrl

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black"
    >
      {/* Main Player Layout */}
      <div className="h-screen flex flex-col">
        {/* Top Navigation */}
        <div className="bg-black/50 backdrop-blur-md p-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-white hover:text-gospel-gold transition p-2 rounded-lg hover:bg-white/10">
            <XMarkIcon className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold truncate max-w-[200px] md:max-w-md">
            {title}
          </h2>
          <button onClick={handleFullscreen} className="text-white hover:text-gospel-gold transition p-2 rounded-lg hover:bg-white/10">
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Main Content Area - Split Screen */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Side - Lyrics/Sermon Content */}
          <div className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${showComments ? 'md:w-2/3' : 'w-full'}`}>
            <div className="max-w-3xl mx-auto">
              {/* Song/Sermon Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <img
                    src={thumbnail}
                    alt={title}
                    className="w-48 h-48 rounded-2xl shadow-2xl object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x200?text=Gospel+Tune'
                    }}
                  />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
                <p className="text-gospel-gold text-lg mb-2">{artist}</p>
                
                {/* Source Badge */}
                {isYouTube && (
                  <div className="inline-flex items-center gap-1 bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-xs mb-4">
                    <span>▶️</span> YouTube Source
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button onClick={handleLike} className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition px-3 py-2 rounded-lg hover:bg-white/10">
                    {liked ? <HeartSolid className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
                    <span>{content?.stats?.likes || 0}</span>
                  </button>
                  <button onClick={handleShare} className="flex items-center gap-2 text-gray-300 hover:text-gospel-gold transition px-3 py-2 rounded-lg hover:bg-white/10">
                    <ShareIcon className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                  <button 
                    onClick={() => setShowLyrics(!showLyrics)}
                    className="flex items-center gap-2 text-gray-300 hover:text-gospel-gold transition px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    <MusicalNoteIcon className="h-5 w-5" />
                    <span>{showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}</span>
                  </button>
                </div>
              </div>

              {/* Lyrics Display */}
              {showLyrics && (
                <div className="bg-black/40 rounded-2xl p-8 min-h-[400px] backdrop-blur-sm">
                  {type === 'sermon' ? (
                    <div className="prose prose-invert max-w-none">
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {content?.content || 'No content available'}
                      </div>
                    </div>
                  ) : (
                    <div 
                      ref={lyricsRef}
                      className="h-full overflow-y-auto max-h-[500px] custom-scrollbar"
                    >
                      {parsedLyrics.length > 0 ? (
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                          {parsedLyrics.map((line, index) => (
                            <p
                              key={index}
                              className={`transition-all duration-300 cursor-pointer rounded-lg p-2 ${
                                index === activeLine
                                  ? 'text-gospel-gold text-2xl md:text-3xl font-bold scale-105 bg-gospel-gold/10'
                                  : 'text-gray-300 text-lg md:text-xl hover:text-gray-200 hover:bg-white/5'
                              }`}
                              onClick={() => {
                                if (line.time !== null && !audioError) {
                                  setCurrentTime(line.time)
                                  if (audioRef.current) {
                                    audioRef.current.currentTime = line.time
                                  }
                                  if (playerRef.current) {
                                    playerRef.current.seekTo(line.time)
                                  }
                                }
                              }}
                            >
                              {line.text}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-20">
                          <MusicalNoteIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg">No lyrics available for this song</p>
                          <p className="text-sm text-gray-500 mt-2">Add lyrics in LRC format when uploading</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Comments Section */}
          {showComments && (
            <div className="w-full md:w-1/3 bg-black/50 backdrop-blur-md border-l border-white/10 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Comments</h3>
                  <button 
                    onClick={() => setShowComments(false)}
                    className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleAddComment} className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this song..."
                    className="input-field w-full text-sm"
                    rows="3"
                  />
                  <button type="submit" className="btn-primary w-full mt-2 text-sm">
                    Post Comment
                  </button>
                </form>

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No comments yet. Be the first to share!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition">
                        <div className="flex items-center gap-2 mb-2">
                          <img 
                            src={comment.userAvatar || `https://ui-avatars.com/api/?name=${comment.username}&background=6B46C1&color=fff`}
                            className="w-8 h-8 rounded-full object-cover"
                            alt=""
                          />
                          <span className="font-semibold text-sm">{comment.username}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio Player Controls */}
        <div className="bg-black/90 backdrop-blur-xl border-t border-purple-500/30 p-4">
          {/* Audio Element */}
          {!isYouTube && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onLoadedMetadata={handleAudioLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onError={handleAudioError}
              className="hidden"
            />
          )}

          {isYouTube && (
            <ReactPlayer
              ref={playerRef}
              url={audioUrl}
              playing={isPlaying}
              volume={volume}
              onProgress={handleProgress}
              onDuration={handleDuration}
              onEnded={() => setIsPlaying(false)}
              width="0"
              height="0"
              config={{
                youtube: {
                  playerVars: { modestbranding: 1, rel: 0 }
                }
              }}
            />
          )}

          {/* Player UI */}
          <div className="container mx-auto">
            {audioError && (
              <div className="text-center mb-3 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                <p className="text-red-400 text-sm">⚠️ Unable to play audio. The audio source may be unavailable.</p>
                <p className="text-gray-400 text-xs mt-1">Try refreshing the page or check your internet connection.</p>
              </div>
            )}

            {audioLoading && !audioError && !duration && (
              <div className="text-center mb-3">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-gospel-gold inline-block mr-2"></div>
                <span className="text-xs text-gray-400">Loading audio...</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Progress Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-mono">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={audioError}
                  className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                    [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-gospel-gold"
                />
                <span className="text-xs text-gray-400 font-mono">{formatTime(duration)}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleSkip(-10)}
                    className="text-gray-300 hover:text-gospel-gold transition p-2 rounded-full hover:bg-white/10"
                    disabled={audioError}
                  >
                    <BackwardIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className={`bg-gospel-purple rounded-full p-3 hover:scale-110 transition shadow-lg ${audioError ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={audioError}
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-6 w-6" />
                    ) : (
                      <PlayIcon className="h-6 w-6" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleSkip(10)}
                    className="text-gray-300 hover:text-gospel-gold transition p-2 rounded-full hover:bg-white/10"
                    disabled={audioError}
                  >
                    <ForwardIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                      showComments ? 'bg-gospel-purple text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    <span className="text-sm hidden sm:inline">Comments</span>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => dispatch(setVolume(volume === 0 ? 1 : 0))}
                      className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                    >
                      {volume === 0 ? (
                        <SpeakerXMarkIcon className="h-5 w-5" />
                      ) : (
                        <SpeakerWaveIcon className="h-5 w-5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                        [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-gospel-gold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerPage
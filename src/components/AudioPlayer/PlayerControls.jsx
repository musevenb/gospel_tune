import React, { useRef, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ReactPlayer from 'react-player'
import { 
  play, pause, setVolume, setProgress, setDuration, nextSong 
} from '../../store/slices/playerSlice'
import { 
  PlayIcon, PauseIcon, ForwardIcon, BackwardIcon,
  SpeakerWaveIcon, SpeakerXMarkIcon, HeartIcon
} from '@heroicons/react/24/solid'

const PlayerControls = () => {
  const { currentSong, isPlaying, volume, progress, duration } = useSelector(
    (state) => state.player
  )
  const dispatch = useDispatch()
  const audioRef = useRef(null)
  const playerRef = useRef(null)
  const [error, setError] = useState(false)

  // Check if source is YouTube
  const isYouTube = currentSong?.audioUrl?.includes('youtube.com') || 
                     currentSong?.audioUrl?.includes('youtu.be') ||
                     currentSong?.sourceType === 'youtube'

  // Handle audio element playback
  useEffect(() => {
    if (audioRef.current && currentSong && !isYouTube) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Audio playback error:', err)
          setError(true)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentSong, isYouTube])

  // Handle YouTube playback
  useEffect(() => {
    if (playerRef.current && currentSong && isYouTube) {
      if (isPlaying) {
        playerRef.current.play()
      } else {
        playerRef.current.pause()
      }
    }
  }, [isPlaying, currentSong, isYouTube])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch(setProgress(audioRef.current.currentTime))
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      dispatch(setDuration(audioRef.current.duration))
      setError(false)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    dispatch(setVolume(newVolume))
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleProgress = (state) => {
    dispatch(setProgress(state.playedSeconds))
  }

  const handleDuration = (dur) => {
    dispatch(setDuration(dur))
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?]+)/)
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null
  }

  if (!currentSong) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-purple-500/30 p-3 z-50 animate-slide-up">
      {/* YouTube Player (hidden) */}
      {isYouTube && (
        <ReactPlayer
          ref={playerRef}
          url={currentSong.audioUrl}
          playing={isPlaying}
          volume={volume}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={() => dispatch(nextSong())}
          onError={(e) => {
            console.error('YouTube error:', e)
            setError(true)
          }}
          width="0"
          height="0"
          config={{
            youtube: {
              playerVars: { 
                modestbranding: 1, 
                rel: 0,
                controls: 1,
                autoplay: isPlaying ? 1 : 0
              }
            }
          }}
        />
      )}

      {/* HTML5 Audio Player (hidden) */}
      {!isYouTube && (
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => dispatch(nextSong())}
          onError={(e) => {
            console.error('Audio error:', e)
            setError(true)
          }}
        />
      )}
      
      <div className="container mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Song Info */}
          <div className="flex items-center space-x-3 min-w-[200px]">
            <img
              src={isYouTube ? getYouTubeThumbnail(currentSong.audioUrl) : (currentSong.albumArt || 'https://via.placeholder.com/50x50?text=Gospel')}
              alt={currentSong.title}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/50x50?text=Gospel'
              }}
            />
            <div>
              <h4 className="font-semibold text-sm truncate max-w-[150px]">{currentSong.title}</h4>
              <p className="text-xs text-gray-400 truncate max-w-[150px]">{currentSong.artist}</p>
              {error && (
                <p className="text-xs text-red-400">⚠️ Playback error</p>
              )}
              {isYouTube && !error && (
                <p className="text-xs text-red-400">▶️ YouTube</p>
              )}
            </div>
            <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500 transition cursor-pointer" />
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center flex-1 max-w-md">
            <div className="flex items-center space-x-6">
              <button className="hover:text-gospel-gold transition">
                <BackwardIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => dispatch(isPlaying ? pause() : play())}
                className="bg-gospel-purple rounded-full p-3 hover:scale-110 transition shadow-lg"
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>
              <button 
                onClick={() => dispatch(nextSong())}
                className="hover:text-gospel-gold transition"
              >
                <ForwardIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-3 w-full mt-2">
              <span className="text-xs">{formatTime(progress)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={progress}
                onChange={(e) => {
                  const seekTime = parseFloat(e.target.value)
                  dispatch(setProgress(seekTime))
                  if (isYouTube && playerRef.current) {
                    playerRef.current.seekTo(seekTime)
                  } else if (audioRef.current) {
                    audioRef.current.currentTime = seekTime
                  }
                }}
                className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gospel-gold"
              />
              <span className="text-xs">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2 min-w-[100px]">
            <button onClick={() => dispatch(setVolume(volume === 0 ? 1 : 0))}>
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
              className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerControls
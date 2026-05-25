import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createSong } from '../store/slices/songSlice'
import apiClient from '../store/api/apiClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  MusicalNoteIcon, 
  BookOpenIcon,
  CloudArrowUpIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline'

const UploadPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [uploadType, setUploadType] = useState('song')
  const [loading, setLoading] = useState(false)
  const [sourceType, setSourceType] = useState('file')
  
  // File upload states
  const [audioFile, setAudioFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null)

  // Song State
  const [songData, setSongData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: 'Gospel',
    audioUrl: '',
    youtubeUrl: '',
    albumArt: '',
    lyrics: '',
    lyricsType: 'lrc',
    language: 'English',
    tags: ''
  })

  // Sermon State
  const [sermonData, setSermonData] = useState({
    title: '',
    description: '',
    preacher: '',
    type: 'sermon',
    audioUrl: '',
    youtubeUrl: '',
    videoUrl: '',
    thumbnail: '',
    content: '',
    songId: '',
    tags: '',
    language: 'English'
  })

  const sermonTypes = [
    { value: 'sermon', label: '🙏 Sermon' },
    { value: 'documentary', label: '🎬 Documentary' },
    { value: 'song_history', label: '🎵 Song History' },
    { value: 'bible_study', label: '✝️ Bible Study' },
    { value: 'testimony', label: '💝 Testimony' }
  ]

  const genres = ['Gospel', 'Worship', 'Praise', 'Contemporary Gospel', 'Traditional Gospel']

  // Handle local audio file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/m4a', 'audio/aac']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid audio file (MP3, WAV, FLAC, OGG, M4A, AAC)')
      return
    }
    
    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }
    
    setAudioFile(file)
    setUploadProgress(0)
    
    // Upload file to server
    const formData = new FormData()
    formData.append('audio', file)
    
    try {
      const response = await apiClient.post('/audio/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })
      
      setUploadedFileUrl(response.data.audioUrl)
      setSongData({ 
        ...songData, 
        audioUrl: response.data.audioUrl,
        storageType: 'local'
      })
      toast.success('Audio file uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload audio file')
      setAudioFile(null)
      setUploadProgress(0)
    }
  }

  // Handle Song Submit
  const handleSongSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    let finalAudioUrl = songData.audioUrl
    
    // If using YouTube
    if (sourceType === 'youtube' && songData.youtubeUrl) {
      finalAudioUrl = songData.youtubeUrl
    }
    
    const tagsArray = songData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    const dataToSubmit = { 
      ...songData, 
      audioUrl: finalAudioUrl,
      sourceType: sourceType,
      tags: tagsArray,
      storageType: sourceType === 'file' && uploadedFileUrl ? 'local' : (sourceType === 'youtube' ? 'youtube' : 'url')
    }
    
    try {
      await dispatch(createSong(dataToSubmit)).unwrap()
      toast.success('Song uploaded! Waiting for admin approval 🙏')
      navigate('/profile')
    } catch (error) {
      toast.error(error.message || 'Failed to upload song')
    } finally {
      setLoading(false)
    }
  }

  // Handle Sermon Submit
  const handleSermonSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const tagsArray = sermonData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    const dataToSubmit = { 
      ...sermonData, 
      tags: tagsArray
    }
    
    try {
      await apiClient.post('/sermons', dataToSubmit)
      toast.success('Sermon uploaded! Waiting for approval 🙏')
      navigate('/sermons')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload sermon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Share Your Content</h1>
          <p className="text-gray-300">Upload Gospel music or spiritual teachings to bless the community</p>
        </div>

        {/* Upload Type Selector */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setUploadType('song')}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl transition transform hover:scale-105 ${
              uploadType === 'song'
                ? 'bg-gospel-purple text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <MusicalNoteIcon className="h-8 w-8" />
            <div className="text-left">
              <div className="font-bold text-lg">Upload Song</div>
              <div className="text-sm opacity-80">Share your Gospel music</div>
            </div>
          </button>
          
          <button
            onClick={() => setUploadType('sermon')}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl transition transform hover:scale-105 ${
              uploadType === 'sermon'
                ? 'bg-gospel-purple text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <BookOpenIcon className="h-8 w-8" />
            <div className="text-left">
              <div className="font-bold text-lg">Upload Sermon</div>
              <div className="text-sm opacity-80">Share teachings & testimonies</div>
            </div>
          </button>
        </div>

        {/* Song Upload Form */}
        {uploadType === 'song' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Song Details</h2>
            
            {/* Source Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Audio Source</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSourceType('file')}
                  className={`flex-1 py-2 rounded-lg transition ${
                    sourceType === 'file'
                      ? 'bg-gospel-purple text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  📁 Local File
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('url')}
                  className={`flex-1 py-2 rounded-lg transition ${
                    sourceType === 'url'
                      ? 'bg-gospel-purple text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  🔗 Audio URL
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('youtube')}
                  className={`flex-1 py-2 rounded-lg transition ${
                    sourceType === 'youtube'
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  ▶️ YouTube
                </button>
              </div>
            </div>

            <form onSubmit={handleSongSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Song Title *</label>
                  <input
                    type="text"
                    value={songData.title}
                    onChange={(e) => setSongData({...songData, title: e.target.value})}
                    className="input-field"
                    required
                    placeholder="e.g., Way Maker"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Artist Name *</label>
                  <input
                    type="text"
                    value={songData.artist}
                    onChange={(e) => setSongData({...songData, artist: e.target.value})}
                    className="input-field"
                    required
                    placeholder="e.g., Sinach"
                  />
                </div>
              </div>

              {/* Local File Upload */}
              {sourceType === 'file' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Upload Audio File</label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-gospel-gold transition cursor-pointer">
                    <input
                      type="file"
                      id="audioFile"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label 
                      htmlFor="audioFile" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <DocumentArrowUpIcon className="h-12 w-12 text-gray-400" />
                      <span className="text-gray-400">Click to upload audio file</span>
                      <span className="text-xs text-gray-500">MP3, WAV, FLAC, OGG, M4A, AAC (Max 50MB)</span>
                    </label>
                  </div>
                  
                  {audioFile && (
                    <div className="mt-3 p-3 bg-gospel-purple/20 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold truncate max-w-[200px]">{audioFile.name}</span>
                        <span className="text-xs text-gray-300">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gospel-gold h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                      {uploadProgress === 100 && (
                        <div className="flex items-center gap-2 text-green-400 text-xs mt-1">
                          <span>✓ Uploaded successfully</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Audio URL Input */}
              {sourceType === 'url' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Audio URL *</label>
                  <input
                    type="url"
                    value={songData.audioUrl}
                    onChange={(e) => setSongData({...songData, audioUrl: e.target.value})}
                    className="input-field"
                    placeholder="https://example.com/song.mp3"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter a direct URL to your audio file</p>
                </div>
              )}

              {/* YouTube URL Input */}
              {sourceType === 'youtube' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">YouTube URL *</label>
                  <input
                    type="url"
                    value={songData.youtubeUrl}
                    onChange={(e) => setSongData({...songData, youtubeUrl: e.target.value})}
                    className="input-field"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Paste any YouTube video URL</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Genre *</label>
                  <select
                    value={songData.genre}
                    onChange={(e) => setSongData({...songData, genre: e.target.value})}
                    className="input-field"
                  >
                    {genres.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Album (Optional)</label>
                  <input
                    type="text"
                    value={songData.album}
                    onChange={(e) => setSongData({...songData, album: e.target.value})}
                    className="input-field"
                    placeholder="Album name"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Album Art URL (Optional)</label>
                <input
                  type="url"
                  value={songData.albumArt}
                  onChange={(e) => setSongData({...songData, albumArt: e.target.value})}
                  className="input-field"
                  placeholder="https://example.com/album-art.jpg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={songData.tags}
                  onChange={(e) => setSongData({...songData, tags: e.target.value})}
                  className="input-field"
                  placeholder="worship, praise, hillsong"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Lyrics (LRC format - Optional)</label>
                <textarea
                  value={songData.lyrics}
                  onChange={(e) => setSongData({...songData, lyrics: e.target.value})}
                  className="input-field font-mono text-sm"
                  rows="8"
                  placeholder='[00:05.00] Amazing grace how sweet the sound&#10;[00:12.00] That saved a wretch like me&#10;[00:19.00] I once was lost but now am found&#10;[00:26.00] Was blind but now I see'
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">
                  Format: [mm:ss.ms] lyric text (This enables synchronized lyrics)
                </p>
              </div>

              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CloudArrowUpIcon className="h-5 w-5" />
                    Upload Song
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Sermon Upload Form */}
        {uploadType === 'sermon' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Sermon Details</h2>
            <form onSubmit={handleSermonSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={sermonData.title}
                    onChange={(e) => setSermonData({...sermonData, title: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preacher/Speaker *</label>
                  <input
                    type="text"
                    value={sermonData.preacher}
                    onChange={(e) => setSermonData({...sermonData, preacher: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <select
                    value={sermonData.type}
                    onChange={(e) => setSermonData({...sermonData, type: e.target.value})}
                    className="input-field"
                  >
                    {sermonTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={sermonData.thumbnail}
                    onChange={(e) => setSermonData({...sermonData, thumbnail: e.target.value})}
                    className="input-field"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Audio/Video URL (Optional)</label>
                <input
                  type="url"
                  value={sermonData.audioUrl}
                  onChange={(e) => setSermonData({...sermonData, audioUrl: e.target.value})}
                  className="input-field"
                  placeholder="https://example.com/sermon.mp3"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Short Description *</label>
                <textarea
                  value={sermonData.description}
                  onChange={(e) => setSermonData({...sermonData, description: e.target.value})}
                  className="input-field"
                  rows="3"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Full Content *</label>
                <textarea
                  value={sermonData.content}
                  onChange={(e) => setSermonData({...sermonData, content: e.target.value})}
                  className="input-field"
                  rows="10"
                  required
                  placeholder="Write the full sermon content here..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={sermonData.tags}
                  onChange={(e) => setSermonData({...sermonData, tags: e.target.value})}
                  className="input-field"
                  placeholder="faith, prayer, worship"
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Uploading...' : '📖 Publish Sermon'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadPage
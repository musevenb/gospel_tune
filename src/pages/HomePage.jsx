import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import SongList from '../components/Songs/SongList'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { fetchSongs } from '../store/slices/songSlice'

const HomePage = () => {
  const { songs, isLoading } = useSelector((state) => state.songs)
  const dispatch = useDispatch()

  useEffect(() => {
    if (songs.length === 0) {
      dispatch(fetchSongs())
    }
  }, [dispatch, songs.length])

  const featuredSongs = songs.filter(s => s.status === 'featured').slice(0, 6)
  const latestSongs = songs.slice(0, 12)

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Section */}
      <div className="relative h-[70vh] mb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/95 to-black/80 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-4.0.3')] bg-cover bg-center"></div>
        <div className="relative z-20 h-full flex items-center justify-center text-center">
          <div className="animate-float">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-gospel-gold to-purple-400 bg-clip-text text-transparent">
              Gospel Tune
            </h1>
            <p className="text-xl md:text-2xl mb-8">Experience the power of Gospel music</p>
            <button className="btn-primary text-lg px-8 py-3">
              🎵 Start Listening
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {featuredSongs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <span className="w-12 h-1 bg-gospel-gold mr-4"></span>
              ⭐ Featured Songs
            </h2>
            <SongList songs={featuredSongs} />
          </div>
        )}

        <div>
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <span className="w-12 h-1 bg-gospel-gold mr-4"></span>
            🎵 Latest Releases
          </h2>
          <SongList songs={latestSongs} />
        </div>
      </div>
    </div>
  )
}

export default HomePage
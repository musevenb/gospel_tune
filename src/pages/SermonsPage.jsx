import React, { useState, useEffect } from 'react'
import apiClient from '../store/api/apiClient'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import SermonCard from "../components/Sermons/SermonCard";

const SermonsPage = () => {
  const [sermons, setSermons] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('all')

  const types = [
    { value: 'all', label: 'All', icon: '📖' },
    { value: 'sermon', label: 'Sermons', icon: '🙏' },
    { value: 'documentary', label: 'Documentaries', icon: '🎬' },
    { value: 'song_history', label: 'Song History', icon: '🎵' },
    { value: 'bible_study', label: 'Bible Study', icon: '✝️' },
    { value: 'testimony', label: 'Testimonies', icon: '💝' }
  ]

  useEffect(() => {
    fetchSermons()
  }, [activeType])

  const fetchSermons = async () => {
    setLoading(true)
    try {
      const url = activeType === 'all' 
        ? '/sermons' 
        : `/sermons?type=${activeType}`
      const response = await apiClient.get(url)
      setSermons(response.data.sermons)
    } catch (error) {
      console.error('Error fetching sermons:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gospel-gold to-purple-400 bg-clip-text text-transparent">
            Sermons & Teachings
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Dive deep into the Word of God through sermons, song histories, and spiritual teachings
          </p>
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {types.map(type => (
            <button
              key={type.value}
              onClick={() => setActiveType(type.value)}
              className={`px-6 py-2 rounded-full transition ${
                activeType === type.value
                  ? 'bg-gospel-purple text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Sermons Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gospel-gold mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading sermons...</p>
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl">
            <BookOpenIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No sermons found</p>
            <p className="text-sm text-gray-500 mt-2">Check back later for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sermons.map((sermon) => (
              <SermonCard key={sermon._id} sermon={sermon} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SermonsPage

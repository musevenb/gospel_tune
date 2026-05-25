import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SongList from '../components/Songs/SongList'
import apiClient from '../store/api/apiClient'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query) {
      searchSongs()
    }
  }, [query])

  const searchSongs = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/songs?search=${query}`)
      setResults(response.data.songs)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-400 mb-8">Found {results.length} songs for "{query}"</p>
        
        {loading ? (
          <div className="text-center py-20">Searching...</div>
        ) : (
          <SongList songs={results} />
        )}
      </div>
    </div>
  )
}

export default SearchPage
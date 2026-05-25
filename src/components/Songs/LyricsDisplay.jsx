import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

const LyricsDisplay = ({ lyrics }) => {
  const { progress } = useSelector((state) => state.player)
  const [activeLine, setActiveLine] = useState(0)
  const lyricsRef = useRef(null)

  useEffect(() => {
    if (lyrics && lyrics.length > 0) {
      const currentLineIndex = lyrics.findIndex(
        (line, index) => {
          const nextLine = lyrics[index + 1]
          return line.time <= progress && (!nextLine || nextLine.time > progress)
        }
      )
      setActiveLine(currentLineIndex >= 0 ? currentLineIndex : 0)

      if (lyricsRef.current && activeLine >= 0) {
        const activeElement = lyricsRef.current.children[activeLine]
        activeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [progress, lyrics, activeLine])

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="text-center text-gray-400 py-20">
        <p className="text-2xl mb-2">🎵</p>
        <p>No lyrics available for this song</p>
        <p className="text-sm mt-2">Enjoy the instrumental worship!</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto py-8 px-4" ref={lyricsRef}>
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        {lyrics.map((line, index) => (
          <p
            key={index}
            className={`transition-all duration-500 ${
              index === activeLine
                ? 'text-gospel-gold text-2xl font-bold scale-105'
                : 'text-gray-300 text-lg'
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  )
}

export default LyricsDisplay
import React from 'react'
import { PlayIcon } from '@heroicons/react/24/outline'

const DocumentaryPanel = ({ documentary }) => {
  if (!documentary) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl mb-4">📖</p>
        <p className="text-gray-400">No documentary available for this song yet</p>
        <p className="text-sm mt-2">Check back later for the story behind this song!</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-gospel-gold">{documentary.title}</h3>
      
      {documentary.videoUrl && (
        <div className="mb-8 aspect-video">
          <iframe
            src={documentary.videoUrl}
            title="Documentary Video"
            className="w-full h-full rounded-lg"
            allowFullScreen
          ></iframe>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h4 className="text-xl font-semibold mb-2">Historical Background</h4>
          <p className="text-gray-300 leading-relaxed">{documentary.historicalBackground}</p>
        </div>

        {documentary.sermonNotes && (
          <div>
            <h4 className="text-xl font-semibold mb-2">Sermon Notes</h4>
            <p className="text-gray-300 leading-relaxed">{documentary.sermonNotes}</p>
          </div>
        )}

        {documentary.relatedScripture && documentary.relatedScripture.length > 0 && (
          <div>
            <h4 className="text-xl font-semibold mb-2">Related Scripture</h4>
            <div className="flex flex-wrap gap-2">
              {documentary.relatedScripture.map((verse, idx) => (
                <span key={idx} className="bg-gospel-purple/30 px-3 py-1 rounded-full text-sm">
                  📖 {verse}
                </span>
              ))}
            </div>
          </div>
        )}

        {documentary.theologianNotes && (
          <div>
            <h4 className="text-xl font-semibold mb-2">Theologian Notes</h4>
            <p className="text-gray-300 italic">{documentary.theologianNotes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentaryPanel
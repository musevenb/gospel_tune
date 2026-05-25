/**
 * Parse LRC (Lyrics) format to array with timestamps
 * Example LRC: [00:12.00] Amazing grace how sweet the sound
 * Returns: [{ time: 12.00, text: "Amazing grace how sweet the sound" }]
 */

const parseLRC = (lrcContent) => {
  if (!lrcContent) return [];
  
  const lines = lrcContent.split('\n');
  const parsedLines = [];
  
  // Regular expression to match timestamps like [00:12.34]
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2})\]/;
  
  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const centiseconds = parseInt(match[3]);
      
      // Convert to total seconds
      const timeInSeconds = (minutes * 60) + seconds + (centiseconds / 100);
      
      // Extract text after the timestamp
      const text = line.replace(timeRegex, '').trim();
      
      if (text) {
        parsedLines.push({
          time: timeInSeconds,
          text: text
        });
      }
    } else if (line.trim() && !line.match(/\[[a-z]+\]/i)) {
      // Handle plain text lines (no timestamp)
      parsedLines.push({
        time: null,
        text: line.trim()
      });
    }
  }
  
  return parsedLines;
};

// Convert plain text to simple lyrics array
const parsePlainLyrics = (text) => {
  if (!text) return [];
  
  return text.split('\n')
    .filter(line => line.trim())
    .map(line => ({
      time: null,
      text: line.trim()
    }));
};

module.exports = { parseLRC, parsePlainLyrics };
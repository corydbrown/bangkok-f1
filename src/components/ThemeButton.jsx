import { useState, useRef } from 'react'
import themeUrl from '../assets/Brian_Tyler_-_Formula_1_Official_Theme_Song_2018_(mp3.pm).mp3'

export default function ThemeButton() {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  function toggle() {
    if (!audioRef.current) {
      audioRef.current = new Audio(themeUrl)
      audioRef.current.loop = true
      audioRef.current.onerror = () => {
        setPlaying(false)
        audioRef.current = null
      }
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false))
    }
  }

  return (
    <button
      className={`theme-btn${playing ? ' playing' : ''}`}
      onClick={toggle}
      aria-label={playing ? 'Pause F1 theme' : 'Play F1 theme'}
      title={playing ? 'Pause F1 Theme' : 'Play F1 Theme'}
    >
      {playing ? '⏸ PAUSE' : '▶ F1 THEME'}
    </button>
  )
}

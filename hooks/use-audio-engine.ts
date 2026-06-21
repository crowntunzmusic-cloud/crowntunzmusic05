'use client';

import { useEffect } from 'react';
import { getAudioElement, useAudioPlayer } from '@/hooks/use-audio-player';

/**
 * Binds the singleton HTML5 Audio element's media events to the Zustand store.
 * Mounted exactly once, high in the tree (inside AppShell), so the audio
 * element and its listeners persist across route changes without interruption.
 */
export function useAudioEngine() {
  const advance = useAudioPlayer((s) => s._advance);
  const setCurrentTime = useAudioPlayer((s) => s.setCurrentTime);
  const setDuration = useAudioPlayer((s) => s.setDuration);
  const setBuffered = useAudioPlayer((s) => s.setBuffered);
  const setBuffering = useAudioPlayer((s) => s.setBuffering);
  const setPlaying = useAudioPlayer((s) => s.setPlaying);
  const setError = useAudioPlayer((s) => s.setError);
  const volume = useAudioPlayer((s) => s.volume);
  const muted = useAudioPlayer((s) => s.muted);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = getAudioElement();

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onProgress = () => {
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1));
      }
    };
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => {
      setBuffering(false);
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => advance();
    const onError = () => {
      const mediaError = audio.error;
      setError(mediaError ? `Playback error (code ${mediaError.code})` : 'Unknown playback error');
      setBuffering(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('progress', onProgress);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('progress', onProgress);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [
    advance,
    setCurrentTime,
    setDuration,
    setBuffered,
    setBuffering,
    setPlaying,
    setError,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = getAudioElement();
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);
}

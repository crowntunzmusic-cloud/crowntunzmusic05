'use client';

import { create } from 'zustand';
import type { RepeatMode, Track } from '@/lib/types';

interface AudioPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: Track[];
  queueIndex: number;
  history: Track[];
  isBuffering: boolean;
  error: string | null;

  playTrack: (track: Track, queue?: Track[]) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (buffered: number) => void;
  setBuffering: (isBuffering: boolean) => void;
  setError: (error: string | null) => void;
  setPlaying: (playing: boolean) => void;
  _advance: () => void;
}

let audioEl: HTMLAudioElement | null = null;

export function getAudioElement(): HTMLAudioElement {
  if (typeof window === 'undefined') {
    throw new Error('Audio element can only be accessed in the browser');
  }
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'auto';
    audioEl.crossOrigin = 'anonymous';
  }
  return audioEl;
}

function pickShuffledIndex(queue: Track[], currentIndex: number): number {
  if (queue.length <= 1) return currentIndex;
  let next = currentIndex;
  let attempts = 0;
  while (next === currentIndex && attempts < 25) {
    next = Math.floor(Math.random() * queue.length);
    attempts += 1;
  }
  return next;
}

export const useAudioPlayer = create<AudioPlayerState>((set, get) => {
  function loadAndPlay(track: Track) {
    const audio = getAudioElement();
    if (audio.src !== track.audio_url) {
      audio.src = track.audio_url;
    }
    audio.volume = get().muted ? 0 : get().volume;
    void audio.play().catch((err: Error) => {
      set({ error: err.message, isPlaying: false });
    });
  }

  return {
    currentTrack: null,
    isPlaying: false,
    volume: 0.8,
    muted: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    shuffle: false,
    repeat: 'off',
    queue: [],
    queueIndex: -1,
    history: [],
    isBuffering: false,
    error: null,

    playTrack: (track, queue) => {
      const state = get();
      const nextQueue = queue && queue.length > 0 ? queue : state.queue.length > 0 ? state.queue : [track];
      let index = nextQueue.findIndex((t) => t.id === track.id);
      if (index === -1) {
        index = 0;
      }
      set({
        currentTrack: track,
        queue: nextQueue,
        queueIndex: index,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        error: null,
        history: state.currentTrack ? [state.currentTrack, ...state.history].slice(0, 50) : state.history,
      });
      loadAndPlay(track);
    },

    playQueue: (tracks, startIndex = 0) => {
      if (tracks.length === 0) return;
      const index = Math.max(0, Math.min(startIndex, tracks.length - 1));
      const track = tracks[index];
      const state = get();
      set({
        currentTrack: track,
        queue: tracks,
        queueIndex: index,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
        error: null,
        history: state.currentTrack ? [state.currentTrack, ...state.history].slice(0, 50) : state.history,
      });
      loadAndPlay(track);
    },

    togglePlay: () => {
      const state = get();
      if (!state.currentTrack) return;
      const audio = getAudioElement();
      if (state.isPlaying) {
        audio.pause();
        set({ isPlaying: false });
      } else {
        void audio.play().catch((err: Error) => set({ error: err.message }));
        set({ isPlaying: true });
      }
    },

    play: () => {
      const state = get();
      if (!state.currentTrack) return;
      const audio = getAudioElement();
      void audio.play().catch((err: Error) => set({ error: err.message }));
      set({ isPlaying: true });
    },

    pause: () => {
      if (typeof window === 'undefined') return;
      const audio = getAudioElement();
      audio.pause();
      set({ isPlaying: false });
    },

    next: () => {
      const state = get();
      if (state.queue.length === 0) return;
      let nextIndex: number;
      if (state.shuffle) {
        nextIndex = pickShuffledIndex(state.queue, state.queueIndex);
      } else {
        nextIndex = state.queueIndex + 1;
        if (nextIndex >= state.queue.length) {
          if (state.repeat === 'all') {
            nextIndex = 0;
          } else {
            return;
          }
        }
      }
      const nextTrack = state.queue[nextIndex];
      set({
        currentTrack: nextTrack,
        queueIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        error: null,
        history: state.currentTrack ? [state.currentTrack, ...state.history].slice(0, 50) : state.history,
      });
      loadAndPlay(nextTrack);
    },

    previous: () => {
      const state = get();
      if (state.queue.length === 0) return;
      const audio = getAudioElement();
      if (audio.currentTime > 3) {
        audio.currentTime = 0;
        set({ currentTime: 0 });
        return;
      }
      let prevIndex = state.queueIndex - 1;
      if (prevIndex < 0) {
        prevIndex = state.repeat === 'all' ? state.queue.length - 1 : 0;
      }
      const prevTrack = state.queue[prevIndex];
      set({
        currentTrack: prevTrack,
        queueIndex: prevIndex,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
        buffered: 0,
        error: null,
        history: state.currentTrack ? [state.currentTrack, ...state.history].slice(0, 50) : state.history,
      });
      loadAndPlay(prevTrack);
    },

    seek: (time) => {
      const audio = getAudioElement();
      audio.currentTime = time;
      set({ currentTime: time });
    },

    setVolume: (volume) => {
      const clamped = Math.max(0, Math.min(1, volume));
      const audio = getAudioElement();
      audio.volume = clamped;
      set({ volume: clamped, muted: clamped === 0 });
    },

    toggleMute: () => {
      const state = get();
      const audio = getAudioElement();
      if (state.muted) {
        audio.volume = state.volume || 0.8;
        set({ muted: false });
      } else {
        audio.volume = 0;
        set({ muted: true });
      }
    },

    toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

    cycleRepeat: () =>
      set((s) => ({
        repeat:
          s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'single' : 'off',
      })),

    addToQueue: (track) =>
      set((s) => {
        if (s.queue.length === 0) {
          return { queue: [track], queueIndex: 0, currentTrack: s.currentTrack ?? track };
        }
        return { queue: [...s.queue, track] };
      }),

    removeFromQueue: (index) =>
      set((s) => {
        if (index < 0 || index >= s.queue.length) return s;
        const nextQueue = s.queue.filter((_, i) => i !== index);
        let nextIndex = s.queueIndex;
        if (index < s.queueIndex) {
          nextIndex = Math.max(0, s.queueIndex - 1);
        } else if (index === s.queueIndex) {
          nextIndex = Math.min(nextQueue.length - 1, s.queueIndex);
        }
        return { queue: nextQueue, queueIndex: nextIndex };
      }),

    clearQueue: () =>
      set((s) => ({
        queue: s.currentTrack ? [s.currentTrack] : [],
        queueIndex: s.currentTrack ? 0 : -1,
      })),

    setCurrentTime: (time) => set({ currentTime: time }),
    setDuration: (duration) => set({ duration }),
    setBuffered: (buffered) => set({ buffered }),
    setBuffering: (isBuffering) => set({ isBuffering }),
    setError: (error) => set({ error }),
    setPlaying: (playing) => set({ isPlaying: playing }),

    _advance: () => {
      const state = get();
      if (state.repeat === 'single') {
        const audio = getAudioElement();
        audio.currentTime = 0;
        void audio.play().catch(() => {});
        set({ currentTime: 0, isPlaying: true });
        return;
      }
      get().next();
    },
  };
});

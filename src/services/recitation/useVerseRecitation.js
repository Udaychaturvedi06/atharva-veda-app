/**
 * useVerseRecitation React Hook
 * 
 * Binds VerseDetail or LessonPlayer to the PlaybackController
 * and SynchronizationService with automatic JIT background preparation.
 */

import { useState, useEffect, useCallback } from 'react';
import { playbackController } from './playbackController.js';
import { synchronizationService } from './synchronizationService.js';

export function useVerseRecitation(verseData) {
  const [controllerState, setControllerState] = useState(() => playbackController.getSnapshot());
  const [syncState, setSyncState] = useState({
    currentMs: 0,
    totalMs: 0,
    progressPercent: 0,
    activeWordIndex: -1,
    activeWord: null
  });

  const verseKey = verseData?.id || verseData?.ref || null;

  // Subscribe to controller state transitions
  useEffect(() => {
    const unsubscribe = playbackController.subscribe((snap) => {
      setControllerState(snap);
    });
    return unsubscribe;
  }, []);

  // Subscribe to millisecond-accurate audio clock synchronization
  useEffect(() => {
    const unsubscribe = synchronizationService.subscribe((timing) => {
      setSyncState(timing);
    });
    return unsubscribe;
  }, []);

  // JIT Trigger: Automatically begin background preparation when verse opens
  useEffect(() => {
    if (!verseData || !verseKey) return;

    playbackController.prepareVerse(verseData, { priority: 'background' });

    return () => {
      playbackController.cleanup();
    };
    // Re-prepare only when the active verse identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseKey]);

  const play = useCallback(() => playbackController.play(), []);
  const pause = useCallback(() => playbackController.pause(), []);
  const resume = useCallback(() => playbackController.resume(), []);
  const replay = useCallback(() => playbackController.replay(), []);
  const seek = useCallback((timeSec) => playbackController.seek(timeSec), []);
  const setSpeed = useCallback((rate) => playbackController.setSpeed(rate), []);

  return {
    ...controllerState,
    ...syncState,
    play,
    pause,
    resume,
    replay,
    seek,
    setSpeed
  };
}

export default useVerseRecitation;

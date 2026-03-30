/**
 * Audio system for The Demon's Cycle
 * Manages background music and sound effects based on game state.
 * Uses expo-av for audio playback.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { Audio } from 'expo-av';

// Audio tracks — mapped to game situations
// These are bundled assets (mp3/wav files in assets/audio/)
const MUSIC_TRACKS: Record<string, any> = {};
const SFX_TRACKS: Record<string, any> = {};

// We'll load tracks dynamically to avoid crashes if files don't exist yet
let tracksLoaded = false;
try {
  // Background music
  MUSIC_TRACKS.day_calm = require('../assets/audio/music_day_calm.mp3');
  MUSIC_TRACKS.day_tense = require('../assets/audio/music_day_tense.mp3');
  MUSIC_TRACKS.night_combat = require('../assets/audio/music_night_combat.mp3');
  MUSIC_TRACKS.night_intense = require('../assets/audio/music_night_intense.mp3');
  MUSIC_TRACKS.vn_peaceful = require('../assets/audio/music_vn_peaceful.mp3');
  MUSIC_TRACKS.vn_dramatic = require('../assets/audio/music_vn_dramatic.mp3');
  MUSIC_TRACKS.victory = require('../assets/audio/music_victory.mp3');
  MUSIC_TRACKS.defeat = require('../assets/audio/music_defeat.mp3');
  MUSIC_TRACKS.menu = require('../assets/audio/music_menu.mp3');

  // Sound effects
  SFX_TRACKS.ward_place = require('../assets/audio/sfx_ward_place.mp3');
  SFX_TRACKS.ward_activate = require('../assets/audio/sfx_ward_activate.mp3');
  SFX_TRACKS.demon_spawn = require('../assets/audio/sfx_demon_spawn.mp3');
  SFX_TRACKS.demon_die = require('../assets/audio/sfx_demon_die.mp3');
  SFX_TRACKS.damage = require('../assets/audio/sfx_damage.mp3');
  SFX_TRACKS.heal = require('../assets/audio/sfx_heal.mp3');
  SFX_TRACKS.night_fall = require('../assets/audio/sfx_night_fall.mp3');
  SFX_TRACKS.dawn = require('../assets/audio/sfx_dawn.mp3');
  SFX_TRACKS.choice = require('../assets/audio/sfx_choice.mp3');
  SFX_TRACKS.text_advance = require('../assets/audio/sfx_text_advance.mp3');
  SFX_TRACKS.button = require('../assets/audio/sfx_button.mp3');

  tracksLoaded = true;
} catch {
  // Audio files not yet added — system will run silently
  tracksLoaded = false;
}

export type MusicTrack = keyof typeof MUSIC_TRACKS;
export type SfxTrack = keyof typeof SFX_TRACKS;

export function useAudio() {
  const musicRef = useRef<Audio.Sound | null>(null);
  const currentTrackRef = useRef<string | null>(null);
  const [muted, setMuted] = useState(false);

  // Initialize audio mode
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(() => {});

    return () => {
      musicRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // Play background music (crossfade)
  const playMusic = useCallback(async (track: string) => {
    if (!tracksLoaded || muted) return;
    if (currentTrackRef.current === track) return;
    if (!MUSIC_TRACKS[track]) return;

    try {
      // Stop and unload current track completely before starting new one
      const prev = musicRef.current;
      musicRef.current = null;
      currentTrackRef.current = null;
      if (prev) {
        try { await prev.stopAsync(); } catch {}
        try { await prev.unloadAsync(); } catch {}
      }

      // Load and play new track
      const { sound } = await Audio.Sound.createAsync(
        MUSIC_TRACKS[track],
        { isLooping: true, volume: 0.3 }
      );
      musicRef.current = sound;
      currentTrackRef.current = track;
      await sound.playAsync();
    } catch {
      // Silently fail if audio loading fails
    }
  }, [muted]);

  // Play sound effect (fire and forget)
  const playSfx = useCallback(async (sfx: string) => {
    if (!tracksLoaded || muted) return;
    if (!SFX_TRACKS[sfx]) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        SFX_TRACKS[sfx],
        { volume: 0.6 }
      );
      await sound.playAsync();
      // Auto-unload after playback
      sound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch {
      // Silently fail
    }
  }, [muted]);

  // Stop all music
  const stopMusic = useCallback(async () => {
    try {
      if (musicRef.current) {
        await musicRef.current.stopAsync();
        await musicRef.current.unloadAsync();
        musicRef.current = null;
        currentTrackRef.current = null;
      }
    } catch {}
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      if (!prev) {
        // Muting — stop current music
        musicRef.current?.setVolumeAsync(0).catch(() => {});
      } else {
        // Unmuting — restore volume
        musicRef.current?.setVolumeAsync(0.4).catch(() => {});
      }
      return !prev;
    });
  }, []);

  return { playMusic, playSfx, stopMusic, toggleMute, muted };
}

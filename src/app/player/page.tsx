"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { 
  ChevronLeft, 
  Menu, 
  X,
  SkipBack, 
  Play, 
  Pause, 
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type RepeatMode = 'off' | 'all' | 'one';

interface PlaylistItem {
  id: string;
  title: string;
  subtitle: string;
  category?: string;
  fileId?: string;
  cloudinaryUrl?: string;
  localUrl?: string;
  r2Key?: string;
  r2PublicUrl?: string;
  image?: string;
}

function PlayerContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state for enhanced controls
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isLiked, setIsLiked] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true);
    
    // Load saved preferences
    const savedVolume = localStorage.getItem('playerVolume');
    const savedMuted = localStorage.getItem('playerMuted');
    const savedShuffle = localStorage.getItem('playerShuffle');
    const savedRepeat = localStorage.getItem('playerRepeat');
    const savedLikes = localStorage.getItem('likedSongs');
    
    if (savedVolume) setVolume(parseFloat(savedVolume));
    if (savedMuted) setIsMuted(savedMuted === 'true');
    if (savedShuffle) setIsShuffled(savedShuffle === 'true');
    if (savedRepeat) setRepeatMode(savedRepeat as RepeatMode);
    if (savedLikes) {
      try {
        setLikedSongs(new Set(JSON.parse(savedLikes)));
      } catch (e) {
        console.error('Error parsing liked songs:', e);
      }
    }
  }, []);

  // Only access search params after component is mounted to avoid hydration mismatch
  const title = mounted ? (searchParams.get('title') || 'O\'rmon Tovushlari') : 'O\'rmon Tovushlari';
  const subtitle = mounted ? (searchParams.get('subtitle') || 'Tabiat') : 'Tabiat';
  const fileId = mounted ? (searchParams.get('fileId') || '') : '';
  const cloudinaryUrl = mounted ? (searchParams.get('cloudinaryUrl') || '') : '';
  const localUrl = mounted ? (searchParams.get('localUrl') || '') : '';
  const r2Key = mounted ? (searchParams.get('r2Key') || '') : '';
  const r2PublicUrl = mounted ? (searchParams.get('r2PublicUrl') || '') : '';
  const autoPlay = mounted ? (searchParams.get('autoPlay') === 'true') : false;

  // Check if current song is liked
  useEffect(() => {
    const songId = `${title}-${subtitle}`;
    setIsLiked(likedSongs.has(songId));
  }, [title, subtitle, likedSongs]);

  // Priority: Cloudinary > R2 Public URL > Local > R2 (via API) > Google Drive
  const musicUrl = cloudinaryUrl || r2PublicUrl || localUrl || (r2Key ? `/api/r2/stream?key=${encodeURIComponent(r2Key)}` : '') || (fileId ? `/api/stream?id=${fileId}` : '');
  
  // Warn if using .weba format
  const isWebaFormat = musicUrl.includes('.weba') || r2Key?.endsWith('.weba');

  // Load playlist on mount
  useEffect(() => {
    const playlistStr = localStorage.getItem('playlist');
    if (playlistStr) {
      try {
        const loadedPlaylist = JSON.parse(playlistStr);
        setPlaylist(loadedPlaylist);
        console.log('Playlist loaded:', loadedPlaylist);
        
        // Generate shuffled order
        const order = loadedPlaylist.map((_: any, i: number) => i);
        shuffleArray(order);
        setShuffledOrder(order);
      } catch (e) {
        console.error('Error parsing playlist:', e);
      }
    }
  }, []);

  // Fisher-Yates shuffle
  const shuffleArray = (array: number[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Get current song index in playlist
  const getCurrentIndex = useCallback(() => {
    return playlist.findIndex((item) => 
      item.title === title && item.subtitle === subtitle
    );
  }, [playlist, title, subtitle]);

  // Navigate to a specific playlist item
  const navigateToSong = useCallback((item: PlaylistItem) => {
    const params = new URLSearchParams({
      title: item.title,
      subtitle: item.subtitle,
    });
    
    if (item.fileId) params.set('fileId', item.fileId);
    if (item.cloudinaryUrl) params.set('cloudinaryUrl', item.cloudinaryUrl);
    if (item.localUrl) params.set('localUrl', item.localUrl);
    if (item.r2Key) params.set('r2Key', item.r2Key);
    if (item.r2PublicUrl) params.set('r2PublicUrl', item.r2PublicUrl);
    params.set('autoPlay', 'true');

    window.location.href = `/player?${params.toString()}`;
  }, []);

  const playNext = useCallback(() => {
    if (playlist.length === 0) {
      alert('Pleylist topilmadi. Iltimos, avval bosh sahifadan qo\'shiq tanlang.');
      return;
    }

    const currentIndex = getCurrentIndex();
    
    if (currentIndex === -1) {
      alert(`Joriy qo\'shiq pleylistda topilmadi.`);
      return;
    }

    let nextIndex: number;
    
    if (isShuffled) {
      const currentShuffledPos = shuffledOrder.indexOf(currentIndex);
      const nextShuffledPos = (currentShuffledPos + 1) % shuffledOrder.length;
      nextIndex = shuffledOrder[nextShuffledPos];
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    // If repeat is off and we're at the end, don't wrap around
    if (repeatMode === 'off' && !isShuffled && currentIndex === playlist.length - 1) {
      alert('Pleylist tugadi');
      return;
    }

    navigateToSong(playlist[nextIndex]);
  }, [playlist, getCurrentIndex, isShuffled, shuffledOrder, repeatMode, navigateToSong]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) {
      alert('Pleylist topilmadi. Iltimos, avval bosh sahifadan qo\'shiq tanlang.');
      return;
    }

    const currentIndex = getCurrentIndex();
    
    if (currentIndex === -1) {
      alert(`Joriy qo\'shiq pleylistda topilmadi.`);
      return;
    }

    // If we're more than 3 seconds in, restart the current song
    if (currentTime > 3) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        setCurrentTime(0);
        setProgress(0);
      }
      return;
    }

    let prevIndex: number;
    
    if (isShuffled) {
      const currentShuffledPos = shuffledOrder.indexOf(currentIndex);
      const prevShuffledPos = (currentShuffledPos - 1 + shuffledOrder.length) % shuffledOrder.length;
      prevIndex = shuffledOrder[prevShuffledPos];
    } else {
      prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }

    // If repeat is off and we're at the beginning, don't wrap around
    if (repeatMode === 'off' && !isShuffled && currentIndex === 0) {
      // Just restart current song
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        setCurrentTime(0);
        setProgress(0);
      }
      return;
    }

    navigateToSong(playlist[prevIndex]);
  }, [playlist, getCurrentIndex, isShuffled, shuffledOrder, repeatMode, currentTime, navigateToSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !musicUrl) return;

    // Cancel any pending play promise before loading new audio
    if (playPromiseRef.current) {
      playPromiseRef.current.catch(() => {});
      playPromiseRef.current = null;
    }

    // Reset audio when URL changes
    audio.pause();
    audio.load();
    
    // Set volume
    audio.volume = isMuted ? 0 : volume;
    
    // Test if the URL is accessible
    fetch(musicUrl)
      .then(async response => {
        const contentType = response.headers.get('content-type') || '';
        console.log('Audio URL check:', {
          url: musicUrl,
          status: response.status,
          contentType,
          ok: response.ok
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          setError(`Xato ${response.status}: ${errorData.error || 'Faylni yuklash amalga oshmadi.'}`);
        } else {
          if (contentType.includes('text/html') || contentType.includes('application/json')) {
            setError('Fayl mavjud emas. Iltimos, sozlamalarni tekshiring.');
          }
        }
      })
      .catch(err => {
        console.error('Failed to check audio URL:', err);
        setError('Tarmoq xatosi. Iltimos, internet aloqangizni tekshiring.');
      });

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      
      // Handle repeat modes
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().then(() => setIsPlaying(true)).catch(console.error);
      } else {
        playNext();
      }
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    const handleError = () => {
      setIsLoading(false);
      const audioError = audio.error;
      let errorMessage = 'Audioni yuklashda xatolik.';
      
      if (audioError) {
        const errorCode = audioError.code;
        const errorMessages: { [key: number]: string } = {
          1: 'Media to\'xtatildi',
          2: 'Tarmoq xatosi - internet aloqangizni tekshiring',
          3: 'Dekodlash xatosi - fayl formati qo\'llab-quvvatlanmasligi mumkin',
          4: 'Manba qo\'llab-quvvatlanmaydi - brauzer bu formatni ijro eta olmaydi',
        };
        errorMessage = errorMessages[errorCode] || `Xato kodi ${errorCode}`;
      }
      
      setError(errorMessage);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [musicUrl, repeatMode, playNext]);

  // Auto-play when page loads with autoPlay=true
  useEffect(() => {
    if (!autoPlay || !musicUrl) return;
    
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(true);
    
    const playWhenReady = () => {
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {});
        playPromiseRef.current = null;
      }
      
      const playPromise = audio.play();
      playPromiseRef.current = playPromise;
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          playPromiseRef.current = null;
        })
        .catch((err) => {
          console.error('Auto-play failed:', err);
          setIsLoading(false);
          playPromiseRef.current = null;
        });
    };

    if (audio.readyState >= 2) {
      playWhenReady();
    } else {
      const handleCanPlayForAutoPlay = () => playWhenReady();
      audio.addEventListener('canplay', handleCanPlayForAutoPlay, { once: true });
      
      return () => {
        audio.removeEventListener('canplay', handleCanPlayForAutoPlay);
      };
    }
  }, [autoPlay, musicUrl]);

  // Update audio volume when volume state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
    // Save to localStorage
    localStorage.setItem('playerVolume', volume.toString());
    localStorage.setItem('playerMuted', isMuted.toString());
  }, [volume, isMuted]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('playerShuffle', isShuffled.toString());
  }, [isShuffled]);

  useEffect(() => {
    localStorage.setItem('playerRepeat', repeatMode);
  }, [repeatMode]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !musicUrl) return;

    try {
      if (isPlaying) {
        if (playPromiseRef.current) {
          playPromiseRef.current.catch(() => {});
          playPromiseRef.current = null;
        }
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        if (playPromiseRef.current) {
          playPromiseRef.current.catch(() => {});
          playPromiseRef.current = null;
        }
        const playPromise = audio.play();
        playPromiseRef.current = playPromise;
        await playPromise;
        setIsPlaying(true);
        setIsLoading(false);
        playPromiseRef.current = null;
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsLoading(false);
      playPromiseRef.current = null;
    }
  };

  const handleProgressClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const wasPlaying = isPlaying;

    if (playPromiseRef.current) {
      playPromiseRef.current.catch(() => {});
      playPromiseRef.current = null;
    }

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage * 100);

    if (wasPlaying) {
      try {
        const playPromise = audio.play();
        playPromiseRef.current = playPromise;
        await playPromise;
        setIsPlaying(true);
        playPromiseRef.current = null;
      } catch (error) {
        console.error('Error resuming playback:', error);
        playPromiseRef.current = null;
      }
    }
  };

  const skipForward = (seconds: number) => {
    const audio = audioRef.current;
    if (audio && duration) {
      audio.currentTime = Math.min(duration, audio.currentTime + seconds);
    }
  };

  const skipBackward = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - seconds);
    }
  };

  const toggleShuffle = () => {
    if (!isShuffled) {
      // Generate new shuffled order when enabling shuffle
      const order = playlist.map((_, i) => i);
      shuffleArray(order);
      setShuffledOrder(order);
    }
    setIsShuffled(!isShuffled);
  };

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const toggleLike = () => {
    const songId = `${title}-${subtitle}`;
    const newLikedSongs = new Set(likedSongs);
    
    if (isLiked) {
      newLikedSongs.delete(songId);
    } else {
      newLikedSongs.add(songId);
    }
    
    setLikedSongs(newLikedSongs);
    setIsLiked(!isLiked);
    localStorage.setItem('likedSongs', JSON.stringify([...newLikedSongs]));
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen w-full bg-[#0B1026] text-white flex flex-col font-sans relative overflow-hidden items-center justify-center">
        <div className="text-slate-400">Yuklanmoqda...</div>
      </div>
    );
  }

  const currentIndex = getCurrentIndex();

  return (
    <div className="min-h-screen w-full bg-[#0B1026] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* Hidden Audio Element */}
      {musicUrl && (
        <audio 
          ref={audioRef} 
          src={musicUrl} 
          preload="auto"
          crossOrigin="anonymous"
          playsInline
        >
          Your browser does not support the audio element.
        </audio>
      )}
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full blur-[100px] transition-all duration-1000"
          style={{ 
            background: isPlaying 
              ? 'radial-gradient(circle, rgba(238,125,70,0.15) 0%, rgba(124,122,243,0.1) 50%, transparent 70%)' 
              : 'radial-gradient(circle, rgba(124,122,243,0.1) 0%, transparent 70%)',
            transform: `translate(-50%, ${isPlaying ? '-5%' : '0'}) scale(${isPlaying ? 1.1 : 1})`
          }}
        />
        <div 
          className="absolute bottom-[10%] right-[10%] w-[60vw] h-[60vw] bg-[#2EB068]/10 rounded-full blur-[80px] transition-all duration-1000"
          style={{ opacity: isPlaying ? 0.8 : 0.4 }}
        />
        
        {/* Animated particles when playing */}
        {isPlaying && (
          <>
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400/30 rounded-full animate-ping" />
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-violet-400/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-emerald-400/30 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full min-h-screen flex flex-col items-center">
        
        {/* Header */}
        <header className="w-full max-w-md flex justify-between items-center px-6 py-5">
          <Link href="/dashboard">
            <button className="w-11 h-11 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95">
              <ChevronLeft className="w-5 h-5 text-white/80" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Ijro Qilinmoqda</span>
            {isPlaying && (
              <div className="flex items-center gap-0.5">
                <div className="w-0.5 h-3 bg-orange-400 rounded-full animate-pulse" />
                <div className="w-0.5 h-4 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-0.5 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowPlaylist(true)}
            className="w-11 h-11 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95"
          >
            <ListMusic className="w-5 h-5 text-white/80" />
          </button>
        </header>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center px-6 py-4">
          <div className="relative w-[70vw] max-w-[280px] aspect-square">
            {/* Outer glow ring */}
            <div 
              className="absolute inset-[-8px] rounded-full transition-all duration-700"
              style={{ 
                background: isPlaying 
                  ? 'conic-gradient(from 0deg, #EE7D46, #F29E75, #EE7D46, transparent, #EE7D46)' 
                  : 'transparent',
                opacity: isPlaying ? 0.3 : 0,
                animation: isPlaying ? 'spin 8s linear infinite' : 'none'
              }}
            />
            
            {/* Main disc */}
            <div 
              className="relative w-full h-full rounded-full bg-gradient-to-br from-[#1a2240] to-[#0d1225] flex items-center justify-center overflow-hidden"
              style={{
                boxShadow: isPlaying 
                  ? '0 25px 50px -12px rgba(238,125,70,0.25), inset 0 1px 0 rgba(255,255,255,0.1)' 
                  : '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                animation: isPlaying ? 'spin 20s linear infinite' : 'none'
              }}
            >
              {/* Vinyl grooves effect */}
              <div className="absolute inset-0 rounded-full" style={{ 
                background: 'repeating-radial-gradient(circle at 50% 50%, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)'
              }} />
              
              {/* Inner circle with image */}
              <div className="w-[65%] h-[65%] rounded-full overflow-hidden relative border-4 border-[#0B1026]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1C2340] to-[#0B1026]" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-70" />
                
                {/* Center hole */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#0B1026] rounded-full border border-white/10" />
              </div>
            </div>
            
            {/* Play indicator light */}
            <div 
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full transition-all duration-500"
              style={{ 
                background: isPlaying ? '#EE7D46' : '#374151',
                boxShadow: isPlaying ? '0 0 20px #EE7D46, 0 0 40px rgba(238,125,70,0.5)' : 'none'
              }}
            />
          </div>
        </div>

        {/* Info & Controls Container */}
        <div className="w-full max-w-md px-6 pb-8 space-y-6">
          
          {/* Song Info */}
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate tracking-tight">{title}</h1>
              <p className="text-white/50 text-sm mt-0.5 truncate">{subtitle}</p>
            </div>
            <button 
              onClick={toggleLike}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isLiked 
                  ? 'bg-rose-500/20 text-rose-400 scale-110' 
                  : 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10'
              }`}
            >
              <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div 
              ref={progressBarRef}
              className="relative w-full h-1.5 bg-white/10 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              {/* Buffer indicator */}
              <div className="absolute left-0 top-0 h-full bg-white/5 rounded-full" style={{ width: '100%' }} />
              
              {/* Progress */}
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#EE7D46] to-[#F29E75] rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
              
              {/* Thumb */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/40 font-medium tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Shuffle */}
            <button 
              onClick={toggleShuffle}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isShuffled 
                  ? 'bg-orange-500/20 text-orange-400' 
                  : 'bg-transparent text-white/40 hover:text-white/70'
              }`}
              title="Aralashtirish (S)"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button 
              onClick={playPrevious}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
              title="Oldingi (Shift+←)"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            
            {/* Play/Pause */}
            <button 
              onClick={togglePlay}
              disabled={!musicUrl}
              className={`w-18 h-18 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 ${
                !musicUrl 
                  ? 'bg-gray-700 opacity-50 cursor-not-allowed' 
                  : isPlaying
                    ? 'bg-white/10 hover:bg-white/15 border border-white/20'
                    : 'bg-gradient-to-br from-[#EE7D46] to-[#E85D20]'
              }`}
              style={{ 
                width: '72px', 
                height: '72px',
                boxShadow: !isPlaying && musicUrl ? '0 8px 32px rgba(238,125,70,0.4)' : 'none'
              }}
              title="Ijro/To'xtatish (Probel)"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7 ml-1" />
              )}
            </button>
            
            {/* Next */}
            <button 
              onClick={playNext}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
              title="Keyingi (Shift+→)"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat */}
            <button 
              onClick={cycleRepeatMode}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                repeatMode !== 'off'
                  ? 'bg-orange-500/20 text-orange-400' 
                  : 'bg-transparent text-white/40 hover:text-white/70'
              }`}
              title="Takrorlash (R)"
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
              <p className="text-red-400 text-sm">{error}</p>
              {error.includes('qo\'llab-quvvatlanmaydi') && isWebaFormat && (
                <p className="text-yellow-400/70 text-xs mt-2">
                  💡 .weba formati qo\'llab-quvvatlanmaydi. MP3 formatiga o\'tkazing.
                </p>
              )}
            </div>
          )}

          {/* No music message */}
          {!musicUrl && !error && (
            <div className="text-center py-4">
              <p className="text-white/30 text-sm">Audio fayl mavjud emas</p>
            </div>
          )}
        </div>
      </div>

      {/* Playlist Drawer */}
      {showPlaylist && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPlaylist(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-gradient-to-b from-[#1a2240] to-[#0B1026] rounded-t-3xl overflow-hidden animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h2 className="text-lg font-semibold text-white">Pleylist</h2>
              <button 
                onClick={() => setShowPlaylist(false)}
                className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Playlist Items */}
            <div className="px-4 pb-8 overflow-y-auto max-h-[calc(70vh-80px)]">
              {playlist.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm">Pleylistda qo'shiqlar yo'q</p>
                  <Link href="/dashboard" className="text-orange-400 text-sm mt-2 inline-block hover:underline">
                    Musiqalarni ko'rish →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {playlist.map((item, index) => {
                    const isCurrentSong = item.title === title && item.subtitle === subtitle;
                    const isSongLiked = likedSongs.has(`${item.title}-${item.subtitle}`);
                    
                    return (
                      <button
                        key={item.id || index}
                        onClick={() => navigateToSong(item)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                          isCurrentSong 
                            ? 'bg-orange-500/20 border border-orange-500/30' 
                            : 'bg-white/5 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        {/* Index/Playing indicator */}
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          {isCurrentSong && isPlaying ? (
                            <div className="flex items-center gap-0.5">
                              <div className="w-0.5 h-2 bg-orange-400 rounded-full animate-pulse" />
                              <div className="w-0.5 h-3 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                              <div className="w-0.5 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                            </div>
                          ) : (
                            <span className={`text-xs font-medium ${isCurrentSong ? 'text-orange-400' : 'text-white/30'}`}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        
                        {/* Song info */}
                        <div className="flex-1 text-left min-w-0">
                          <p className={`text-sm font-medium truncate ${isCurrentSong ? 'text-orange-400' : 'text-white'}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-white/40 truncate">{item.subtitle}</p>
                        </div>
                        
                        {/* Like indicator */}
                        {isSongLiked && (
                          <Heart className="w-4 h-4 text-rose-400 fill-current flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}

export default function Player() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#0B1026] text-white flex flex-col font-sans relative overflow-hidden items-center justify-center">
        <div className="text-slate-400">Yuklanmoqda...</div>
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Menu, SkipBack, Play, Pause, SkipForward } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Player() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || 'Forest Sounds';
  const subtitle = searchParams.get('subtitle') || 'Nature';
  const fileId = searchParams.get('fileId') || '';
  const cloudinaryUrl = searchParams.get('cloudinaryUrl') || '';
  const localUrl = searchParams.get('localUrl') || '';
  const r2Key = searchParams.get('r2Key') || '';
  const r2PublicUrl = searchParams.get('r2PublicUrl') || '';
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Priority: Cloudinary > R2 Public URL > Local > R2 (via API) > Google Drive
  // Note: .weba format may not be supported by all browsers - consider converting to MP3
  const musicUrl = cloudinaryUrl || r2PublicUrl || localUrl || (r2Key ? `/api/r2/stream?key=${encodeURIComponent(r2Key)}` : '') || (fileId ? `/api/stream?id=${fileId}` : '');
  
  // Warn if using .weba format
  const isWebaFormat = musicUrl.includes('.weba') || r2Key?.endsWith('.weba');

  // Debug: Log playlist on mount
  useEffect(() => {
    const playlistStr = localStorage.getItem('playlist');
    if (playlistStr) {
      try {
        const playlist = JSON.parse(playlistStr);
        console.log('Playlist loaded:', playlist);
        console.log('Current song:', { title, subtitle });
      } catch (e) {
        console.error('Error parsing playlist:', e);
      }
    } else {
      console.warn('No playlist in localStorage');
    }
  }, []);

  const playNext = () => {
    console.log('playNext called');
    try {
      const playlistStr = localStorage.getItem('playlist');
      console.log('Playlist from localStorage:', playlistStr);
      
      if (!playlistStr) {
        console.warn('No playlist found in localStorage');
        alert('No playlist found. Please select a song from the dashboard first.');
        return;
      }

      const playlist = JSON.parse(playlistStr);
      console.log('Parsed playlist:', playlist);
      
      if (!Array.isArray(playlist) || playlist.length === 0) {
        console.warn('Playlist is empty or invalid');
        alert('Playlist is empty. Please select a song from the dashboard first.');
        return;
      }

      // Find current song by matching title and subtitle
      const currentIndex = playlist.findIndex((item: any) => 
        item.title === title && item.subtitle === subtitle
      );

      console.log('Current song search:', { 
        title, 
        subtitle, 
        currentIndex, 
        playlistLength: playlist.length,
        playlistItems: playlist.map((item: any) => ({ title: item.title, subtitle: item.subtitle }))
      });

      if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
        const nextItem = playlist[currentIndex + 1];
        console.log('Next item:', nextItem);
        
        const params = new URLSearchParams({
          title: nextItem.title,
          subtitle: nextItem.subtitle,
        });
        
        // Add optional parameters only if they exist
        if (nextItem.fileId) params.set('fileId', nextItem.fileId);
        if (nextItem.cloudinaryUrl) params.set('cloudinaryUrl', nextItem.cloudinaryUrl);
        if (nextItem.localUrl) params.set('localUrl', nextItem.localUrl);
        if (nextItem.r2Key) params.set('r2Key', nextItem.r2Key);
        if (nextItem.r2PublicUrl) params.set('r2PublicUrl', nextItem.r2PublicUrl);

        const newUrl = `/player?${params.toString()}`;
        console.log('Navigating to:', newUrl);
        window.location.href = newUrl;
      } else if (currentIndex === -1) {
        console.warn('Current song not found in playlist');
        alert(`Current song "${title} - ${subtitle}" not found in playlist. Please select a song from the dashboard first.`);
      } else {
        console.log('Already at the last song');
        alert('You are already at the last song in the playlist.');
      }
    } catch (error) {
      console.error('Error playing next song:', error);
      alert('Error playing next song. Check console for details.');
    }
  };

  const playPrevious = () => {
    console.log('playPrevious called');
    try {
      const playlistStr = localStorage.getItem('playlist');
      
      if (!playlistStr) {
        console.warn('No playlist found in localStorage');
        alert('No playlist found. Please select a song from the dashboard first.');
        return;
      }

      const playlist = JSON.parse(playlistStr);
      
      if (!Array.isArray(playlist) || playlist.length === 0) {
        console.warn('Playlist is empty or invalid');
        alert('Playlist is empty. Please select a song from the dashboard first.');
        return;
      }

      // Find current song by matching title and subtitle
      const currentIndex = playlist.findIndex((item: any) => 
        item.title === title && item.subtitle === subtitle
      );

      if (currentIndex !== -1 && currentIndex > 0) {
        const prevItem = playlist[currentIndex - 1];
        console.log('Previous item:', prevItem);
        
        const params = new URLSearchParams({
          title: prevItem.title,
          subtitle: prevItem.subtitle,
        });
        
        // Add optional parameters only if they exist
        if (prevItem.fileId) params.set('fileId', prevItem.fileId);
        if (prevItem.cloudinaryUrl) params.set('cloudinaryUrl', prevItem.cloudinaryUrl);
        if (prevItem.localUrl) params.set('localUrl', prevItem.localUrl);
        if (prevItem.r2Key) params.set('r2Key', prevItem.r2Key);
        if (prevItem.r2PublicUrl) params.set('r2PublicUrl', prevItem.r2PublicUrl);

        const newUrl = `/player?${params.toString()}`;
        console.log('Navigating to:', newUrl);
        window.location.href = newUrl;
      } else if (currentIndex === -1) {
        console.warn('Current song not found in playlist');
        alert(`Current song "${title} - ${subtitle}" not found in playlist. Please select a song from the dashboard first.`);
      } else {
        console.log('Already at the first song');
        alert('You are already at the first song in the playlist.');
      }
    } catch (error) {
      console.error('Error playing previous song:', error);
      alert('Error playing previous song. Check console for details.');
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !musicUrl) return;

    // Reset audio when URL changes
    audio.load();
    
    // Test if the URL is accessible and log details
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
          setError(`Error ${response.status}: ${errorData.error || 'Failed to load file. Make sure your R2 configuration is correct.'}`);
        } else {
          // Check if it's audio or binary (audio files might be octet-stream)
          if (contentType.includes('text/html') || contentType.includes('application/json')) {
            setError('File is not accessible. Please check your R2 configuration and file key.');
          } else if (!contentType.includes('audio') && !musicUrl.includes('.mp3')) {
            console.warn('Content-Type might not be audio:', contentType);
          }
        }
      })
      .catch(err => {
        console.error('Failed to check audio URL:', err);
        setError('Network error. Please check your connection and R2 configuration.');
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
      // Auto-play next song when current song ends
      playNext();
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };
    const handleError = () => {
      setIsLoading(false);
      const audioError = audio.error;
      let errorMessage = 'Failed to load audio.';
      
      if (audioError) {
        const errorCode = audioError.code;
        const errorMessages: { [key: number]: string } = {
          1: 'Media aborted',
          2: 'Network error - check your connection',
          3: 'Decode error - file format may not be supported by your browser',
          4: 'Source not supported - your browser cannot play this audio format',
        };
        const codeMessage = errorMessages[errorCode] || `Error code ${errorCode}`;
        errorMessage = `${codeMessage}.`;
        
        // Add helpful hints based on source URL
        if (musicUrl.includes('/api/r2/stream')) {
          if (musicUrl.includes('.weba') || r2Key?.endsWith('.weba')) {
            errorMessage += ' The .weba format is not widely supported. Please convert your file to MP3 or enable R2 public access.';
          } else {
            errorMessage += ' Check your R2 configuration and file key.';
          }
        } else if (musicUrl.includes('/api/stream')) {
          errorMessage += ' Make sure the file is shared publicly on Google Drive.';
        } else if (musicUrl.includes('cloudinary.com')) {
          errorMessage += ' Check your Cloudinary URL.';
        } else if (musicUrl.startsWith('/')) {
          errorMessage += ' Check that the local file exists.';
        }
      } else {
        errorMessage = 'Failed to load audio. Please check the file URL and try again.';
      }
      
      setError(errorMessage);
      if (audioError) {
        console.error('Audio error:', {
          code: audioError.code,
          message: audioError.message,
          url: musicUrl,
          format: r2Key || 'unknown',
          MEDIA_ERR_ABORTED: 1,
          MEDIA_ERR_NETWORK: 2,
          MEDIA_ERR_DECODE: 3,
          MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
        });
      }
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
  }, [musicUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !musicUrl) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsLoading(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1026] text-white flex flex-col font-sans relative overflow-hidden items-center justify-center">
      
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
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-[#7C7AF3]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[60vw] h-[60vw] bg-[#2EB068]/10 rounded-full blur-[80px]"></div>
      </div>

      {/* Main Content Container - Compact for Draggable/Modal feel */}
      <div className="relative z-10 w-full max-w-md h-full max-h-[90vh] flex flex-col items-center justify-between px-6 pb-8">
        
        {/* Header - Compact */}
        <header className="w-full flex justify-between items-center py-4">
          <Link href="/dashboard">
             <button className="w-10 h-10 bg-[#1C2340] hover:bg-[#252d4d] rounded-full flex items-center justify-center transition-colors shadow-lg shadow-black/20">
               <ChevronLeft className="w-5 h-5 text-white" />
             </button>
          </Link>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Playing Now</span>
          <button className="w-10 h-10 bg-[#1C2340] hover:bg-[#252d4d] rounded-full flex items-center justify-center transition-colors shadow-lg shadow-black/20">
            <Menu className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* Album Art - Scaled Down */}
        <div className="relative w-[60vw] max-w-[240px] aspect-square rounded-full bg-[#151b33] flex items-center justify-center shadow-[15px_15px_40px_#050813,-15px_-15px_40px_#111839] my-4">
           {/* Inner circle for depth */}
           <div className="absolute inset-2 rounded-full border border-white/5"></div>
           
           {/* Image Placeholder / Gradient */}
           <div className="w-[90%] h-[90%] rounded-full overflow-hidden relative" style={{ animation: isPlaying ? 'spin 10s linear infinite' : 'none' }}>
             <div className="absolute inset-0 bg-gradient-to-br from-[#1C2340] to-[#0B1026]"></div>
             {/* Abstract visual */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
             </div>
           </div>

        </div>

        {/* Info - Compact */}
        <div className="text-center space-y-1 mt-4">
          <h1 className="text-2xl font-bold text-white tracking-wide">{title}</h1>
          <p className="text-slate-400 text-base">{subtitle}</p>
        </div>

        {/* Progress - Compact */}
        <div className="w-full mt-6 space-y-2">
          <div 
            className="relative w-full h-1 bg-[#1C2340] rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#EE7D46] to-[#F29E75] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            >
              {/* Thumb */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-[#EE7D46] rounded-full shadow-[0_0_8px_#EE7D46] ring-2 ring-[#0B1026]"></div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls - Compact */}
        <div className="flex items-center justify-between w-full max-w-[240px] mt-6">
          <button 
            onClick={playPrevious}
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors bg-[#0B1026] shadow-[-4px_-4px_8px_#161f47,4px_4px_8px_#000105] active:shadow-inset"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay}
            disabled={!musicUrl}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white bg-[#EE7D46] shadow-[0_8px_25px_rgba(238,125,70,0.4)] hover:bg-[#f08e5e] hover:scale-105 active:scale-95 transition-all ${!musicUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>
          
          <button 
            onClick={playNext}
            className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors bg-[#0B1026] shadow-[-4px_-4px_8px_#161f47,4px_4px_8px_#000105] active:shadow-inset"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-400 text-xs mt-4 text-center px-4 space-y-2">
            <p>{error}</p>
            {error.includes('Source not supported') && isWebaFormat && (
              <p className="text-yellow-400 text-[10px] mt-2">
                💡 Tip: .weba format is not supported by your browser. Convert the file to MP3 or enable R2 public access for better compatibility.
              </p>
            )}
          </div>
        )}

        {/* No music message */}
        {!musicUrl && !error && (
          <p className="text-slate-500 text-xs mt-4">No audio file available</p>
        )}

      </div>
    </div>
  );
}

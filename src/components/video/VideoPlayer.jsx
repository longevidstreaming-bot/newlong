
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function VideoPlayer({ src, poster, className = "" }) {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const [showControls, setShowControls] = useState(true);
  const [hideControlsTimeout, setHideControlsTimeout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when video source changes
  useEffect(() => {
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || isLoading) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(e => console.error("Erro ao dar play:", e));
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, isLoading]);

  const handleSeek = (value) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (!video.muted) {
        setVolume(video.volume);
    }
  };

  const toggleFullscreen = useCallback(async () => {
    const container = playerContainerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Erro ao alternar fullscreen:', error);
    }
  }, []);
  
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const formatTime = (time) => {
    if (isNaN(time) || time < 0) return "0:00";
    
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!duration || duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout) clearTimeout(hideControlsTimeout);
    setHideControlsTimeout(setTimeout(() => setShowControls(false), 3000));
  };
  
  const handleMouseLeave = () => {
    if (isPlaying) {
       if (hideControlsTimeout) clearTimeout(hideControlsTimeout);
       setShowControls(false);
    }
  };

  return (
    <div
      ref={playerContainerRef}
      className={`relative w-full h-full bg-[#121212] ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      />

      {isLoading && (
        <div className="absolute inset-0 bg-[#121212]/80 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-[#7B61FF] animate-spin" />
        </div>
      )}

      {/* Big Play Button in Center */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-[#1E1E2F]/80 backdrop-blur-sm text-white hover:bg-[#7B61FF]/30 border border-[#2C2C3E] pointer-events-auto transition-all duration-300 hover:scale-105"
                style={{ boxShadow: '0 8px 25px rgba(123, 97, 255, 0.3)' }}
            >
                <Play className="w-10 h-10 ml-1" />
            </Button>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="flex flex-col gap-3">
          {/* Timeline Slider */}
          <div className="w-full">
            <Slider
              value={[getProgressPercentage()]}
              onValueChange={handleSeek}
              className="w-full cursor-pointer [&>span:first-child]:h-2 [&>span:first-child]:bg-[#2C2C3E] [&_[role=slider]]:bg-[#7B61FF] [&_[role=slider]]:border-[#7B61FF] [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&>span:first-child>span]:bg-[#7B61FF]"
            />
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={togglePlay}
                className="text-white hover:bg-[#7B61FF]/20 hover:text-[#7B61FF] rounded-full transition-all duration-200"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMute}
                  className="text-white hover:bg-[#7B61FF]/20 hover:text-[#7B61FF] rounded-full transition-all duration-200"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-[#2C2C3E] [&_[role=slider]]:bg-[#7B61FF] [&_[role=slider]]:border-[#7B61FF] [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&>span:first-child>span]:bg-[#7B61FF]"
                  />
                </div>
              </div>
              
              <span className="text-sm font-mono text-[#B0B0B0] bg-[#1E1E2F]/50 px-3 py-1 rounded-full backdrop-blur-sm border border-[#2C2C3E]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white hover:bg-[#7B61FF]/20 hover:text-[#7B61FF] rounded-full transition-all duration-200"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1E1E2F] border-[#2C2C3E] text-white">
                  <DropdownMenuItem 
                    onClick={() => setQuality('1080p')}
                    className="hover:bg-[#7B61FF]/20 focus:bg-[#7B61FF]/20"
                  >
                    1080p {quality === '1080p' && <span className="text-[#7B61FF] ml-2">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setQuality('720p')}
                    className="hover:bg-[#7B61FF]/20 focus:bg-[#7B61FF]/20"
                  >
                    720p {quality === '720p' && <span className="text-[#7B61FF] ml-2">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setQuality('480p')}
                    className="hover:bg-[#7B61FF]/20 focus:bg-[#7B61FF]/20"
                  >
                    480p {quality === '480p' && <span className="text-[#7B61FF] ml-2">✓</span>}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleFullscreen}
                className="text-white hover:bg-[#7B61FF]/20 hover:text-[#7B61FF] rounded-full transition-all duration-200"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

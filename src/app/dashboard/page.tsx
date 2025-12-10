"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { 
  Settings2, 
  Bell, 
  Moon, 
  Wind, 
  Play, 
  Flower, 
  Command,
  Heart,
  Music,
  Zap,
  CloudRain
} from "lucide-react";

type Category = 'Healing' | 'Trending' | 'Sleeping' | 'Top' | 'Music' | 'Relaxation';

interface Item {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
  category: Category;
  driveFileId?: string; // Google Drive file ID
  cloudinaryUrl?: string; // Cloudinary direct URL (better for large files)
  localUrl?: string; // Local file path in public folder (e.g., '/music/track.mp3')
  r2Key?: string; // Cloudflare R2 object key (e.g., 'relax.weba')
  r2PublicUrl?: string; // Direct R2 public URL (if public access enabled)
}

const categoryLabels: Record<Category, string> = {
  'Healing': 'Dam olish',
  'Trending': 'Miya charchaganda',
  'Sleeping': 'Baxt yetmasligida',
  'Top': 'Nafas olishni yaxshilash',
  'Music': 'Qoirin orishini toxtatish',
  'Relaxation': 'Hotirjamlik olish'
};

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState<Category>('Healing');
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasDraggedRef = useRef(false);

  const categories: Category[] = ['Healing', 'Trending', 'Sleeping', 'Top', 'Music', 'Relaxation'];

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset after a short delay to allow click handler to check it
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 100);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 100);
  };

  const items: Item[] = [
    // Trending Items
    {
      id: '1',
      title: 'Freedom Esp',
      subtitle: 'Motivation',
      icon: <Flower className="w-7 h-7" />,
      colorClass: 'bg-blue-100',
      category: 'Trending',
      r2Key: 'videoplayback.mp3' // Cloudflare R2 object key
    },
    {
      id: '2',
      title: 'Running Hill',
      subtitle: 'Music',
      icon: <Command className="w-7 h-7" />,
      colorClass: 'bg-pink-100',
      category: 'Trending',
      driveFileId: '' // Add your Google Drive file ID here
    },
     // Healing Items
    {
      id: '3',
      title: 'Forest Sounds',
      subtitle: 'Nature',
      icon: <Wind className="w-7 h-7" />,
      colorClass: 'bg-green-100',
      category: 'Healing',
      r2Key: 'relax (mp3cut.net).mp3' // Cloudflare R2 object key
    },
    {
      id: '4',
      title: 'Crystal Mind',
      subtitle: 'Meditation',
      icon: <Zap className="w-7 h-7" />,
      colorClass: 'bg-purple-100',
      category: 'Healing',
      r2Key: 'Healing - Tibetan Meditative Ambient Music - Beautiful Ethereal Relaxing Music.mp3' // Cloudflare R2 object key
    },
    // Sleeping Items
    {
      id: '5',
      title: 'Night Rain',
      subtitle: 'Sleep',
      icon: <CloudRain className="w-7 h-7" />,
      colorClass: 'bg-indigo-100',
      category: 'Sleeping',
      r2Key: 'videoplayback (1).mp3' // Cloudflare R2 object key
    },
    {
      id: '6',
      title: 'Deep Dream',
      subtitle: 'Sleep',
      icon: <Moon className="w-7 h-7" />,
      colorClass: 'bg-blue-100',
      category: 'Sleeping',
      driveFileId: '' // Add your Google Drive file ID here
    },
    // Top Items
    {
      id: '7',
      title: 'Morning Yoga',
      subtitle: 'Exercise',
      icon: <Heart className="w-7 h-7" />,
      colorClass: 'bg-orange-100',
      category: 'Top',
      r2Key: 'Sinus Relief Music_ Healing Frequency for Nasal Congestion.mp3' // Cloudflare R2 object key
    },
    // Music Items
    {
      id: '8',
      title: 'Lo-Fi Study',
      subtitle: 'Focus',
      icon: <Music className="w-7 h-7" />,
      colorClass: 'bg-yellow-100',
      category: 'Music',
      r2Key: 'YTDown.com_YouTube_Gastritis-Healing-Frequency-Gas-Relief-&_Music.mp3' // Cloudflare R2 object key
    },
    // Relaxation Items
    {
      id: '10',
      title: 'Peaceful Mind',
      subtitle: 'Relaxation',
      icon: <Flower className="w-7 h-7" />,
      colorClass: 'bg-teal-100',
      category: 'Relaxation',
      r2Key: 'relax (mp3cut.net).mp3' // Cloudflare R2 object key
    },
    {
      id: '11',
      title: 'Calm Waters',
      subtitle: 'Meditation',
      icon: <Wind className="w-7 h-7" />,
      colorClass: 'bg-cyan-100',
      category: 'Relaxation',
      r2Key: 'Healing - Tibetan Meditative Ambient Music - Beautiful Ethereal Relaxing Music.mp3' // Cloudflare R2 object key
    }
  ];

  const filteredItems = items.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen w-full bg-[#0B1026] text-white p-6 font-sans">
      
      {/* Greeting */}
      <div className="mb-8 mt-4">
        <h1 className="text-4xl font-normal text-white/90">Hello,</h1>
        <h1 className="text-4xl font-semibold text-white">Steward</h1>
      </div>

      {/* Categories */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`flex gap-6 overflow-x-auto pb-4 mb-6 no-scrollbar scroll-smooth touch-pan-x snap-x snap-mandatory px-1 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {categories.map((category, index) => (
          <button 
            key={category}
            onClick={(e) => {
              // Prevent click if we were dragging
              if (hasDraggedRef.current) {
                e.preventDefault();
                return;
              }
              setActiveCategory(category);
            }}
            className={`text-base whitespace-nowrap pb-2 px-1 transition-all snap-start touch-manipulation min-w-fit ${
              index === 0 ? 'ml-0' : ''
            } ${
              index === categories.length - 1 ? 'mr-0' : ''
            } ${
              activeCategory === category 
                ? 'text-[#EE7D46] border-b-2 border-[#EE7D46] font-medium' 
                : 'text-slate-400 font-normal hover:text-white active:text-white'
            }`}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>

      {/* Filtered List Section */}
      <div className="flex flex-col gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-[#1C2340] rounded-3xl hover:bg-[#252d4d] transition-colors group animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${item.colorClass} rounded-2xl flex items-center justify-center text-[#0B1026]`}>
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-base">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.subtitle}</p>
              </div>
            </div>
            <Link href={`/player?title=${encodeURIComponent(item.title)}&subtitle=${encodeURIComponent(item.subtitle)}&fileId=${item.driveFileId || ''}&cloudinaryUrl=${encodeURIComponent(item.cloudinaryUrl || '')}&localUrl=${encodeURIComponent(item.localUrl || '')}&r2Key=${encodeURIComponent(item.r2Key || '')}&r2PublicUrl=${encodeURIComponent(item.r2PublicUrl || '')}`}>
              <button className="w-10 h-10 bg-[#1C2340] group-hover:bg-[#7C7AF3] rounded-full flex items-center justify-center transition-colors">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </button>
            </Link>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            No items found in this category.
          </div>
        )}
      </div>
    </div>
  );
}

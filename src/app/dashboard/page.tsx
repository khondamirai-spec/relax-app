"use client";

import React from "react";
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

export default function Dashboard() {

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
      title: 'Healing - Tibetan Meditative Ambient Music - Beautiful Ethereal Relaxation Music',
      subtitle: 'Meditation',
      icon: <Flower className="w-7 h-7" />,
      colorClass: 'bg-purple-100',
      category: 'Healing',
      r2Key: 'Healing - Tibetan Meditative Ambient Music - Beautiful Ethereal Relaxation Music.mp3' // Cloudflare R2 object key
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
      r2Key: 'Healing - Tibetan Meditative Ambient Music - Beautiful Ethereal Relaxing Music.mp3' // Cloudflare R2 object key
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
    // Relaxation Items
    {
      id: '10',
      title: 'Peaceful Mind',
      subtitle: 'Relaxation',
      icon: <Flower className="w-7 h-7" />,
      colorClass: 'bg-teal-100',
      category: 'Relaxation',
      r2Key: 'relax (mp3cut.net).mp3' // Cloudflare R2 object key
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#0B1026] text-white p-6 font-sans">
      
      {/* Title */}
      <div className="mb-8 mt-4">
        <h1 className="text-4xl font-semibold text-white">Overspread Tune's</h1>
      </div>

      {/* Music List Section */}
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-[#1C2340] rounded-2xl hover:bg-[#252d4d] transition-colors group">
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-14 h-14 ${item.colorClass} rounded-xl flex items-center justify-center text-[#0B1026] shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-white">{item.title}</h3>
                <p className="text-slate-400 text-sm mt-0.5">{item.subtitle}</p>
              </div>
            </div>
            <Link 
              href={`/player?title=${encodeURIComponent(item.title)}&subtitle=${encodeURIComponent(item.subtitle)}&fileId=${item.driveFileId || ''}&cloudinaryUrl=${encodeURIComponent(item.cloudinaryUrl || '')}&localUrl=${encodeURIComponent(item.localUrl || '')}&r2Key=${encodeURIComponent(item.r2Key || '')}&r2PublicUrl=${encodeURIComponent(item.r2PublicUrl || '')}`}
              onClick={() => {
                // Store playlist in localStorage for next/previous navigation
                // Only store the necessary data (exclude React elements like icons)
                if (typeof window !== 'undefined') {
                  const playlistData = items.map(({ id, title, subtitle, category, driveFileId, cloudinaryUrl, localUrl, r2Key, r2PublicUrl }) => ({
                    id,
                    title,
                    subtitle,
                    category,
                    fileId: driveFileId,
                    cloudinaryUrl,
                    localUrl,
                    r2Key,
                    r2PublicUrl
                  }));
                  localStorage.setItem('playlist', JSON.stringify(playlistData));
                }
              }}
            >
              <button className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-lg shadow-blue-500/30">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

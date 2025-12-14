"use client";

import React from "react";
import Link from "next/link";
import { Play, Clock, Heart } from "lucide-react";

type Category = 'Healing' | 'Trending' | 'Sleeping' | 'Top' | 'Music' | 'Relaxation' | 'Mashhur' | 'Shifo' | 'Uyqu';

interface Item {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  duration: string;
  category: Category;
  gradient: string;
  driveFileId?: string;
  cloudinaryUrl?: string;
  localUrl?: string;
  r2Key?: string;
  r2PublicUrl?: string;
}

export default function Dashboard() {

  const items: Item[] = [
    {
      id: '1',
      title: 'Miya charchaganda',
      subtitle: 'Motivatsiya',
      image: '/Miya_charchaganda.jpg',
      duration: '1:00:52',
      gradient: 'from-amber-500/80 to-orange-600/80',
      category: 'Mashhur',
      r2Key: 'videoplayback.mp3'
    },
    {
      id: '3',
      title: 'Dam olish',
      subtitle: 'Motivatsiya',
      image: '/Dam_olish.jpg',
      duration: '2:32:36',
      gradient: 'from-emerald-500/80 to-teal-600/80',
      category: 'Shifo',
      r2Key: 'relax (mp3cut.net).mp3'
    },
    {
      id: '4',
      title: 'Hotirjamlik olish',
      subtitle: 'Shifo Musiqasi',
      image: '/Hotirjamlik.jpg',
      duration: '1:00:00',
      gradient: 'from-violet-500/80 to-purple-600/80',
      category: 'Shifo',
      r2Key: 'Healing - Tibetan Meditative Ambient Music - Beautiful Ethereal Relaxation Music.mp3'
    },
    {
      id: '5',
      title: 'Baxt yetmasligida',
      subtitle: 'Uyqu Tovushlari',
      image: '/Baxt_yetmasligida.jpg',
      duration: '1:42:57',
      gradient: 'from-blue-500/80 to-indigo-600/80',
      category: 'Uyqu',
      r2Key: 'videoplayback (1).mp3'
    },
    {
      id: '6',
      title: 'Chuqur Tush',
      subtitle: 'Chuqur Uyqu',
      image: '/Qorin_orishi.jpg',
      duration: '1:00:00',
      gradient: 'from-slate-500/80 to-slate-700/80',
      category: 'Uyqu',
      r2Key: 'YTDown.com_YouTube_Gastritis-Healing-Frequency-Gas-Relief-&_Media_lS2Yst9UeF4_008_128k.mp3'
    },
    {
      id: '7',
      title: 'Nafas olishni yaxshilash',
      subtitle: 'Mashqlar',
      image: '/Nafas_olish.jpg',
      duration: '1:00:04',
      gradient: 'from-rose-500/80 to-pink-600/80',
      category: 'Top',
      r2Key: 'Sinus Relief Music_ Healing Frequency for Nasal Congestion.mp3'
    },
  ];

  const handlePlayClick = () => {
    if (typeof window !== 'undefined') {
      const playlistData = items.map(({ id, title, subtitle, category, driveFileId, cloudinaryUrl, localUrl, r2Key, r2PublicUrl, image }) => ({
        id,
        title,
        subtitle,
        category,
        fileId: driveFileId,
        cloudinaryUrl,
        localUrl,
        r2Key,
        r2PublicUrl,
        image
      }));
      localStorage.setItem('playlist', JSON.stringify(playlistData));
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0f1a] via-[#0B1026] to-[#0d1225] text-white font-sans">
      
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B1026]/80 border-b border-white/5">
        <div className="px-6 py-5">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-violet-300 bg-clip-text text-transparent">
            Dam Olish Musiqalari
          </h1>
          <p className="text-slate-400 text-sm mt-1">Miyangizni dam oldiring, qalbingizni shifo bering</p>
        </div>
      </div>

      {/* Featured Card */}
      <div className="px-6 py-6">
        <Link 
          href={`/player?title=${encodeURIComponent(items[0].title)}&subtitle=${encodeURIComponent(items[0].subtitle)}&r2Key=${encodeURIComponent(items[0].r2Key || '')}&autoPlay=true`}
          onClick={handlePlayClick}
          className="block"
        >
          <div className="relative h-56 rounded-3xl overflow-hidden group cursor-pointer">
            <img 
              src={items[0].image} 
              alt={items[0].title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${items[0].gradient} opacity-60`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-2xl">
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-3">
                ✨ Tanlangan
              </span>
              <h2 className="text-2xl font-bold text-white mb-1">{items[0].title}</h2>
              <div className="flex items-center gap-3 text-white/80">
                <span className="text-sm">{items[0].subtitle}</span>
                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                <span className="flex items-center gap-1 text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  {items[0].duration}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Section Title */}
      <div className="px-6 mb-4">
        <h2 className="text-xl font-semibold text-white">Barcha Musiqa Treklarni</h2>
      </div>

      {/* Music Grid */}
      <div className="px-6 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {items.slice(1).map((item) => (
            <Link 
              key={item.id}
              href={`/player?title=${encodeURIComponent(item.title)}&subtitle=${encodeURIComponent(item.subtitle)}&r2Key=${encodeURIComponent(item.r2Key || '')}&autoPlay=true`}
              onClick={handlePlayClick}
              className="block"
            >
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer bg-[#1a1f35]">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} opacity-40 group-hover:opacity-50 transition-opacity`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f35] via-transparent to-transparent"></div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                      <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-xs font-medium">
                    {item.duration}
                  </div>

                  {/* Like Button */}
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="absolute top-3 left-3 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
                  >
                    <Heart className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-violet-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5">{item.subtitle}</p>
                  
                  {/* Category Tag */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                      {item.category}
                    </span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-violet-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Spacing for mobile nav */}
      <div className="h-20"></div>
    </div>
  );
}

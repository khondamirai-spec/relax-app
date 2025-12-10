import React from "react";
import Link from "next/link";
import { Flower, Moon, Trees } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#0B1026] text-white overflow-hidden flex flex-col font-sans">
      
      {/* Background Ripples */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[100vw] md:h-[100vw] rounded-full border border-slate-800/30 opacity-40 pointer-events-none flex items-center justify-center">
        <div className="w-[85%] h-[85%] rounded-full border border-slate-800/30 flex items-center justify-center">
          <div className="w-[85%] h-[85%] rounded-full border border-slate-800/30 flex items-center justify-center">
            <div className="w-[85%] h-[85%] rounded-full border border-slate-800/30"></div>
          </div>
        </div>
      </div>

      {/* Decorative Dots */}
      <div className="absolute top-20 left-10 w-1 h-1 bg-green-400 rounded-full opacity-60"></div>
      <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-60"></div>
      <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-blue-400 rounded-full opacity-60"></div>
      <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-white rounded-full opacity-30"></div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col h-full items-center justify-between pt-16 pb-12 px-6 flex-grow">
        
        {/* Floating Cards Container */}
        <div className="relative w-[90vmin] max-w-[400px] aspect-square max-h-[45vh] shrink-0">
          
          {/* Green Card - Nature Calm */}
          <div className="absolute top-[5%] left-0 z-10 transform -rotate-[15deg] w-[45%]">
            <div className="relative bg-[#2EB068] text-white p-[8%] rounded-2xl rounded-tr-3xl flex items-center gap-[10%] shadow-xl animate-float-slow">
              <div className="w-[25%] aspect-square bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Trees className="w-[60%] h-[60%] text-white" />
              </div>
              <div className="leading-tight">
                <h3 className="font-bold text-[min(14px,3.5vmin)] whitespace-nowrap">Nature Calm</h3>
                <p className="text-[min(10px,2.5vmin)] text-white/80 uppercase tracking-wide">Ebook</p>
              </div>
              {/* Message Tail */}
              <div className="absolute -bottom-[10%] right-[20%] w-[15%] h-[15%] bg-[#2EB068] transform rotate-45 rounded-sm"></div>
            </div>
          </div>

          {/* Orange Card - Meditation */}
          <div className="absolute top-0 right-0 z-20 transform rotate-[15deg] w-[50%]">
            <div className="relative bg-[#EE7D46] text-white p-[8%] rounded-2xl rounded-tl-3xl flex items-center gap-[10%] shadow-xl animate-float-delayed">
              <div className="w-[25%] aspect-square bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Flower className="w-[60%] h-[60%] text-white" />
              </div>
              <div className="leading-tight">
                <h3 className="font-bold text-[min(14px,3.5vmin)] whitespace-nowrap">Meditation</h3>
                <p className="text-[min(10px,2.5vmin)] text-white/80 whitespace-nowrap">Soft music</p>
              </div>
              {/* Message Tail - Positioned on left to point inward */}
              <div className="absolute -bottom-[10%] left-[20%] w-[15%] h-[15%] bg-[#EE7D46] transform rotate-45 rounded-sm"></div>
            </div>
          </div>

          {/* Blue Card - Best Insomnia */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 z-30 transform -rotate-[5deg] w-[70%]">
            <div className="relative bg-[#3A435E] text-white p-[6%] rounded-[2rem] flex items-center gap-[8%] shadow-xl animate-float">
              <div className="w-[20%] aspect-square bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Moon className="w-[60%] h-[60%] text-white fill-white" />
              </div>
              <div className="leading-tight">
                <h3 className="font-bold text-[min(16px,4vmin)] whitespace-nowrap">Best Insomnia</h3>
                <p className="text-[min(12px,3vmin)] text-slate-300">Music</p>
              </div>
              {/* Message Tail */}
              <div className="absolute -bottom-[8%] right-[15%] w-[10%] h-[10%] bg-[#3A435E] transform rotate-45 rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Text and Button Section */}
        <div className="flex flex-col items-center text-center gap-[5vh] w-full max-w-md mt-auto">
          <h1 className="text-[min(36px,8vmin)] font-semibold leading-tight">
            Discover The Best <br />
            Lovely Relaxing <br />
            Space
          </h1>

          <Link 
            href="/dashboard"
            className="bg-[#7C7AF3] hover:bg-[#6b69d6] active:scale-95 transition-all text-white font-medium text-[min(18px,4.5vmin)] py-[min(16px,4vmin)] w-full rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}

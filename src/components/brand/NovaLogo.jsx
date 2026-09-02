import React from 'react';

export const NovaLogo = ({ className = "h-8 w-auto", showText = true, textClass = "text-white" }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center">
        {/* Decorative subtle background glow for dark surfaces */}
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-400 opacity-30 blur-sm"></div>
        
        {/* Clean Logo Icon */}
        <svg 
          className={className} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="24" fill="#0F172A"/>
          {/* Left N stem */}
          <path 
            d="M28 72V28L52 60V28" 
            stroke="url(#nova_grad_1)" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Right N stem */}
          <path 
            d="M72 28V72L48 40V72" 
            stroke="url(#nova_grad_2)" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Nova Star Core Accent */}
          <circle cx="50" cy="50" r="4.5" fill="#818CF8" />
          <path d="M50 41V59M41 50H59" stroke="#C7D2FE" strokeWidth="1.5" strokeLinecap="round"/>
          
          <defs>
            <linearGradient id="nova_grad_1" x1="28" y1="28" x2="52" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5"/>
              <stop offset="1" stopColor="#818CF8"/>
            </linearGradient>
            <linearGradient id="nova_grad_2" x1="72" y1="28" x2="48" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8"/>
              <stop offset="1" stopColor="#E0E7FF"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-tight text-xl ${textClass}`}>
              NOVA
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              TECH
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mt-0.5">
            Enterprise HR
          </span>
        </div>
      )}
    </div>
  );
};

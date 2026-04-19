'use client';
import { useClock } from '@/hooks/useClock';

interface Props {
  transparent?: boolean;
}

export default function StatusBar({ transparent }: Props) {
  const time = useClock();

  return (
    <div className={`
      flex items-center justify-between px-6 pt-3 pb-1 relative z-10
      ${transparent ? 'text-white' : 'text-ios-label'}
    `}>
      {/* Time */}
      <span className="text-[15px] font-semibold tracking-tight">{time}</span>

      {/* Right icons: signal + wifi + battery */}
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg viewBox="0 0 17 12" fill="currentColor" className="w-[17px] h-3 opacity-90">
          <rect x="0"  y="9" width="3" height="3" rx="0.5"/>
          <rect x="4"  y="6" width="3" height="6" rx="0.5"/>
          <rect x="8"  y="3" width="3" height="9" rx="0.5"/>
          <rect x="12" y="0" width="3" height="12" rx="0.5"/>
        </svg>
        {/* Wifi */}
        <svg viewBox="0 0 16 12" fill="currentColor" className="w-4 h-3 opacity-90">
          <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
          <path d="M8 6.5C9.8 6.5 11.4 7.2 12.6 8.4L11.2 9.8C10.4 9 9.3 8.5 8 8.5s-2.4.5-3.2 1.3L3.4 8.4C4.6 7.2 6.2 6.5 8 6.5Z" opacity="0.8"/>
          <path d="M8 3.5C10.8 3.5 13.2 4.7 14.8 6.6l-1.4 1.4C12 6.5 10.1 5.5 8 5.5S4 6.5 2.6 8l-1.4-1.4C2.8 4.7 5.2 3.5 8 3.5Z" opacity="0.6"/>
        </svg>
        {/* Battery */}
        <div className="flex items-center">
          <div className="relative w-[25px] h-[12px] rounded-[3px] border border-current opacity-90">
            <div className="absolute inset-0.5 bg-current rounded-[2px]" style={{ width: '72%' }}/>
          </div>
          <div className="w-[2px] h-[5px] bg-current rounded-r-sm ml-0.5 opacity-90"/>
        </div>
      </div>
    </div>
  );
}

'use client';
import { motion } from 'framer-motion';
import AppIcon from '@/components/ui/AppIcon';
import StatusBar from './StatusBar';
import { useStory } from '@/lib/storyContext';
import story from '@/content/story.json';
import type { AppDef } from '@/lib/types';

interface Props {
  onOpenApp: (appId: string) => void;
}

export default function HomeScreen({ onOpenApp }: Props) {
  const { ctx } = useStory();
  const apps = story.apps as AppDef[];

  const handleOpen = (app: AppDef) => {
    if (!ctx.unlockedApps.includes(app.id)) return;
    onOpenApp(app.id);
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col bg-gradient-to-b from-[#0d0d14] via-[#0a0a10] to-[#060608]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <StatusBar transparent />

      {/* Wallpaper text — story framing */}
      <div className="px-6 mt-4 mb-8">
        <p className="text-[11px] uppercase tracking-widest text-white/25">Found at scene</p>
        <h1 className="text-[22px] font-light text-white/60 mt-0.5">Alex Chen's phone</h1>
      </div>

      {/* App grid */}
      <div className="flex flex-wrap gap-6 px-8 justify-start">
        {apps
          .sort((a, b) => a.order - b.order)
          .map(app => (
            <AppIcon
              key={app.id}
              icon={app.icon}
              label={app.label}
              locked={!ctx.unlockedApps.includes(app.id)}
              onClick={() => handleOpen(app)}
            />
          ))}
      </div>

      {/* Unlock hints — subtle nudge toward unlocked content */}
      {ctx.unlockedApps.length < apps.length && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-16 left-0 right-0 text-center text-[11px] text-white/20"
        >
          {apps.length - ctx.unlockedApps.length} app{apps.length - ctx.unlockedApps.length !== 1 ? 's' : ''} locked
        </motion.p>
      )}

      {/* Home indicator */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <div className="w-32 h-1 rounded-full bg-white/20"/>
      </div>
    </motion.div>
  );
}

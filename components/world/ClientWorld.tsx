'use client';

import dynamic from 'next/dynamic';

const PhoneShell  = dynamic(() => import('@/components/phone/PhoneShell'),  { ssr: false });
const DeskScene   = dynamic(() => import('@/components/desk/DeskScene'),     { ssr: false });
const PlayerPhone = dynamic(() => import('@/components/world/PlayerPhone'),  { ssr: false });
const WorldLayout = dynamic(() => import('@/components/world/WorldLayout'),  { ssr: false });

export default function ClientWorld() {
  return (
    <WorldLayout
      defaultPage={1}
      pages={[
        {
          id: 'desk',
          label: 'My Desk',
          content: <DeskScene />,
        },
        {
          id: 'found-phone',
          label: "Alex's Phone",
          content: (
            <div className="flex items-center justify-center w-full h-full">
              <PhoneShell />
            </div>
          ),
        },
        {
          id: 'player-phone',
          label: 'My Phone',
          content: (
            <div className="flex items-center justify-center w-full h-full">
              <PlayerPhone />
            </div>
          ),
        },
      ]}
    />
  );
}

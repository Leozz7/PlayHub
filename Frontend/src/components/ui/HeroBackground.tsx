import { SPORT_ICONS } from '@/components/SportIcons';

export function HeroBackground() {
    const icons = SPORT_ICONS;

    const positions = [
        // 0: Football
        { top: '6%', left: '4%', size: 'w-24 h-24', rot: 'rotate-[15deg]', delay: '0s', dur: '8s', opacity: 'opacity-10' },
        // 1: Basketball (Principal)
        { top: '5%', left: '80%', size: 'w-48 h-48', rot: '-rotate-[12deg]', delay: '1s', dur: '12s', opacity: 'opacity-20' },
        // 2: Racket
        { top: '50%', left: '-2%', size: 'w-64 h-64', rot: '-rotate-[35deg]', delay: '2s', dur: '15s', opacity: 'opacity-10' },
        // 4: Volleyball (Principal)
        { top: '75%', left: '10%', size: 'w-36 h-36', rot: 'rotate-[25deg]', delay: '3s', dur: '10s', opacity: 'opacity-20' },
        // 6: Trophy
        { top: '72%', left: '76%', size: 'w-32 h-32', rot: 'rotate-[10deg]', delay: '2.5s', dur: '11s', opacity: 'opacity-15' },
        // 16: Minor element
        { top: '82%', left: '60%', size: 'w-16 h-16', rot: 'rotate-[80deg]', delay: '3.9s', dur: '8s', opacity: 'opacity-25' },
    ];

    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-gray-50 dark:bg-background pointer-events-none transition-colors duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,transparent_0%,#f9fafb_100%)] dark:bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,transparent_0%,rgba(3,7,18,1)_100%)]" />

            <style>{`
        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .hero-animate-float {
            animation: heroFloat var(--dur) ease-in-out var(--delay) infinite;
            will-change: transform;
          }
          .hero-animate-sink {
            animation: heroSink var(--dur) ease-in-out var(--delay) infinite;
            will-change: transform;
          }
        }

        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-16px); }
        }
        @keyframes heroSink {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(14px); }
        }
      `}</style>

            {positions.map((pos, i) => {
                const IconComponent = icons[i % icons.length];
                return (
                    <div
                        key={i}
                        className={`absolute text-[#8CE600] ${pos.size} ${pos.rot} ${pos.opacity} dark:opacity-[0.05] ${
                            i % 2 === 0 ? 'hero-animate-float' : 'hero-animate-sink'
                        }`}
                        style={{
                            top: pos.top,
                            left: pos.left,
                            // @ts-ignore
                            '--dur': pos.dur,
                            '--delay': pos.delay,
                        }}
                    >
                        <IconComponent className="w-full h-full" />
                    </div>
                );
            })}

            <div className="absolute inset-0 bg-gradient-to-t from-gray-50/90 via-gray-50/10 dark:from-gray-950/90 dark:via-gray-950/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-transparent dark:from-gray-950/50 to-transparent" />
        </div>
    );
}




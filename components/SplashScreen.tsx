import React, { useEffect, useState } from 'react';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Wait for fade out animation
    }, 1200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[999] bg-[#FF6B00] flex items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="flex flex-col items-center gap-6">
        <div className="relative animate-logo-in">
          {/* Logo Container with shadow and white border for premium feel */}
          <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl p-4 flex items-center justify-center border-4 border-white/20">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/5f/TheHomeDepot.svg"
              alt="Home Depot Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {/* Decorative glowing effect */}
          <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full scale-150 animate-pulse-slow -z-10"></div>
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-white text-3xl font-black italic tracking-tighter animate-text-slide">
            THE HOME DEPOT
          </h1>
          <div className="w-12 h-1 bg-white/50 rounded-full mt-2 animate-width-grow"></div>
        </div>

        <div className="absolute bottom-12 flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Loading Experience</p>
        </div>
      </div>

      <style>{`
        @keyframes logo-in {
          0% { transform: scale(0.5) rotate(-15deg); opacity: 0; }
          60% { transform: scale(1.1) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes text-slide {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes width-grow {
          0% { width: 0; }
          100% { width: 48px; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1.5); }
          50% { opacity: 0.4; transform: scale(1.8); }
        }
        .animate-logo-in {
          animation: logo-in 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-text-slide {
          animation: text-slide 1s ease-out 0.5s forwards;
          opacity: 0;
        }
        .animate-width-grow {
          animation: width-grow 1s ease-out 1s forwards;
          width: 0;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;

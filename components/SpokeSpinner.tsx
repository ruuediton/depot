import React from 'react';

interface SpokeSpinnerProps {
    className?: string;
    size?: string;
}

const SpokeSpinner: React.FC<SpokeSpinnerProps> = ({ className = "text-black/60", size = "w-8 h-8" }) => {
    return (
        <div className={`relative ${size} ${className}`}>
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute left-[48.5%] top-0 h-[30%] w-[3%] bg-current rounded-full animate-ios-spinner"
                    style={{
                        transform: `rotate(${i * 30}deg)`,
                        transformOrigin: '50% 166.6%',
                        animationDelay: `${-1.1 + i * 0.1}s`
                    }}
                />
            ))}
            <style>{`
                @keyframes ios-spinner {
                    0% { opacity: 1; }
                    100% { opacity: 0.15; }
                }
                .animate-ios-spinner {
                    animation: ios-spinner 1.2s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default SpokeSpinner;


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Page } from '../App';

export const Building = ({ navigate }: { navigate: (page: Page) => void }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<'building' | 'success'>('building');
    
    const mockLogs = [
        "Cloning repository arjunkshah/pincer...",
        "Resolving dependencies using pnpm...",
        "Running build script 'pnpm run build'...",
        "info  - Linting and checking validity of types...",
        "info  - Creating an optimized production build...",
        "info  - Compiled successfully",
        "info  - Collecting page data...",
        "info  - Generating static pages (5/5)",
        "info  - Finalizing build output...",
        "Deployment successful. Assigning domains..."
    ];

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < mockLogs.length) {
                setLogs(prev => [...prev, mockLogs[currentIndex]]);
                currentIndex++;
            } else {
                clearInterval(interval);
                setStatus('success');
            }
        }, 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-6 py-24"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight flex items-center gap-3">
                        {status === 'building' ? (
                            <><div className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse"></div> Building pincer</>
                        ) : (
                            <><div className="w-2 h-2 rounded-full bg-black"></div> Deployment Complete</>
                        )}
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1 font-mono">ID: dpl_8f92a1x</p>
                </div>
                
                <AnimatePresence>
                    {status === 'success' && (
                        <motion.button 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => navigate('dashboard')}
                            className="px-4 py-2 bg-white border border-zinc-200 text-black text-sm font-medium rounded hover:border-black transition-colors"
                        >
                            Go to Dashboard
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <div className="bg-[#fafafa] border border-zinc-200 rounded-lg p-6 font-mono text-sm h-[50vh] overflow-y-auto no-scrollbar relative shadow-inner">
                <div className="space-y-2">
                    {logs.map((log, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`${log.includes('successful') ? 'text-black font-medium' : 'text-zinc-500'}`}
                        >
                            <span className="text-zinc-300 mr-4 select-none">{String(i + 1).padStart(2, '0')}</span>
                            {log}
                        </motion.div>
                    ))}
                    {status === 'building' && (
                        <div className="text-zinc-400 flex items-center mt-4">
                            <span className="text-zinc-300 mr-4 select-none">{String(logs.length + 1).padStart(2, '0')}</span>
                            <span className="w-2 h-4 bg-zinc-400 animate-[blink_1s_step-end_infinite]"></span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
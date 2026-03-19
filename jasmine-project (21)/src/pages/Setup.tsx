import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, ArrowRight } from 'lucide-react';
import { Page } from '../App';

export const Setup = ({ navigate }: { navigate: (page: Page) => void }) => {
    const [envVars, setEnvVars] = useState([{ key: 'DATABASE_URL', value: '' }]);

    const addVar = () => setEnvVars([...envVars, { key: '', value: '' }]);
    const updateVar = (index: number, field: 'key' | 'value', val: string) => {
        const newVars = [...envVars];
        newVars[index][field] = val;
        setEnvVars(newVars);
    };
    const removeVar = (index: number) => setEnvVars(envVars.filter((_, i) => i !== index));

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto px-6 py-24"
        >
            <div className="mb-12">
                <div className="flex items-center gap-3 text-sm text-zinc-500 mb-4 font-mono">
                    <span>arjunkshah</span>
                    <span className="text-zinc-300">/</span>
                    <span className="text-black font-medium">pincer</span>
                </div>
                <h1 className="text-3xl font-medium tracking-tight">Configure Deployment</h1>
                <p className="text-zinc-500 mt-2">We found a Next.js project. Just add your environment variables to proceed.</p>
            </div>

            <div className="space-y-8">
                <div>
                    <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-4">
                        <h2 className="text-sm font-medium">Environment Variables</h2>
                        <button onClick={addVar} className="text-xs flex items-center gap-1 text-zinc-500 hover:text-black transition-colors">
                            <Plus size={14} /> Add Variable
                        </button>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {envVars.map((env, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <input 
                                        type="text" 
                                        placeholder="KEY" 
                                        value={env.key}
                                        onChange={(e) => updateVar(i, 'key', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-zinc-200 rounded-md font-mono text-sm outline-none focus:border-black transition-colors"
                                    />
                                    <span className="text-zinc-300 font-mono">=</span>
                                    <input 
                                        type="text" 
                                        placeholder="VALUE" 
                                        value={env.value}
                                        onChange={(e) => updateVar(i, 'value', e.target.value)}
                                        className="flex-[2] px-3 py-2 border border-zinc-200 rounded-md font-mono text-sm outline-none focus:border-black transition-colors"
                                    />
                                    <button onClick={() => removeVar(i)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                                        <Trash size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {envVars.length === 0 && (
                            <div className="text-sm text-zinc-400 italic py-4">No environment variables required.</div>
                        )}
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-100 flex justify-end">
                    <button 
                        onClick={() => navigate('building')}
                        className="px-6 py-3 bg-black text-white text-sm font-medium rounded flex items-center gap-2 hover:bg-zinc-800 transition-colors"
                    >
                        Start Deployment <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
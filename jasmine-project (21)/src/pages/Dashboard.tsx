import { motion } from 'framer-motion';
import { ExternalLink, Settings as SettingsIcon } from 'lucide-react';
import { Page } from '../App';

export const Dashboard = ({ navigate }: { navigate: (page: Page) => void }) => {
    const projects = [
        { name: 'pincer', repo: 'arjunkshah/pincer', status: 'ready', url: 'pincer.deploydotcom.vercel.app', time: 'Just now' },
        { name: 'portfolio-v3', repo: 'arjunkshah/portfolio', status: 'ready', url: 'portfolio.arjunkshah.com', time: '2d ago' },
        { name: 'api-service', repo: 'arjunkshah/api-go', status: 'error', url: '-', time: '5d ago' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto px-6 py-24"
        >
            <div className="flex items-center justify-between mb-12">
                <h1 className="text-3xl font-medium tracking-tight">Projects</h1>
                <button onClick={() => navigate('home')} className="text-sm font-medium border border-zinc-200 px-4 py-2 rounded hover:border-black transition-colors">
                    New Project
                </button>
            </div>

            <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                        <tr>
                            <th className="px-6 py-4 font-normal">Project</th>
                            <th className="px-6 py-4 font-normal">Status</th>
                            <th className="px-6 py-4 font-normal">Domain</th>
                            <th className="px-6 py-4 font-normal text-right">Updated</th>
                            <th className="px-6 py-4 font-normal w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {projects.map((p, i) => (
                            <tr key={i} className="hover:bg-zinc-50/50 transition-colors group cursor-pointer" onClick={() => navigate('settings')}>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-black">{p.name}</div>
                                    <div className="text-zinc-400 font-mono text-xs mt-1">{p.repo}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${p.status === 'ready' ? 'bg-black' : 'bg-red-500'}`}></div>
                                        <span className="capitalize text-zinc-600">{p.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-zinc-600">
                                    {p.url !== '-' ? (
                                        <a href="#" className="hover:text-black flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            {p.url} <ExternalLink size={14} />
                                        </a>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 text-right text-zinc-400">{p.time}</td>
                                <td className="px-6 py-4 text-zinc-300 group-hover:text-black transition-colors">
                                    <SettingsIcon size={16} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};
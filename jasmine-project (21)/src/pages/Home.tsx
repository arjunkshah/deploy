import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, ShieldCheck, GitBranch, Terminal, Server, Globe, Lock, Code2 } from 'lucide-react';
import { Page } from '../App';

export const Home = ({ navigate }: { navigate: (page: Page) => void }) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
            
            {/* Hero Section */}
            <section className="relative px-6 pt-32 pb-24 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-zinc-50 -z-10 blur-3xl opacity-50"></div>
                <h1 className="text-[clamp(3rem,10vw,8rem)] font-medium tracking-tighter leading-[0.85] mb-12">
                    Deploy <br/><span className="text-zinc-400">at the</span> URL.
                </h1>
                <p className="text-zinc-500 text-xl max-w-lg mx-auto mb-16 leading-relaxed">
                    The world’s first URL-based deployment engine. Turn any repository into a production-ready application in one click.
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => navigate('setup')} className="px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-zinc-800 transition-all flex items-center gap-2">
                        Start Deploying <ArrowRight size={16} />
                    </button>
                    <button className="px-8 py-4 bg-white border border-zinc-200 rounded-full font-medium hover:border-black transition-all">
                        View Documentation
                    </button>
                </div>
            </section>

            {/* Stats/Trust Bar */}
            <section className="max-w-6xl mx-auto px-6 py-12 border-y border-zinc-100 grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: 'Repos Deployed', val: '12,400+' },
                    { label: 'Avg. Build Time', val: '14s' },
                    { label: 'Uptime', val: '99.99%' },
                    { label: 'Global Regions', val: '14' },
                ].map((s, i) => (
                    <div key={i} className="text-center">
                        <div className="text-2xl font-medium mb-1">{s.val}</div>
                        <div className="text-xs text-zinc-400 uppercase tracking-widest">{s.label}</div>
                    </div>
                ))}
            </section>

            {/* Features Grid */}
            <section className="max-w-6xl mx-auto px-6 py-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 p-12 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                        <Server className="mb-6 text-zinc-400" />
                        <h3 className="text-3xl font-medium mb-4">Ephemeral Infrastructure</h3>
                        <p className="text-zinc-500 max-w-md">Every deployment runs in a dedicated, isolated container. Once your build finishes, we provision the edge network automatically. No manual configuration required.</p>
                    </div>
                    <div className="p-12 bg-white border border-zinc-200 rounded-[2rem]">
                        <Lock className="mb-6 text-zinc-400" />
                        <h3 className="text-xl font-medium mb-4">Secret Ops</h3>
                        <p className="text-zinc-500">Inject env vars via our secure portal. Everything is encrypted at rest and masked in logs.</p>
                    </div>
                    <div className="p-12 bg-white border border-zinc-200 rounded-[2rem]">
                        <Globe className="mb-6 text-zinc-400" />
                        <h3 className="text-xl font-medium mb-4">Global Edge</h3>
                        <p className="text-zinc-500">Your site is automatically distributed across our global CDN, ensuring sub-50ms latency for users worldwide.</p>
                    </div>
                    <div className="md:col-span-2 p-12 bg-black text-white rounded-[2rem]">
                        <Code2 className="mb-6 text-zinc-600" />
                        <h3 className="text-3xl font-medium mb-4">Framework Agnostic</h3>
                        <p className="text-zinc-400 max-w-lg">Whether it's React, Vue, Go, or a static site—our build engine detects your dependencies and configures the runtime environment automatically.</p>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="max-w-4xl mx-auto px-6 py-24">
                <h2 className="text-4xl font-medium text-center mb-16">Compare the old way vs. deploy.</h2>
                <div className="border border-zinc-200 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50">
                            <tr>
                                <th className="p-6">Feature</th>
                                <th className="p-6 text-zinc-500">Traditional CI/CD</th>
                                <th className="p-6 text-black">deploy.com</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            <tr><td className="p-6 font-medium">Config Files</td><td className="p-6 text-zinc-400">Required (YAML)</td><td className="p-6 font-medium">Zero</td></tr>
                            <tr><td className="p-6 font-medium">Setup Time</td><td className="p-6 text-zinc-400">Hours</td><td className="p-6 font-medium">Seconds</td></tr>
                            <tr><td className="p-6 font-medium">Account Linking</td><td className="p-6 text-zinc-400">Required</td><td className="p-6 font-medium">Optional</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 bg-zinc-50 text-center">
                <h2 className="text-5xl font-medium mb-8">Ready to ship?</h2>
                <button onClick={() => navigate('setup')} className="px-10 py-5 bg-black text-white rounded-full font-medium hover:bg-zinc-800 transition-all">
                    Get Started Now
                </button>
            </section>
        </motion.div>
    );
};
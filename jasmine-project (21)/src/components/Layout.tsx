import { ReactNode } from 'react';
import { Page } from '../App';

interface LayoutProps {
    children: ReactNode;
    currentPath: Page;
    navigate: (page: Page) => void;
}

export const Layout = ({ children, currentPath, navigate }: LayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col font-sans">
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-zinc-100">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div 
                        className="font-mono font-medium text-lg cursor-pointer tracking-tighter"
                        onClick={() => navigate('home')}
                    >
                        deploy.
                    </div>
                    <nav className="flex items-center gap-6 text-sm">
                        <button onClick={() => navigate('dashboard')} className={`hover:text-black transition-colors ${currentPath === 'dashboard' ? 'text-black' : 'text-zinc-500'}`}>Dashboard</button>
                        <div className="w-px h-4 bg-zinc-200"></div>
                        <div className="h-8 w-8 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-mono border border-zinc-200">
                            AS
                        </div>
                    </nav>
                </div>
            </header>
            <main className="flex-grow pt-16">
                {children}
            </main>
        </div>
    );
};
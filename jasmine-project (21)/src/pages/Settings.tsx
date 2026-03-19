import { motion } from 'framer-motion';
import { Page } from '../App';

export const Settings = ({ navigate }: { navigate: (page: Page) => void }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-6 py-24 flex gap-12"
        >
            <aside className="w-48 shrink-0">
                <div className="font-medium mb-6">pincer</div>
                <nav className="space-y-1 text-sm text-zinc-500">
                    <a href="#" className="block py-1.5 text-black font-medium">General</a>
                    <a href="#" className="block py-1.5 hover:text-black">Domains</a>
                    <a href="#" className="block py-1.5 hover:text-black">Environment Variables</a>
                    <a href="#" className="block py-1.5 hover:text-black">Git Integration</a>
                </nav>
            </aside>

            <div className="flex-1 space-y-12">
                <section>
                    <h2 className="text-xl font-medium mb-6 border-b border-zinc-100 pb-4">Project Name</h2>
                    <div className="flex gap-4 max-w-md">
                        <input type="text" defaultValue="pincer" className="flex-1 px-3 py-2 border border-zinc-200 rounded-md text-sm outline-none focus:border-black" />
                        <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded">Save</button>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-medium mb-6 border-b border-zinc-100 pb-4">Root Directory</h2>
                    <p className="text-sm text-zinc-500 mb-4">The directory within your project where the code is located. Leave blank if it's the root.</p>
                    <div className="flex gap-4 max-w-md">
                        <input type="text" placeholder="./" className="flex-1 px-3 py-2 border border-zinc-200 rounded-md font-mono text-sm outline-none focus:border-black" />
                        <button className="px-4 py-2 border border-zinc-200 text-black text-sm font-medium rounded hover:border-black">Save</button>
                    </div>
                </section>

                <section className="pt-12 border-t border-zinc-100">
                    <h2 className="text-xl font-medium text-red-600 mb-6">Danger Zone</h2>
                    <div className="border border-red-200 rounded-lg p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Delete Project</h3>
                            <p className="text-sm text-zinc-500 mt-1">This action cannot be undone. This will permanently delete the project.</p>
                        </div>
                        <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded hover:bg-red-600 hover:text-white transition-colors">
                            Delete
                        </button>
                    </div>
                </section>
            </div>
        </motion.div>
    );
};
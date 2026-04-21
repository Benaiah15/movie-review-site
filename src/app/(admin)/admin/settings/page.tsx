import { Settings, Key, Database, Save, Trash2, RefreshCw } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black dark:text-white text-slate-900 tracking-tight transition-colors">System Settings</h2>
        <p className="dark:text-zinc-400 text-slate-500 mt-1 transition-colors">Manage global configurations for MovieSpace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* General Site Settings */}
        <div className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-slate-200 rounded-2xl p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6 border-b dark:border-zinc-800 border-slate-200 pb-4 transition-colors">
            <Settings className="text-red-600" size={24} />
            <h3 className="text-lg font-bold dark:text-white text-slate-900 transition-colors">General Configuration</h3>
          </div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold dark:text-zinc-400 text-slate-600 mb-1 transition-colors">Platform Name</label>
              <input 
                type="text" 
                defaultValue="MovieSpace" 
                className="w-full px-4 py-2.5 dark:bg-zinc-950 bg-slate-50 border dark:border-zinc-800 border-slate-300 rounded-lg dark:text-white text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold dark:text-zinc-400 text-slate-600 mb-1 transition-colors">Support Email</label>
              <input 
                type="email" 
                defaultValue="support@moviespace.com" 
                className="w-full px-4 py-2.5 dark:bg-zinc-950 bg-slate-50 border dark:border-zinc-800 border-slate-300 rounded-lg dark:text-white text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors" 
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-semibold dark:text-white text-slate-900 text-sm transition-colors">Maintenance Mode</p>
                <p className="text-xs dark:text-zinc-500 text-slate-500 transition-colors">Disable site access for non-admins.</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-red-600 cursor-pointer" />
            </div>
            <button type="button" className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Save size={18} /> Save General Settings
            </button>
          </form>
        </div>

        {/* API Keys & External Services */}
        <div className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-slate-200 rounded-2xl p-6 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6 border-b dark:border-zinc-800 border-slate-200 pb-4 transition-colors">
            <Key className="text-amber-500" size={24} />
            <h3 className="text-lg font-bold dark:text-white text-slate-900 transition-colors">API Credentials</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold dark:text-zinc-400 text-slate-600 mb-1 transition-colors">TMDB API Key (Read-Only)</label>
              <input 
                type="password" 
                defaultValue="************************" 
                readOnly 
                className="w-full px-4 py-2.5 dark:bg-zinc-950/50 bg-slate-100 border dark:border-zinc-800 border-slate-200 rounded-lg dark:text-zinc-500 text-slate-400 cursor-not-allowed transition-colors" 
              />
              <p className="text-xs dark:text-zinc-500 text-slate-500 mt-1 transition-colors">Managed via server .env file.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold dark:text-zinc-400 text-slate-600 mb-1 transition-colors">UploadThing Secret</label>
              <input 
                type="password" 
                defaultValue="sk_live_****************" 
                readOnly 
                className="w-full px-4 py-2.5 dark:bg-zinc-950/50 bg-slate-100 border dark:border-zinc-800 border-slate-200 rounded-lg dark:text-zinc-500 text-slate-400 cursor-not-allowed transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* Database & Cache Management */}
        <div className="dark:bg-zinc-900/50 bg-white border dark:border-zinc-800 border-slate-200 rounded-2xl p-6 shadow-sm md:col-span-2 transition-colors">
          <div className="flex items-center gap-3 mb-6 border-b dark:border-zinc-800 border-slate-200 pb-4 transition-colors">
            <Database className="text-indigo-500" size={24} />
            <h3 className="text-lg font-bold dark:text-white text-slate-900 transition-colors">System Operations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="dark:bg-zinc-950 bg-slate-50 border dark:border-zinc-800 border-slate-200 p-4 rounded-xl flex items-center justify-between transition-colors">
              <div>
                <p className="font-bold dark:text-white text-slate-900 text-sm transition-colors">Clear TMDB Cache</p>
                <p className="text-xs dark:text-zinc-500 text-slate-500 transition-colors">Force refresh movie data.</p>
              </div>
              <button className="p-2 dark:bg-zinc-800 bg-white border dark:border-zinc-700 border-slate-200 dark:hover:bg-zinc-700 hover:bg-slate-100 rounded-lg transition-colors text-indigo-500 shadow-sm">
                <RefreshCw size={18} />
              </button>
            </div>
            
            <div className="dark:bg-zinc-950 bg-slate-50 border dark:border-red-900/30 border-red-200 p-4 rounded-xl flex items-center justify-between transition-colors">
              <div>
                <p className="font-bold text-red-600 text-sm">Purge Orphaned Images</p>
                <p className="text-xs dark:text-zinc-500 text-slate-500 transition-colors">Delete unused avatar uploads.</p>
              </div>
              <button className="p-2 dark:bg-red-900/20 bg-white border dark:border-red-900/40 border-red-200 hover:border-red-300 dark:hover:bg-red-900/40 hover:bg-red-50 rounded-lg transition-colors text-red-600 shadow-sm">
                <Trash2 size={18} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
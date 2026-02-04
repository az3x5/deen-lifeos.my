import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Camera, LogOut, Save, Loader2, UserCircle } from 'lucide-react';

export const ProfileView: React.FC = () => {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setUsername(profile.username || '');
        }
    }, [profile]);

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        try {
            const updates = {
                id: user.id,
                full_name: fullName,
                username: username || null, // Handle empty string as null
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;

            await refreshProfile();
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error updating profile' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="sticky top-0 bg-slate-50 dark:bg-slate-950 pt-2 pb-4 z-10 space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Profile</h2>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto">

                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 overflow-hidden border-4 border-white dark:border-slate-900 shadow-md">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle size={64} />
                            )}
                        </div>
                        {/* Avatar upload could go here */}
                        <button className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors shadow-sm" title="Change Avatar (Coming Soon)">
                            <Camera size={14} />
                        </button>
                    </div>
                    <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm font-medium">{user.email}</p>
                </div>

                <form onSubmit={updateProfile} className="space-y-6">
                    {message && (
                        <div className={`p-4 rounded-xl text-sm ${message.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm font-bold">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                    placeholder="username"
                                    pattern="[a-zA-Z0-9_-]{3,}"
                                    title="Username must be at least 3 characters and contain only letters, numbers, underscores, and hyphens."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => signOut()}
                            className="px-6 py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors flex items-center gap-2"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

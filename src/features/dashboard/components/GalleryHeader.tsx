import React, { useState, useRef } from 'react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import {
    PanelLeftOpen,
    Plus,
    Search,
    User,
    LogOut,
    Settings
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { useAppDispatch } from '../../../state';
import { setUser } from '../../../state/slices/userSlice';
import { useNavigate } from 'react-router-dom';

interface GalleryHeaderProps {
    sidebarOpen: boolean;
    onSidebarToggle: () => void;
    onCreateTrip: () => void;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
    sidebarOpen,
    onSidebarToggle,
    onCreateTrip
}) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const email = useSelector((state: RootState) => state.user.email);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useClickOutside(userMenuRef, () => setShowUserMenu(false));

    const handleLogout = () => {
        dispatch(setUser(null));
        navigate('/login');
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-[#050505] backdrop-blur-md border-b border-white/20 dark:border-surface-a20 relative z-30 sticky top-0 shadow-sm dark:shadow-md">
            {/* Left Section: Sidebar Toggle & Title */}
            <div className="flex items-center gap-4">
                {!sidebarOpen && (
                    <button
                        onClick={onSidebarToggle}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-a20 transition-colors text-gray-500 dark:text-gray-300"
                        title="Open Sidebar"
                    >
                        <PanelLeftOpen className="h-5 w-5" />
                    </button>
                )}

                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
                        My Collection
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-surface-a10 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-surface-a20">
                        Library
                    </span>
                </div>
            </div>

            {/* Middle Section: Search (Optional, visual only for now) */}
            <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search trips..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-surface-a10 border border-slate-200 dark:border-surface-a20 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Right Section: Actions & Profile */}
            <div className="flex items-center gap-3">
                {/* Create New Trip Button */}
                <button
                    onClick={onCreateTrip}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Trip</span>
                </button>

                <div className="h-6 w-px bg-slate-200 dark:bg-surface-a20 mx-1"></div>

                {/* User Profile */}
                <div ref={userMenuRef} className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-surface-a10 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-surface-a20"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {(email?.[0] || 'U').toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:block max-w-[100px] truncate">
                            {email?.split('@')[0]}
                        </span>
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface-a0 rounded-xl shadow-xl border border-slate-100 dark:border-surface-a10 py-1 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-surface-a10 bg-slate-50/50 dark:bg-surface-a10/50">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{email}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Free Plan</p>
                            </div>

                            <div className="py-1">
                                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-a10 flex items-center gap-2 transition-colors">
                                    <User className="h-4 w-4" /> Profile
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-a10 flex items-center gap-2 transition-colors">
                                    <Settings className="h-4 w-4" /> Settings
                                </button>
                            </div>

                            <div className="border-t border-slate-100 dark:border-surface-a10 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" /> Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

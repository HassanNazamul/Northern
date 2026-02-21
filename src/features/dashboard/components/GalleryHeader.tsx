import React from 'react';
import {
    PanelLeftOpen,
    Plus,
    Search,
    User
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { useAppDispatch } from '../../../state';
import { useNavigate } from 'react-router-dom';

interface GalleryHeaderProps {
    sidebarOpen: boolean;
    onSidebarToggle: () => void;
    onCreateTrip: () => void;
    invitationCount: number;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
    sidebarOpen,
    onSidebarToggle,
    onCreateTrip,
    invitationCount
}) => {
    const email = useSelector((state: RootState) => state.user.email);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

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

                {/* Invitations Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 transition-all hover:bg-purple-100 dark:hover:bg-purple-900/30">
                    <div className="relative">
                        <User className="h-5 w-5" />
                        {invitationCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#050505] animate-pulse">
                                {invitationCount}
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide hidden sm:inline">
                        {invitationCount === 1 ? '1 Invite' : `${invitationCount} Invites`}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-[10px] ml-1">
                        {(email?.[0] || 'U').toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
};

import React, { useState, useRef } from 'react';
import { User, LogOut, Settings, Moon, ChevronRight, Mail, Phone, ChevronUp } from 'lucide-react';
import { cn } from '@utils';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { useAppDispatch } from '../../../state';
import { setUser } from '../../../state/slices/userSlice';
import { useNavigate } from 'react-router-dom';

export const SidebarFooter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const email = useSelector((state: RootState) => state.user.email);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useClickOutside(containerRef, () => setIsOpen(false));

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogout = () => {
        dispatch(setUser(null));
        navigate('/login');
    };

    return (
        <div ref={containerRef} className="p-2 border-t border-slate-100 dark:border-surface-a10 bg-white dark:bg-surface-a0 relative transition-colors duration-200">

            {/* -- Backdrop Blur Overlay -- */}
            <div
                className={cn(
                    "fixed inset-0 bg-slate-900/5 backdrop-blur-[2px] transition-opacity duration-300 z-40 lg:z-[35] pointer-events-none opacity-0",
                    isOpen && "opacity-100 pointer-events-auto"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* -- Menu Dropdown -- */}
            {/* Positioned above the footer */}
            <div className={cn(
                "absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-surface-a0 rounded-xl shadow-xl border border-slate-100 dark:border-surface-a10 overflow-hidden transition-all duration-200 origin-bottom scale-95 opacity-0 pointer-events-none z-50",
                isOpen && "scale-100 opacity-100 pointer-events-auto"
            )}>
                {/* Account Settings Group */}
                <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-50 dark:border-surface-a10 mb-2">
                        My Account
                    </div>
                    <div className="px-3 py-2 mb-2 bg-slate-50 dark:bg-surface-a10 rounded-lg">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{email}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight">Pro Plan</p>
                    </div>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-a10 rounded-lg group transition-colors">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                            <span>Update Email</span>
                        </div>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-a10 rounded-lg group transition-colors">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                            <span>Change Number</span>
                        </div>
                    </button>
                </div>

                <div className="h-px bg-slate-100 dark:bg-surface-a10 mx-2 my-1"></div>

                {/* App Settings Group */}
                <div className="p-2 space-y-1">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-a10 rounded-lg group transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                            <span>Dark Mode</span>
                        </div>
                        {/* Toggle Switch */}
                        <div className={cn(
                            "w-8 h-4 rounded-full relative transition-colors duration-200",
                            isDark ? "bg-purple-500" : "bg-slate-200"
                        )}>
                            <div className={cn(
                                "absolute top-1 w-2 h-2 bg-white rounded-full shadow-sm transition-all duration-200",
                                isDark ? "left-5" : "left-1"
                            )}></div>
                        </div>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-a10 rounded-lg group transition-colors">
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-slate-400 group-hover:text-purple-500" />
                            <span>Settings</span>
                        </div>
                    </button>
                </div>

                <div className="h-px bg-slate-100 dark:bg-surface-a10 mx-2 my-1"></div>

                {/* Logout */}
                <div className="p-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* -- User Profile Trigger -- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-a10 transition-all group",
                    isOpen && "bg-slate-50 dark:bg-surface-a10"
                )}
            >
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold border border-purple-600/20 overflow-hidden shadow-sm">
                        {(email?.[0] || 'U').toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col items-start overflow-hidden">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate w-full">
                            {email?.split('@')[0] || 'User'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Pro Plan</span>
                    </div>
                </div>

                {/* Trigger Icon */}
                <div className={cn(
                    "text-slate-400 transition-transform duration-200",
                    isOpen && "rotate-180"
                )}>
                    <ChevronUp className="w-4 h-4" />
                </div>
            </button>
        </div>
    );
};

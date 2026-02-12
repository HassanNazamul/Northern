import React, { useState, useRef } from 'react';
import { User, MoreVertical, LogOut, Settings, Moon, ChevronRight, Mail, Phone, ChevronUp } from 'lucide-react';
import { cn } from '@utils';
import { useClickOutside } from '../../../hooks/useClickOutside';

export const SidebarFooter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useClickOutside(containerRef, () => setIsOpen(false));

    return (
        <div ref={containerRef} className="p-4 border-t border-slate-100 bg-white relative">

            {/* -- Menu Dropdown -- */}
            {/* Positioned above the footer */}
            <div className={cn(
                "absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-200 origin-bottom scale-95 opacity-0 pointer-events-none",
                isOpen && "scale-100 opacity-100 pointer-events-auto"
            )}>
                {/* Account Settings Group */}
                <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        My Account
                    </div>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg group transition-colors">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                            <span>Update Email</span>
                        </div>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg group transition-colors">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                            <span>Change Number</span>
                        </div>
                    </button>
                </div>

                <div className="h-px bg-slate-100 mx-2 my-1"></div>

                {/* App Settings Group */}
                <div className="p-2 space-y-1">
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg group transition-colors">
                        <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                            <span>Dark Mode</span>
                        </div>
                        {/* Toggle Placeholder */}
                        <div className="w-8 h-4 bg-slate-200 rounded-full relative">
                            <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </button>
                </div>

                <div className="h-px bg-slate-100 mx-2 my-1"></div>

                {/* Logout */}
                <div className="p-2">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* -- User Profile Trigger -- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all group",
                    isOpen && "bg-slate-50"
                )}
            >
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                        <User className="w-5 h-5 text-slate-400" />
                        {/* Use an image if available */}
                        {/* <img src="..." alt="User" /> */}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold text-slate-700">Hassan Nazamul</span>
                        <span className="text-xs text-slate-400">Pro Plan</span>
                    </div>
                </div>

                {/* Trigget Icon */}
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

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClickOutside } from '../../../hooks/useClickOutside';
import {
    ChevronLeft,
    PanelLeftOpen,
    Mail,
    UserPlus,
    Save,
    Globe,
    MoreVertical,
    Layers,
    LayoutGrid
} from 'lucide-react';
import { CollaboratorGroup } from './CollaboratorGroup';

interface DashboardHeaderProps {
    destination: string;
    onReset: () => void;
    sidebarOpen: boolean;
    onSidebarToggle: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    destination,
    onReset,
    sidebarOpen,
    onSidebarToggle,
}) => {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const optionsRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useClickOutside(optionsRef, () => setShowMoreMenu(false));

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-[#050505] backdrop-blur-md border-b border-white/20 dark:border-surface-a20 relative z-30 sticky top-0 shadow-sm dark:shadow-md">
            {/* Left Section: Context & Navigation */}
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

                <div>
                    {/* Breadcrumb / Context */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-400 font-medium mb-0.5">
                        <span>Trips</span>
                        <span>/</span>
                        <span className="dark:text-gray-200">{destination}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
                            {destination} Itinerary
                        </h1>
                        <span className="px-2 py-0.5 rounded-full bg-[#da09de1a] dark:bg-[#da09de1a] text-primary-a10 dark:text-primary-a30 text-[10px] font-bold uppercase tracking-wider border border-[#f193ee4d] dark:border-[#f193ee33]">
                            Planning
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Section: Collaboration & Actions */}
            <div className="flex items-center gap-4">

                {/* Collaborators */}
                <div className="flex items-center gap-2 pr-4 border-r border-gray-200/50 dark:border-surface-a20 hidden md:flex">
                    <CollaboratorGroup />
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center gap-2">
                    {/* Invite Button */}
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/40 dark:bg-surface-a10 border border-white/50 dark:border-surface-a30 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm transition-all hover:text-purple-700 dark:hover:text-purple-300">
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">Invite</span>
                    </button>

                    {/* Save Button */}
                    <button className="p-2 text-gray-700 dark:text-gray-200 bg-white/40 dark:bg-surface-a10 border border-white/50 dark:border-surface-a30 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm transition-all hover:text-purple-700 dark:hover:text-purple-300" title="Save Trip">
                        <Save className="h-4 w-4" />
                    </button>

                    {/* More Actions Dropdown */}
                    <div ref={optionsRef} className="relative">
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="p-2 text-gray-700 dark:text-gray-200 bg-white/40 dark:bg-surface-a10 border border-white/50 dark:border-surface-a30 rounded-lg hover:bg-white/60 dark:hover:bg-surface-a20 hover:shadow-sm transition-all hover:text-gray-900 dark:hover:text-white"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </button>

                        {showMoreMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-a0 rounded-xl shadow-xl border border-slate-100 dark:border-surface-a10 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2 transition-colors">
                                    <Globe className="h-4 w-4" /> Publish
                                </button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2 transition-colors">
                                    <Layers className="h-4 w-4" /> Add to Calendar
                                </button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2 transition-colors">
                                    <Mail className="h-4 w-4" /> Share via Email
                                </button>
                                <div className="my-1 border-t border-gray-100/50 dark:border-surface-a10"></div>
                                <button
                                    onClick={onReset}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" /> New Trip
                                </button>
                                <div className="my-1 border-t border-gray-100/50 dark:border-surface-a10"></div>
                                <button
                                    onClick={() => navigate('/gallery')}
                                    className="w-full text-left px-4 py-2.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2 transition-colors font-medium"
                                >
                                    <LayoutGrid className="h-4 w-4" /> View Gallery
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div >
    );
};

import React, { useState } from 'react';
import {
    ChevronLeft,
    PanelLeftOpen,
    Mail,
    UserPlus,
    Save,
    Globe,
    MoreVertical
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

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 relative z-30">
            {/* Left Section: Context & Navigation */}
            <div className="flex items-center gap-4">
                {!sidebarOpen && (
                    <button
                        onClick={onSidebarToggle}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                        title="Open Sidebar"
                    >
                        <PanelLeftOpen className="h-5 w-5" />
                    </button>
                )}

                <div>
                    {/* Breadcrumb / Context */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-0.5">
                        <span>Trips</span>
                        <span>/</span>
                        <span>{destination}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                            {destination} Itinerary
                        </h1>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                            Planning
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Section: Collaboration & Actions */}
            <div className="flex items-center gap-6">

                {/* Collaborators */}
                <div className="flex items-center gap-2 pr-6 border-r border-gray-100">
                    <span className="text-xs text-gray-400 font-medium hidden md:block">Viewing:</span>
                    <CollaboratorGroup />
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center gap-3">
                    {/* Invite Button */}
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">Invite</span>
                    </button>

                    {/* Save Button (Icon only on mobile) */}
                    <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" title="Save Trip">
                        <Save className="h-5 w-5" />
                    </button>



                    {/* More Actions Dropdown Placeholder */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>

                        {showMoreMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                    <Globe className="h-4 w-4" /> Publish
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Share via Email
                                </button>
                                <div className="my-1 border-t border-gray-100"></div>
                                <button
                                    onClick={onReset}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" /> New Trip
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

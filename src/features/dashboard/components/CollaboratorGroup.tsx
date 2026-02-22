import React, { useState, useRef } from 'react';
import { UserMinus, Users, X } from 'lucide-react';
import { Collaborator } from '../../../types/trip';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface CollaboratorGroupProps {
    collaborators: Collaborator[];
    ownerEmail?: string;
    isOwner: boolean;
    onRemove: (email: string) => Promise<boolean>;
    onRevoke?: (email: string) => Promise<boolean>;
}

export const CollaboratorGroup: React.FC<CollaboratorGroupProps> = ({
    collaborators,
    ownerEmail,
    isOwner,
    onRemove,
    onRevoke
}) => {
    const [activePopover, setActivePopover] = useState<string | 'overflow' | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useClickOutside(popoverRef, () => setActivePopover(null));

    // Colors for avatars
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    const getColor = (email: string) => {
        const index = email.length % colors.length;
        return colors[index];
    };

    const displayLimit = 3;
    const displayedCollaborators = collaborators.slice(0, displayLimit);
    const overflowCollaborators = collaborators.slice(displayLimit);
    const hasOverflow = overflowCollaborators.length > 0;

    const handleAction = async (collab: Collaborator) => {
        if (collab.status === 'PENDING') {
            console.log(`[ACTION] Revoking invitation for: ${collab.email}`);
            if (onRevoke) {
                await onRevoke(collab.email);
            } else {
                // Temporary console log until API is ready
                console.log(`API call for revoking ${collab.email} would happen here.`);
                // For now, let's just use onRemove as a fallback or just console log
                // since user said "once api is ready then we will replace"
                await onRemove(collab.email);
            }
        } else {
            console.log(`[ACTION] Removing editor: ${collab.email}`);
            await onRemove(collab.email);
        }
        setActivePopover(null);
    };

    return (
        <div className="flex -space-x-2 items-center relative">
            {displayedCollaborators.map((collab) => (
                <div key={collab.email} className="relative">
                    <div
                        onClick={() => setActivePopover(collab.email)}
                        className={`inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#050505] ${getColor(collab.email)} flex items-center justify-center text-xs text-white font-bold cursor-pointer hover:z-20 transition-all hover:scale-110 shadow-sm`}
                        title={collab.email}
                    >
                        {(collab.email[0] || '?').toUpperCase()}
                    </div>

                    {activePopover === collab.email && (
                        <div
                            ref={popoverRef}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-surface-a10 rounded-xl shadow-xl border border-slate-100 dark:border-surface-a20 p-3 z-50 animate-in fade-in zoom-in-95"
                        >
                            <div className="flex flex-col gap-1 mb-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{collab.email}</span>
                                <span className="text-[10px] text-slate-400 font-medium capitalize">
                                    {collab.email === ownerEmail ? 'Creator' : (collab.status === 'ACCEPTED' ? 'Editor' : 'Pending')}
                                </span>
                            </div>
                            {isOwner && collab.email !== ownerEmail && (
                                <button
                                    onClick={() => handleAction(collab)}
                                    className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20"
                                >
                                    {collab.status === 'PENDING' ? (
                                        <>
                                            <X className="w-3.5 h-3.5" />
                                            Revoke
                                        </>
                                    ) : (
                                        <>
                                            <UserMinus className="w-3.5 h-3.5" />
                                            Remove
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {hasOverflow && (
                <div className="relative">
                    <div
                        onClick={() => setActivePopover('overflow')}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#050505] bg-slate-100 dark:bg-surface-a20 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-surface-a30 cursor-pointer transition-all hover:z-20 hover:scale-110 shadow-sm"
                    >
                        +{overflowCollaborators.length}
                    </div>

                    {activePopover === 'overflow' && (
                        <div
                            ref={popoverRef}
                            className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-surface-a10 rounded-xl shadow-xl border border-slate-100 dark:border-surface-a20 p-3 z-50 animate-in fade-in zoom-in-95"
                        >
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50 dark:border-surface-a20">
                                <Users className="w-4 h-4 text-purple-500" />
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Members</h4>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                {collaborators.map((collab) => (
                                    <div key={collab.email} className="flex items-center justify-between group">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{collab.email}</span>
                                            <span className="text-[9px] text-slate-400 font-medium">
                                                {collab.email === ownerEmail ? 'Creator' : (collab.status === 'ACCEPTED' ? 'Editor' : 'Pending')}
                                            </span>
                                        </div>
                                        {isOwner && collab.email !== ownerEmail && (
                                            <button
                                                onClick={() => handleAction(collab)}
                                                className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-md transition-all shadow-sm shadow-red-500/20"
                                            >
                                                {collab.status === 'PENDING' ? (
                                                    <>
                                                        <X className="w-3 h-3" />
                                                        Revoke
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserMinus className="w-3 h-3" />
                                                        Remove
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

import React from 'react';

export const CollaboratorGroup: React.FC = () => {
    // Placeholder data for collaborators
    const collaborators = [
        { id: 1, name: 'Alex', color: 'bg-blue-500' },
        { id: 2, name: 'Sarah', color: 'bg-green-500' },
        { id: 3, name: 'Mike', color: 'bg-purple-500' },
    ];

    const overflowCount = 2; // Example: "+2" others

    return (
        <div className="flex -space-x-2 items-center">
            {collaborators.map((user) => (
                <div
                    key={user.id}
                    className={`inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-a10 ${user.color} flex items-center justify-center text-xs text-white font-medium cursor-pointer hover:z-10 transition-transform hover:scale-110`}
                    title={user.name}
                >
                    {user.name.charAt(0)}
                </div>
            ))}
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-a10 bg-gray-100 dark:bg-surface-a20 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-surface-a30 cursor-pointer z-0">
                +{overflowCount}
            </div>
        </div>
    );
};

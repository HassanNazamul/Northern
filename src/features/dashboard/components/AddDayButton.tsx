import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAppDispatch } from '@state';
import { addDay, persistItinerary } from '@state/slices/dashboardSlice';

export const AddDayButton: React.FC = () => {
    const dispatch = useAppDispatch();

    const handleClick = () => {
        dispatch(addDay());
    };

    return (
        <motion.button
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(168, 85, 247, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className="w-full h-full min-h-[400px] flex flex-col items-center justify-center 
                       border-2 border-dashed border-slate-300 dark:border-white/30 
                       rounded-2xl text-slate-400 dark:text-white/70
                       hover:border-purple-500/50 hover:text-purple-500 dark:hover:border-primary-a30 dark:hover:text-primary-a30
                       transition-colors duration-200 group bg-transparent"
        >
            <div className="p-4 rounded-full bg-slate-100 dark:bg-white/10 
                          group-hover:bg-purple-100 dark:group-hover:bg-primary-a30/20 
                          mb-4 transition-colors duration-200">
                <Plus className="w-8 h-8" />
            </div>
            <span className="text-lg font-medium">+ Add New Day</span>
        </motion.button>
    );
};

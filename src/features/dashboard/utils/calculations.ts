import { Activity } from '@types';
import { START_HOUR, DEFAULT_DURATION, DEFAULT_BUFFER } from './constants';

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Recalculate activity timeline and travel times
 */
export const recalculateDayTimeline = (activities: Activity[]): Activity[] => {
    let currentMs = new Date().setHours(START_HOUR, 0, 0, 0);

    return activities.map((activity, index) => {
        let travelMinutes = 0;
        if (index > 0) {
            const prev = activities[index - 1];
            if (prev.coordinates && activity.coordinates) {
                const dist = calculateDistance(prev.coordinates.lat, prev.coordinates.lng, activity.coordinates.lat, activity.coordinates.lng);
                travelMinutes = Math.ceil(dist / 0.5) + 15; // Assuming 30km/h + 15min buffer
            } else {
                travelMinutes = DEFAULT_BUFFER;
            }
        }

        currentMs += travelMinutes * 60000;
        const startTimeDate = new Date(currentMs);
        const timeString = startTimeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        const duration = activity.durationMinutes || DEFAULT_DURATION;
        currentMs += duration * 60000;

        const endTimeDate = new Date(currentMs);
        const endTimeString = endTimeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        return {
            ...activity,
            time: timeString,
            timeSlot: {
                start: timeString,
                end: endTimeString
            },
            travelTimeFromPrev: travelMinutes
        };
    });
};

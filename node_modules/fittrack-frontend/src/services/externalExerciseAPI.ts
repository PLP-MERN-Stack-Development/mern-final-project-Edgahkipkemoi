import axios from 'axios';

// Wger API configuration
const WGER_API_BASE = 'https://wger.de/api/v2';
const WGER_LANGUAGE = 2; // English

// Fallback exercises if API fails
const FALLBACK_EXERCISES = [
    {
        id: 'fallback-1',
        name: 'Push-ups',
        description: 'A classic upper body exercise that targets chest, shoulders, and triceps.',
        category: 'strength',
        muscles: ['chest', 'triceps', 'shoulders'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: [
            'Start in a plank position with hands shoulder-width apart',
            'Lower your body until chest nearly touches the floor',
            'Push back up to starting position',
            'Keep your core engaged throughout'
        ]
    },
    {
        id: 'fallback-2',
        name: 'Squats',
        description: 'A fundamental lower body exercise that builds leg strength and power.',
        category: 'strength',
        muscles: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: [
            'Stand with feet shoulder-width apart',
            'Lower your body as if sitting back into a chair',
            'Keep your chest up and knees behind toes',
            'Push through heels to return to start'
        ]
    },
    {
        id: 'fallback-3',
        name: 'Jumping Jacks',
        description: 'A cardio exercise that increases heart rate and warms up the whole body.',
        category: 'cardio',
        muscles: ['full_body'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: [
            'Start standing with feet together',
            'Jump while spreading legs and raising arms overhead',
            'Jump back to starting position',
            'Maintain a steady rhythm'
        ]
    },
    {
        id: 'fallback-4',
        name: 'Plank',
        description: 'An isometric core exercise that builds stability and endurance.',
        category: 'strength',
        muscles: ['abs', 'lower_back', 'shoulders'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: [
            'Start in a forearm plank position',
            'Keep body in a straight line from head to heels',
            'Engage your core and hold the position',
            'Breathe steadily throughout'
        ]
    },
    {
        id: 'fallback-5',
        name: 'Lunges',
        description: 'A unilateral leg exercise that improves balance and leg strength.',
        category: 'strength',
        muscles: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        instructions: [
            'Stand with feet hip-width apart',
            'Step forward with one leg',
            'Lower hips until both knees are bent at 90 degrees',
            'Push back to starting position and repeat'
        ]
    },
    {
        id: 'fallback-6',
        name: 'Burpees',
        description: 'A full-body exercise that combines strength and cardio.',
        category: 'cardio',
        muscles: ['full_body'],
        equipment: ['bodyweight'],
        difficulty: 'intermediate',
        instructions: [
            'Start standing, then drop into a squat',
            'Place hands on floor and jump feet back to plank',
            'Do a push-up (optional)',
            'Jump feet back to squat and explode up'
        ]
    },
    {
        id: 'fallback-7',
        name: 'Mountain Climbers',
        description: 'A dynamic exercise that works core and cardiovascular system.',
        category: 'cardio',
        muscles: ['abs', 'shoulders'],
        equipment: ['bodyweight'],
        difficulty: 'intermediate',
        instructions: [
            'Start in a plank position',
            'Drive one knee toward chest',
            'Quickly switch legs',
            'Continue alternating at a fast pace'
        ]
    },
    {
        id: 'fallback-8',
        name: 'Dumbbell Bench Press',
        description: 'A compound exercise for building chest, shoulder, and tricep strength.',
        category: 'strength',
        muscles: ['chest', 'triceps', 'shoulders'],
        equipment: ['dumbbells', 'bench'],
        difficulty: 'intermediate',
        instructions: [
            'Lie on bench with dumbbells at chest level',
            'Press weights up until arms are extended',
            'Lower slowly back to starting position',
            'Keep shoulder blades retracted'
        ]
    }
];

interface ExternalExercise {
    id: string;
    name: string;
    description: string;
    category: string;
    muscles: string[];
    equipment: string[];
    difficulty: string;
    instructions?: string[];
    images?: string[];
    videoUrl?: string;
}

// Transform Wger API response to our format
const transformWgerExercise = (exercise: any): ExternalExercise => {
    return {
        id: `wger-${exercise.id}`,
        name: exercise.name || 'Unknown Exercise',
        description: exercise.description?.replace(/<[^>]*>/g, '') || 'No description available',
        category: exercise.category?.name?.toLowerCase() || 'other',
        muscles: exercise.muscles?.map((m: any) => m.name?.toLowerCase()) || [],
        equipment: exercise.equipment?.map((e: any) => e.name?.toLowerCase()) || ['bodyweight'],
        difficulty: 'intermediate', // Wger doesn't provide difficulty
        instructions: exercise.description?.split('\n').filter((line: string) => line.trim()) || [],
        images: exercise.images?.map((img: any) => img.image) || [],
    };
};

// Search exercises from Wger API
export const searchExercises = async (query: string = '', limit: number = 20): Promise<ExternalExercise[]> => {
    try {
        const response = await axios.get(`${WGER_API_BASE}/exercise/`, {
            params: {
                language: WGER_LANGUAGE,
                limit,
                search: query,
            },
            timeout: 5000,
        });

        if (response.data?.results && response.data.results.length > 0) {
            return response.data.results.map(transformWgerExercise);
        }

        // If no results, return fallback exercises
        return FALLBACK_EXERCISES.filter(ex =>
            ex.name.toLowerCase().includes(query.toLowerCase()) ||
            ex.description.toLowerCase().includes(query.toLowerCase())
        );
    } catch (error) {
        console.error('Error fetching exercises from Wger API:', error);
        // Return fallback exercises on error
        return FALLBACK_EXERCISES.filter(ex =>
            ex.name.toLowerCase().includes(query.toLowerCase()) ||
            ex.description.toLowerCase().includes(query.toLowerCase())
        );
    }
};

// Get exercise by ID
export const getExerciseById = async (id: string): Promise<ExternalExercise | null> => {
    try {
        // Check if it's a fallback exercise
        if (id.startsWith('fallback-')) {
            return FALLBACK_EXERCISES.find(ex => ex.id === id) || null;
        }

        // Extract numeric ID from wger-XXX format
        const numericId = id.replace('wger-', '');
        const response = await axios.get(`${WGER_API_BASE}/exercise/${numericId}/`, {
            params: {
                language: WGER_LANGUAGE,
            },
            timeout: 5000,
        });

        return transformWgerExercise(response.data);
    } catch (error) {
        console.error('Error fetching exercise by ID:', error);
        return null;
    }
};

// Get exercises by category
export const getExercisesByCategory = async (category: string): Promise<ExternalExercise[]> => {
    try {
        const response = await axios.get(`${WGER_API_BASE}/exercise/`, {
            params: {
                language: WGER_LANGUAGE,
                category,
                limit: 50,
            },
            timeout: 5000,
        });

        if (response.data?.results && response.data.results.length > 0) {
            return response.data.results.map(transformWgerExercise);
        }

        return FALLBACK_EXERCISES.filter(ex => ex.category === category);
    } catch (error) {
        console.error('Error fetching exercises by category:', error);
        return FALLBACK_EXERCISES.filter(ex => ex.category === category);
    }
};

// Get fallback exercises
export const getFallbackExercises = (): ExternalExercise[] => {
    return FALLBACK_EXERCISES;
};

export type { ExternalExercise };

import { ExternalExercise } from './externalExerciseAPI';

interface WorkoutGuide {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    calories: number;
    category: string;
    exercises: Array<{
        exercise: ExternalExercise;
        sets: number;
        reps: string;
        rest: string;
    }>;
    equipment: string[];
    muscles: string[];
    thumbnail?: string;
    videoUrl?: string;
}

// Comprehensive fallback workout guides
const FALLBACK_WORKOUT_GUIDES: WorkoutGuide[] = [
    {
        id: 'guide-1',
        name: 'Beginner Full Body Workout',
        description: 'Perfect for those just starting their fitness journey. This workout targets all major muscle groups with simple, effective exercises.',
        difficulty: 'beginner',
        duration: 30,
        calories: 200,
        category: 'strength',
        equipment: ['bodyweight'],
        muscles: ['full_body'],
        exercises: [
            {
                exercise: {
                    id: 'fallback-1',
                    name: 'Push-ups',
                    description: 'Upper body strength exercise',
                    category: 'strength',
                    muscles: ['chest', 'triceps', 'shoulders'],
                    equipment: ['bodyweight'],
                    difficulty: 'beginner',
                    instructions: ['Start in plank', 'Lower chest to floor', 'Push back up']
                },
                sets: 3,
                reps: '10-15',
                rest: '60s'
            },
            {
                exercise: {
                    id: 'fallback-2',
                    name: 'Squats',
                    description: 'Lower body strength exercise',
                    category: 'strength',
                    muscles: ['quadriceps', 'glutes'],
                    equipment: ['bodyweight'],
                    difficulty: 'beginner',
                    instructions: ['Stand with feet apart', 'Lower as if sitting', 'Push back up']
                },
                sets: 3,
                reps: '15-20',
                rest: '60s'
            },
            {
                exercise: {
                    id: 'fallback-4',
                    name: 'Plank',
                    description: 'Core stability exercise',
                    category: 'strength',
                    muscles: ['abs', 'lower_back'],
                    equipment: ['bodyweight'],
                    difficulty: 'beginner',
                    instructions: ['Forearm plank position', 'Hold steady', 'Keep body straight']
                },
                sets: 3,
                reps: '30-60s',
                rest: '60s'
            }
        ],
        videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4'
    },
    {
        id: 'guide-2',
        name: 'HIIT Cardio Blast',
        description: 'High-intensity interval training to boost metabolism and burn calories fast.',
        difficulty: 'intermediate',
        duration: 20,
        calories: 300,
        category: 'cardio',
        equipment: ['bodyweight'],
        muscles: ['full_body'],
        exercises: [
            {
                exercise: {
                    id: 'fallback-3',
                    name: 'Jumping Jacks',
                    description: 'Cardio warm-up exercise',
                    category: 'cardio',
                    muscles: ['full_body'],
                    equipment: ['bodyweight'],
                    difficulty: 'beginner',
                    instructions: ['Jump with legs spread', 'Raise arms overhead', 'Return to start']
                },
                sets: 4,
                reps: '30s',
                rest: '30s'
            },
            {
                exercise: {
                    id: 'fallback-6',
                    name: 'Burpees',
                    description: 'Full body cardio exercise',
                    category: 'cardio',
                    muscles: ['full_body'],
                    equipment: ['bodyweight'],
                    difficulty: 'intermediate',
                    instructions: ['Drop to squat', 'Jump to plank', 'Push-up', 'Jump up']
                },
                sets: 4,
                reps: '10-15',
                rest: '45s'
            },
            {
                exercise: {
                    id: 'fallback-7',
                    name: 'Mountain Climbers',
                    description: 'Core and cardio exercise',
                    category: 'cardio',
                    muscles: ['abs', 'shoulders'],
                    equipment: ['bodyweight'],
                    difficulty: 'intermediate',
                    instructions: ['Start in plank', 'Drive knees to chest', 'Alternate quickly']
                },
                sets: 4,
                reps: '30s',
                rest: '30s'
            }
        ],
        videoUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI'
    },
    {
        id: 'guide-3',
        name: 'Upper Body Strength',
        description: 'Build strength in chest, back, shoulders, and arms with this focused routine.',
        difficulty: 'intermediate',
        duration: 45,
        calories: 250,
        category: 'strength',
        equipment: ['dumbbells', 'bench'],
        muscles: ['chest', 'back', 'shoulders', 'arms'],
        exercises: [
            {
                exercise: {
                    id: 'fallback-8',
                    name: 'Dumbbell Bench Press',
                    description: 'Chest strength exercise',
                    category: 'strength',
                    muscles: ['chest', 'triceps'],
                    equipment: ['dumbbells', 'bench'],
                    difficulty: 'intermediate',
                    instructions: ['Lie on bench', 'Press weights up', 'Lower with control']
                },
                sets: 4,
                reps: '8-12',
                rest: '90s'
            },
            {
                exercise: {
                    id: 'fallback-1',
                    name: 'Push-ups',
                    description: 'Bodyweight chest exercise',
                    category: 'strength',
                    muscles: ['chest', 'triceps'],
                    equipment: ['bodyweight'],
                    difficulty: 'beginner',
                    instructions: ['Plank position', 'Lower chest', 'Push up']
                },
                sets: 3,
                reps: '15-20',
                rest: '60s'
            }
        ],
        videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4'
    },
    {
        id: 'guide-4',
        name: 'Lower Body Power',
        description: 'Develop leg strength and power with this comprehensive lower body workout.',
        difficulty: 'intermediate',
        duration: 40,
        calories: 280,
        category: 'strength',
        equipment: ['bodyweight', 'dumbbells'],
        muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
        exercises: [
            {
                exercise: {
                    id: 'fallback-2',
                    name: 'Squats',
                    description: 'Primary leg exercise',
                    category: 'strength',
                    muscles: ['quadriceps', 'glutes'],
                    equipment: ['bodyweight'],
                    difficulty: 'beginner',
                    instructions: ['Feet shoulder-width', 'Lower to parallel', 'Drive up']
                },
                sets: 4,
                reps: '12-15',
                rest: '90s'
            },
            {
                exercise: {
                    id: 'fallback-5',
                    name: 'Lunges',
                    description: 'Unilateral leg exercise',
                    category: 'strength',
                    muscles: ['quadriceps', 'glutes'],
                    equipment: ['bodyweight'],
                    difficulty: 'beginner',
                    instructions: ['Step forward', 'Lower hips', 'Push back']
                },
                sets: 3,
                reps: '10-12 each',
                rest: '60s'
            }
        ]
    },
    {
        id: 'guide-5',
        name: 'Core Crusher',
        description: 'Strengthen and tone your core with this targeted ab workout.',
        difficulty: 'beginner',
        duration: 25,
        calories: 150,
        category: 'strength',
        equipment: ['bodyweight'],
        muscles: ['abs', 'obliques', 'lower_back'],
        exercises: [
            {
                exercise: {
                    id: 'fallback-4',
                    name: 'Plank',
                    description: 'Core stability',
                    category: 'strength',
                    muscles: ['abs', 'lower_back'],
                    equipment: ['bodyweight'],
                    difficulty: 'beginner',
                    instructions: ['Forearm plank', 'Hold steady', 'Breathe']
                },
                sets: 3,
                reps: '45-60s',
                rest: '45s'
            },
            {
                exercise: {
                    id: 'fallback-7',
                    name: 'Mountain Climbers',
                    description: 'Dynamic core exercise',
                    category: 'cardio',
                    muscles: ['abs'],
                    equipment: ['bodyweight'],
                    difficulty: 'intermediate',
                    instructions: ['Plank position', 'Drive knees', 'Alternate fast']
                },
                sets: 3,
                reps: '30s',
                rest: '45s'
            }
        ]
    },
    {
        id: 'guide-6',
        name: 'Quick Morning Energizer',
        description: 'Wake up your body with this quick 15-minute morning routine.',
        difficulty: 'beginner',
        duration: 15,
        calories: 100,
        category: 'cardio',
        equipment: ['bodyweight'],
        muscles: ['full_body'],
        exercises: [
            {
                exercise: {
                    id: 'fallback-3',
                    name: 'Jumping Jacks',
                    description: 'Warm-up exercise',
                    category: 'cardio',
                    muscles: ['full_body'],
                    equipment: ['bodyweight'],
                    difficulty: 'beginner',
                    instructions: ['Jump and spread', 'Arms overhead', 'Return']
                },
                sets: 2,
                reps: '30s',
                rest: '30s'
            },
            {
                exercise: {
                    id: 'fallback-2',
                    name: 'Squats',
                    description: 'Leg activation',
                    category: 'strength',
                    muscles: ['quadriceps'],
                    equipment: ['bodyweight'],
                    difficulty: 'beginner',
                    instructions: ['Stand wide', 'Sit back', 'Stand up']
                },
                sets: 2,
                reps: '15',
                rest: '30s'
            },
            {
                exercise: {
                    id: 'fallback-1',
                    name: 'Push-ups',
                    description: 'Upper body wake-up',
                    category: 'strength',
                    muscles: ['chest'],
                    equipment: ['bodyweight'],
                    difficulty: 'beginner',
                    instructions: ['Plank', 'Lower', 'Push']
                },
                sets: 2,
                reps: '10',
                rest: '30s'
            }
        ]
    }
];

// Search workout guides
export const searchWorkoutGuides = async (
    query: string = '',
    filters?: {
        difficulty?: string;
        category?: string;
        equipment?: string;
    }
): Promise<WorkoutGuide[]> => {
    try {
        // For now, use fallback guides with filtering
        let guides = [...FALLBACK_WORKOUT_GUIDES];

        // Apply search filter
        if (query) {
            guides = guides.filter(guide =>
                guide.name.toLowerCase().includes(query.toLowerCase()) ||
                guide.description.toLowerCase().includes(query.toLowerCase()) ||
                guide.category.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Apply difficulty filter
        if (filters?.difficulty) {
            guides = guides.filter(guide => guide.difficulty === filters.difficulty);
        }

        // Apply category filter
        if (filters?.category) {
            guides = guides.filter(guide => guide.category === filters.category);
        }

        // Apply equipment filter
        if (filters?.equipment) {
            guides = guides.filter(guide =>
                guide.equipment.some(eq => eq.toLowerCase().includes(filters.equipment!.toLowerCase()))
            );
        }

        return guides;
    } catch (error) {
        console.error('Error fetching workout guides:', error);
        return FALLBACK_WORKOUT_GUIDES;
    }
};

// Get workout guide by ID
export const getWorkoutGuideById = async (id: string): Promise<WorkoutGuide | null> => {
    try {
        const guide = FALLBACK_WORKOUT_GUIDES.find(g => g.id === id);
        return guide || null;
    } catch (error) {
        console.error('Error fetching workout guide:', error);
        return null;
    }
};

// Get all workout guides
export const getAllWorkoutGuides = (): WorkoutGuide[] => {
    return FALLBACK_WORKOUT_GUIDES;
};

export type { WorkoutGuide };

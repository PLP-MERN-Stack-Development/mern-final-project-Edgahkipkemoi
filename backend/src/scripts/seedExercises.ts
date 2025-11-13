import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from '../models/Exercise';

dotenv.config();

const defaultExercises = [
    // Chest Exercises
    { name: 'Push-ups', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: ['bodyweight'], difficulty: 'beginner', instructions: 'Start in plank position, lower body, push back up', isCustom: false },
    { name: 'Bench Press', category: 'strength', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: ['barbell', 'bench'], difficulty: 'intermediate', instructions: 'Lie on bench, lower bar to chest, press up', isCustom: false },
    { name: 'Dumbbell Flyes', category: 'strength', muscleGroups: ['chest'], equipment: ['dumbbells', 'bench'], difficulty: 'intermediate', instructions: 'Lie on bench, arc dumbbells out and back', isCustom: false },

    // Back Exercises
    { name: 'Pull-ups', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: ['pull_up_bar'], difficulty: 'intermediate', instructions: 'Hang from bar, pull body up until chin over bar', isCustom: false },
    { name: 'Deadlifts', category: 'strength', muscleGroups: ['back', 'glutes', 'hamstrings'], equipment: ['barbell'], difficulty: 'advanced', instructions: 'Lift bar from ground to standing position', isCustom: false },
    { name: 'Bent Over Rows', category: 'strength', muscleGroups: ['back', 'biceps'], equipment: ['barbell'], difficulty: 'intermediate', instructions: 'Bend at hips, pull bar to lower chest', isCustom: false },

    // Leg Exercises
    { name: 'Squats', category: 'strength', muscleGroups: ['quadriceps', 'glutes', 'hamstrings'], equipment: ['bodyweight'], difficulty: 'beginner', instructions: 'Lower hips as if sitting, return to standing', isCustom: false },
    { name: 'Lunges', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: ['bodyweight'], difficulty: 'beginner', instructions: 'Step forward, lower hips, return to start', isCustom: false },
    { name: 'Leg Press', category: 'strength', muscleGroups: ['quadriceps', 'glutes'], equipment: ['cable_machine'], difficulty: 'beginner', instructions: 'Push platform away with feet', isCustom: false },

    // Shoulder Exercises
    { name: 'Overhead Press', category: 'strength', muscleGroups: ['shoulders', 'triceps'], equipment: ['barbell'], difficulty: 'intermediate', instructions: 'Press bar overhead from shoulders', isCustom: false },
    { name: 'Lateral Raises', category: 'strength', muscleGroups: ['shoulders'], equipment: ['dumbbells'], difficulty: 'beginner', instructions: 'Raise dumbbells to sides until parallel', isCustom: false },

    // Arm Exercises
    { name: 'Bicep Curls', category: 'strength', muscleGroups: ['biceps'], equipment: ['dumbbells'], difficulty: 'beginner', instructions: 'Curl dumbbells up to shoulders', isCustom: false },
    { name: 'Tricep Dips', category: 'strength', muscleGroups: ['triceps'], equipment: ['bodyweight'], difficulty: 'intermediate', instructions: 'Lower body by bending elbows, push back up', isCustom: false },

    // Core Exercises
    { name: 'Plank', category: 'strength', muscleGroups: ['abs', 'lower_back'], equipment: ['bodyweight'], difficulty: 'beginner', instructions: 'Hold body straight in forearm position', isCustom: false },
    { name: 'Crunches', category: 'strength', muscleGroups: ['abs'], equipment: ['bodyweight'], difficulty: 'beginner', instructions: 'Lift shoulders off ground, contract abs', isCustom: false },
    { name: 'Russian Twists', category: 'strength', muscleGroups: ['obliques', 'abs'], equipment: ['bodyweight'], difficulty: 'intermediate', instructions: 'Rotate torso side to side while seated', isCustom: false },

    // Cardio Exercises
    { name: 'Running', category: 'cardio', muscleGroups: ['cardio', 'quadriceps', 'calves'], equipment: ['bodyweight'], difficulty: 'beginner', instructions: 'Run at steady pace', isCustom: false },
    { name: 'Jumping Jacks', category: 'cardio', muscleGroups: ['full_body'], equipment: ['bodyweight'], difficulty: 'beginner', instructions: 'Jump while spreading legs and raising arms', isCustom: false },
    { name: 'Burpees', category: 'cardio', muscleGroups: ['full_body'], equipment: ['bodyweight'], difficulty: 'intermediate', instructions: 'Squat, plank, push-up, jump up', isCustom: false },
    { name: 'Mountain Climbers', category: 'cardio', muscleGroups: ['abs', 'shoulders'], equipment: ['bodyweight'], difficulty: 'intermediate', instructions: 'Alternate driving knees to chest from plank', isCustom: false },
];

const seedExercises = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('📦 Connected to MongoDB');

        await Exercise.deleteMany({ isCustom: false });
        console.log('🗑️  Cleared existing default exercises');

        await Exercise.insertMany(defaultExercises);
        console.log(`✅ Seeded ${defaultExercises.length} exercises`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding exercises:', error);
        process.exit(1);
    }
};

seedExercises();

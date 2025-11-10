"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Exercise_1 = __importDefault(require("../models/Exercise"));
const Workout_1 = __importDefault(require("../models/Workout"));
const Goal_1 = __importDefault(require("../models/Goal"));
const Post_1 = __importDefault(require("../models/Post"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await mongoose_1.default.connect(mongoURI);
        console.log('📦 Connected to MongoDB for seeding');
    }
    catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
const sampleUsers = [
    {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        height: 180,
        weight: 75,
        activityLevel: 'moderately_active',
    },
    {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'Password123',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('1992-08-22'),
        gender: 'female',
        height: 165,
        weight: 60,
        activityLevel: 'very_active',
    },
    {
        username: 'mike_wilson',
        email: 'mike@example.com',
        password: 'Password123',
        firstName: 'Mike',
        lastName: 'Wilson',
        dateOfBirth: new Date('1988-12-03'),
        gender: 'male',
        height: 175,
        weight: 80,
        activityLevel: 'lightly_active',
    },
    {
        username: 'sarah_jones',
        email: 'sarah@example.com',
        password: 'Password123',
        firstName: 'Sarah',
        lastName: 'Jones',
        dateOfBirth: new Date('1995-03-10'),
        gender: 'female',
        height: 170,
        weight: 65,
        activityLevel: 'extremely_active',
    },
];
const sampleExercises = [
    {
        name: 'Push-ups',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        equipment: ['bodyweight'],
        instructions: 'Start in a plank position. Lower your body until your chest nearly touches the floor. Push back up to starting position.',
        difficulty: 'beginner',
        isCustom: false,
    },
    {
        name: 'Squats',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: ['bodyweight'],
        instructions: 'Stand with feet shoulder-width apart. Lower your body as if sitting back into a chair. Return to standing position.',
        difficulty: 'beginner',
        isCustom: false,
    },
    {
        name: 'Deadlifts',
        category: 'strength',
        muscleGroups: ['back', 'glutes', 'hamstrings'],
        equipment: ['barbell'],
        instructions: 'Stand with feet hip-width apart. Bend at hips and knees to lower and grab the barbell. Stand up straight, lifting the weight.',
        difficulty: 'intermediate',
        isCustom: false,
    },
    {
        name: 'Bench Press',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        equipment: ['barbell', 'bench'],
        instructions: 'Lie on bench with feet flat on floor. Lower barbell to chest, then press back up to starting position.',
        difficulty: 'intermediate',
        isCustom: false,
    },
    {
        name: 'Pull-ups',
        category: 'strength',
        muscleGroups: ['back', 'biceps'],
        equipment: ['pull_up_bar'],
        instructions: 'Hang from pull-up bar with arms fully extended. Pull your body up until chin is over the bar.',
        difficulty: 'intermediate',
        isCustom: false,
    },
    {
        name: 'Running',
        category: 'cardio',
        muscleGroups: ['cardio'],
        equipment: ['bodyweight'],
        instructions: 'Maintain a steady pace while running. Focus on proper form and breathing.',
        difficulty: 'beginner',
        isCustom: false,
    },
    {
        name: 'Cycling',
        category: 'cardio',
        muscleGroups: ['cardio', 'quadriceps'],
        equipment: ['stationary_bike'],
        instructions: 'Maintain a steady pedaling rhythm. Adjust resistance as needed.',
        difficulty: 'beginner',
        isCustom: false,
    },
    {
        name: 'Burpees',
        category: 'cardio',
        muscleGroups: ['full_body'],
        equipment: ['bodyweight'],
        instructions: 'Start standing, drop to squat, jump back to plank, do push-up, jump feet to squat, jump up with arms overhead.',
        difficulty: 'advanced',
        isCustom: false,
    },
    {
        name: 'Yoga Flow',
        category: 'flexibility',
        muscleGroups: ['full_body'],
        equipment: ['bodyweight'],
        instructions: 'Flow through various yoga poses focusing on flexibility and breathing.',
        difficulty: 'beginner',
        isCustom: false,
    },
    {
        name: 'Stretching Routine',
        category: 'flexibility',
        muscleGroups: ['full_body'],
        equipment: ['bodyweight'],
        instructions: 'Hold each stretch for 15-30 seconds. Focus on major muscle groups.',
        difficulty: 'beginner',
        isCustom: false,
    },
];
const seedUsers = async () => {
    console.log('👥 Seeding users...');
    for (const userData of sampleUsers) {
        const existingUser = await User_1.default.findOne({ email: userData.email });
        if (!existingUser) {
            await User_1.default.create(userData);
            console.log(`✅ Created user: ${userData.username}`);
        }
        else {
            console.log(`⏭️  User already exists: ${userData.username}`);
        }
    }
};
const seedExercises = async () => {
    console.log('💪 Seeding exercises...');
    for (const exerciseData of sampleExercises) {
        const existingExercise = await Exercise_1.default.findOne({ name: exerciseData.name });
        if (!existingExercise) {
            await Exercise_1.default.create(exerciseData);
            console.log(`✅ Created exercise: ${exerciseData.name}`);
        }
        else {
            console.log(`⏭️  Exercise already exists: ${exerciseData.name}`);
        }
    }
};
const seedWorkouts = async () => {
    console.log('🏋️ Seeding workouts...');
    const users = await User_1.default.find().limit(2);
    const exercises = await Exercise_1.default.find().limit(5);
    if (users.length === 0 || exercises.length === 0) {
        console.log('⚠️  No users or exercises found. Skipping workout seeding.');
        return;
    }
    const sampleWorkouts = [
        {
            user: users[0]._id,
            name: 'Upper Body Strength',
            description: 'Focus on chest, shoulders, and arms',
            exercises: [
                {
                    exercise: exercises[0]._id,
                    sets: [
                        { reps: 15, completed: true },
                        { reps: 12, completed: true },
                        { reps: 10, completed: false },
                    ],
                },
                {
                    exercise: exercises[3]._id,
                    sets: [
                        { reps: 8, weight: 60, completed: true },
                        { reps: 6, weight: 65, completed: true },
                        { reps: 4, weight: 70, completed: false },
                    ],
                },
            ],
            duration: 45,
            caloriesBurned: 250,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            isTemplate: false,
            isPublic: true,
            tags: ['strength', 'upper-body'],
        },
        {
            user: users[1]._id,
            name: 'Cardio Blast',
            description: 'High-intensity cardio workout',
            exercises: [
                {
                    exercise: exercises[5]._id,
                    sets: [
                        { duration: 1200, distance: 3000, completed: true },
                    ],
                },
                {
                    exercise: exercises[7]._id,
                    sets: [
                        { reps: 10, completed: true },
                        { reps: 8, completed: true },
                        { reps: 6, completed: true },
                    ],
                },
            ],
            duration: 30,
            caloriesBurned: 400,
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            isTemplate: false,
            isPublic: true,
            tags: ['cardio', 'hiit'],
        },
        {
            user: users[0]._id,
            name: 'Full Body Template',
            description: 'Complete full body workout template',
            exercises: [
                {
                    exercise: exercises[1]._id,
                    sets: [
                        { reps: 15, completed: false },
                        { reps: 15, completed: false },
                        { reps: 15, completed: false },
                    ],
                },
                {
                    exercise: exercises[0]._id,
                    sets: [
                        { reps: 12, completed: false },
                        { reps: 10, completed: false },
                        { reps: 8, completed: false },
                    ],
                },
                {
                    exercise: exercises[4]._id,
                    sets: [
                        { reps: 5, completed: false },
                        { reps: 4, completed: false },
                        { reps: 3, completed: false },
                    ],
                },
            ],
            isTemplate: true,
            isPublic: true,
            tags: ['full-body', 'template'],
        },
    ];
    for (const workoutData of sampleWorkouts) {
        const existingWorkout = await Workout_1.default.findOne({
            user: workoutData.user,
            name: workoutData.name
        });
        if (!existingWorkout) {
            await Workout_1.default.create(workoutData);
            console.log(`✅ Created workout: ${workoutData.name}`);
        }
        else {
            console.log(`⏭️  Workout already exists: ${workoutData.name}`);
        }
    }
};
const seedGoals = async () => {
    console.log('🎯 Seeding goals...');
    const users = await User_1.default.find().limit(2);
    if (users.length === 0) {
        console.log('⚠️  No users found. Skipping goal seeding.');
        return;
    }
    const sampleGoals = [
        {
            user: users[0]._id,
            title: 'Lose 5kg',
            description: 'Lose 5 kilograms by the end of the month',
            type: 'weight_loss',
            targetValue: 5,
            currentValue: 2,
            unit: 'kg',
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        {
            user: users[0]._id,
            title: 'Run 100km this month',
            description: 'Complete 100 kilometers of running this month',
            type: 'endurance',
            targetValue: 100,
            currentValue: 35,
            unit: 'km',
            targetDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        },
        {
            user: users[1]._id,
            title: 'Bench Press 80kg',
            description: 'Increase bench press to 80kg',
            type: 'strength',
            targetValue: 80,
            currentValue: 65,
            unit: 'kg',
            targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
        {
            user: users[1]._id,
            title: 'Workout 20 times',
            description: 'Complete 20 workouts this month',
            type: 'custom',
            targetValue: 20,
            currentValue: 12,
            unit: 'workouts',
            targetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        },
    ];
    for (const goalData of sampleGoals) {
        const existingGoal = await Goal_1.default.findOne({
            user: goalData.user,
            title: goalData.title
        });
        if (!existingGoal) {
            await Goal_1.default.create(goalData);
            console.log(`✅ Created goal: ${goalData.title}`);
        }
        else {
            console.log(`⏭️  Goal already exists: ${goalData.title}`);
        }
    }
};
const seedPosts = async () => {
    console.log('📝 Seeding posts...');
    const users = await User_1.default.find().limit(3);
    const workouts = await Workout_1.default.find({ isTemplate: false }).limit(2);
    if (users.length === 0) {
        console.log('⚠️  No users found. Skipping post seeding.');
        return;
    }
    const samplePosts = [
        {
            user: users[0]._id,
            content: 'Just completed an amazing upper body workout! Feeling stronger every day 💪',
            workout: workouts[0]?._id,
            isPublic: true,
        },
        {
            user: users[1]._id,
            content: 'Morning run complete! 5km in 25 minutes. Ready to take on the day! 🏃‍♀️',
            isPublic: true,
        },
        {
            user: users[0]._id,
            content: 'New personal record on bench press today! Hard work pays off 🎉',
            isPublic: true,
        },
        {
            user: users[1]._id,
            content: 'Loving this new workout routine. Consistency is key! 🔥',
            workout: workouts[1]?._id,
            isPublic: true,
        },
    ];
    for (let i = 0; i < samplePosts.length; i++) {
        const postData = samplePosts[i];
        const existingPost = await Post_1.default.findOne({
            user: postData.user,
            content: postData.content
        });
        if (!existingPost) {
            const post = await Post_1.default.create(postData);
            if (i === 0) {
                post.likes.push(users[1]._id, users[2]?._id);
                post.comments.push({
                    user: users[1]._id,
                    content: 'Great job! Keep it up!',
                    createdAt: new Date(),
                });
            }
            if (i === 1) {
                post.likes.push(users[0]._id);
                post.comments.push({
                    user: users[0]._id,
                    content: 'Awesome pace! 🔥',
                    createdAt: new Date(),
                });
            }
            await post.save();
            console.log(`✅ Created post by ${users.find(u => u._id.equals(postData.user))?.username}`);
        }
        else {
            console.log(`⏭️  Post already exists`);
        }
    }
};
const seedFollowRelationships = async () => {
    console.log('👥 Seeding follow relationships...');
    const users = await User_1.default.find().limit(4);
    if (users.length < 2) {
        console.log('⚠️  Not enough users found. Skipping follow relationships.');
        return;
    }
    const relationships = [
        { follower: users[0], following: users[1] },
        { follower: users[0], following: users[2] },
        { follower: users[1], following: users[0] },
        { follower: users[1], following: users[3] },
        { follower: users[2], following: users[0] },
        { follower: users[3], following: users[1] },
    ];
    for (const rel of relationships) {
        if (!rel.follower.following.includes(rel.following._id)) {
            rel.follower.following.push(rel.following._id);
            rel.following.followers.push(rel.follower._id);
            await rel.follower.save();
            await rel.following.save();
            console.log(`✅ ${rel.follower.username} now follows ${rel.following.username}`);
        }
    }
};
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        await connectDB();
        await seedUsers();
        await seedExercises();
        await seedWorkouts();
        await seedGoals();
        await seedPosts();
        await seedFollowRelationships();
        console.log('✅ Database seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('📦 Database connection closed');
        process.exit(0);
    }
};
if (require.main === module) {
    seedDatabase();
}
exports.default = seedDatabase;
//# sourceMappingURL=seed.js.map
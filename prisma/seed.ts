import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Achievements/Badges
  const achievements = [
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Completed your first learning module',
      badgeIcon: 'footprints',
      xpReward: 100,
    },
    {
      id: 'quiz-master',
      title: 'Quiz Master',
      description: 'Passed a quiz with 100% score',
      badgeIcon: 'crown',
      xpReward: 150,
    },
    {
      id: 'sandbox-explorer',
      title: 'Sandbox Explorer',
      description: 'Submitted code in the sandbox environment',
      badgeIcon: 'rocket',
      xpReward: 50,
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { id: ach.id },
      update: ach,
      create: ach,
    });
  }
  console.log('Achievements seeded.');

  // 2. Find or create a course and module to seed sample quizzes
  let course = await prisma.course.findFirst({
    include: { modules: true },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        id: 'sample-python-course',
        title: 'Introduction to Python',
        description: 'Learn the basics of Python programming language.',
        level: 'BEGINNER',
        order: 1,
        modules: {
          create: {
            id: 'sample-python-module-1',
            title: 'Variables and Types',
            content: '# Python Variables\nLearn about variables in Python.',
            order: 1,
          },
        },
      },
      include: { modules: true },
    });
    console.log('Sample course and module created.');
  }

  const module = course.modules[0];
  if (module) {
    const sampleQuiz = {
      title: 'Python Basics Quiz',
      passingScore: 70,
      timeLimit: 10,
      questions: [
        {
          type: 'multiple-choice',
          question: 'What is Python?',
          options: ['Language', 'Snake', 'Framework'],
          correctAnswer: 'Language',
          explanation: 'Python is a high-level general-purpose programming language.',
          points: 10,
        },
        {
          type: 'true-false',
          question: 'Python is compiled directly to machine code.',
          options: ['True', 'False'],
          correctAnswer: 'False',
          explanation: 'Python is an interpreted language, compiled to bytecode first.',
          points: 10,
        },
      ],
    };

    await prisma.quiz.upsert({
      where: { moduleId: module.id },
      update: {
        title: sampleQuiz.title,
        passingScore: sampleQuiz.passingScore,
        timeLimit: sampleQuiz.timeLimit,
        questions: sampleQuiz.questions as any,
      },
      create: {
        courseId: course.id,
        moduleId: module.id,
        title: sampleQuiz.title,
        passingScore: sampleQuiz.passingScore,
        timeLimit: sampleQuiz.timeLimit,
        questions: sampleQuiz.questions as any,
      },
    });
    console.log('Sample quiz seeded for module: ' + module.title);
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

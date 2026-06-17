import { UsersRepository } from '../users/users.repository.js';
import { RoadmapRepository } from '../roadmap/roadmap.repository.js';
import { CoursesRepository } from '../courses/courses.repository.js';
import { NotFoundError } from '../../utils/errors.js';

interface Dependencies {
  usersRepository: UsersRepository;
  roadmapRepository: RoadmapRepository;
  coursesRepository: CoursesRepository;
}

export class DashboardService {
  private usersRepository: UsersRepository;
  private roadmapRepository: RoadmapRepository;
  private coursesRepository: CoursesRepository;

  constructor({ usersRepository, roadmapRepository, coursesRepository }: Dependencies) {
    this.usersRepository = usersRepository;
    this.roadmapRepository = roadmapRepository;
    this.coursesRepository = coursesRepository;
  }

  async getChallenge(userId: string) {
    const roadmap = await this.roadmapRepository.findByUserId(userId);
    const totalProjects = roadmap?.courses.length || 8;
    const completedProjects = roadmap?.courses.filter(c => c.status === 'COMPLETED').length || 0;
    const overallProgress = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    // Find the first non-completed course in roadmap to suggest as challenge
    const nextCourseItem = roadmap?.courses.find(c => c.status !== 'COMPLETED');
    
    let challengeId = 'default-challenge';
    let title = 'BST Implementation';
    let description = 'Implement a BinarySearchTree.inorder() with O(n) traversal.';
    let nextMilestone = 'Algorithms';

    if (nextCourseItem) {
      challengeId = nextCourseItem.courseId;
      title = nextCourseItem.course.title;
      description = nextCourseItem.course.description;
      
      // Find the next milestone (the course after this one in the roadmap)
      const nextIndex = roadmap!.courses.findIndex(c => c.courseId === nextCourseItem.courseId) + 1;
      if (nextIndex < roadmap!.courses.length) {
        nextMilestone = roadmap!.courses[nextIndex].course.title;
      } else {
        nextMilestone = 'Certification';
      }
    }

    const lessonsToUnlock = Math.max(1, totalProjects - completedProjects);

    return {
      id: challengeId,
      title,
      description,
      lessonsToUnlock,
      nextMilestone,
      overallProgress,
      completedProjects,
      totalProjects,
    };
  }

  async getLeaderboard(currentUserId: string) {
    const users = await this.usersRepository.listAll();
    
    // Fetch full user data to get accurate XP and name
    const fullUsers = await Promise.all(
      users.map(async (u) => {
        const full = await this.usersRepository.findById(u.id);
        return full;
      })
    );

    // Filter nulls and sort by XP descending
    const sortedUsers = fullUsers
      .filter((u): u is NonNullable<typeof u> => u !== null)
      .sort((a, b) => b.xp - a.xp);

    const students = sortedUsers.map((u, index) => {
      // Mock delta based on XP to make UI feel alive
      const deltaVal = Math.floor((u.xp * 0.15) + 50);
      return {
        rank: index + 1,
        name: u.name,
        xp: `${u.xp} XP`,
        delta: `+${deltaVal} XP`,
        isUser: u.id === currentUserId,
      };
    });

    const userRankIndex = sortedUsers.findIndex(u => u.id === currentUserId);
    const userRank = userRankIndex !== -1 ? userRankIndex + 1 : sortedUsers.length + 1;
    const totalCount = sortedUsers.length || 1;
    
    // Percentile: top rank / total
    const userPercentile = Math.max(1, Math.min(100, Math.round((userRank / totalCount) * 100)));
    const currentUser = sortedUsers.find(u => u.id === currentUserId);
    const currentUserXp = currentUser?.xp || 0;
    const userDeltaVsLastWeek = `+${Math.floor(currentUserXp * 0.12) + 80} XP vs last week`;

    return {
      students: students.slice(0, 10), // Return top 10 for leaderboard
      userPercentile,
      userDeltaVsLastWeek,
    };
  }

  async getTrack(userId: string) {
    const roadmap = await this.roadmapRepository.findByUserId(userId);
    
    if (!roadmap) {
      return {
        title: 'Learning Roadmap',
        trackName: 'Full Stack Track',
        stats: '0 of 0 modules complete',
        recommendation: 'Generate your roadmap to start learning!',
        modules: [],
      };
    }

    const totalModules = roadmap.courses.length;
    const completedModules = roadmap.courses.filter(c => c.status === 'COMPLETED').length;
    const stats = `${completedModules} of ${totalModules} modules complete`;
    
    const recommendation = completedModules === totalModules 
      ? "You have completed all modules! Claim your certifications."
      : "Based on your cohort's current pace, you're on track to finish your active module soon.";

    // Load full course details including modules to count lessons
    const modulesWithLessons = await Promise.all(
      roadmap.courses.map(async (rc, idx) => {
        const fullCourse = await this.coursesRepository.findById(rc.courseId, userId);
        const lessonsCount = fullCourse?.modules.length || 0;
        
        let status: 'completed' | 'active' | 'locked' = 'locked';
        let percentage = 0;

        if (rc.status === 'COMPLETED') {
          status = 'completed';
          percentage = 100;
        } else if (rc.status === 'IN_PROGRESS' || (rc.status === 'PENDING' && idx === completedModules)) {
          status = 'active';
          // Find submissions count / total lessons or mock progress
          const completedSubmissions = fullCourse?.submissions?.filter(s => s.status === 'COMPLETED').length || 0;
          percentage = lessonsCount > 0 ? Math.round((completedSubmissions / lessonsCount) * 100) : 50;
        }

        return {
          id: idx + 1,
          name: rc.course.title,
          lessons: `${lessonsCount} lessons`,
          status,
          percentage,
        };
      })
    );

    return {
      title: 'AI Learning Roadmap',
      trackName: 'Python Pro Track',
      stats,
      recommendation,
      modules: modulesWithLessons,
    };
  }

  async getMetrics() {
    return {
      attendance: {
        title: 'Weekly Attendance',
        value: '94%',
        subtext: '+2% vs last week',
        chartPoints: [80, 85, 82, 90, 88, 92, 94],
      },
      grading: {
        title: 'Assignments Graded',
        value: '41/50',
        subtext: '9 days remaining',
        progressValue: 82,
      },
      liveSessions: {
        title: 'Office Hours',
        value: 'Live Now',
        subtext: 'Join interactive Q&A',
        isLive: true,
      },
    };
  }
}

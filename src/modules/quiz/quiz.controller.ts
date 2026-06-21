import { Context } from 'hono';
import { QuizService } from './quiz.service.js';

interface Dependencies {
  quizService: QuizService;
}

export class QuizController {
  private quizService: QuizService;

  constructor({ quizService }: Dependencies) {
    this.quizService = quizService;
  }

  list = async (c: Context) => {
    const courseId = c.req.param('id')!;
    const quizzes = await this.quizService.getQuizzesForCourse(courseId);
    return c.json({ data: quizzes });
  };

  create = async (c: Context) => {
    const courseId = c.req.param('id')!;
    const body = c.get('body');
    const quiz = await this.quizService.createQuiz(courseId, body);
    return c.json({ data: quiz }, 201);
  };

  get = async (c: Context) => {
    const id = c.req.param('id')!;
    const quiz = await this.quizService.getQuiz(id);
    return c.json({ data: quiz });
  };

  update = async (c: Context) => {
    const id = c.req.param('id')!;
    const body = c.get('body');
    const quiz = await this.quizService.updateQuiz(id, body);
    return c.json({ data: quiz });
  };

  delete = async (c: Context) => {
    const id = c.req.param('id')!;
    await this.quizService.deleteQuiz(id);
    return c.json({ success: true });
  };

  submit = async (c: Context) => {
    const user = c.get('user')!;
    const id = c.req.param('id')!;
    const body = c.get('body');
    const result = await this.quizService.submitQuiz(user.id, id, body.answers);
    return c.json({ data: result });
  };
}

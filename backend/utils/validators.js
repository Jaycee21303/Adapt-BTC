const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const quizSubmissionSchema = z.object({
  lessonId: z.coerce.number(),
  answers: z.array(z.object({
    questionId: z.coerce.number(),
    answer: z.string(),
  })),
});

const certificateSchema = z.object({
  courseId: z.coerce.number(),
});

module.exports = { registerSchema, loginSchema, quizSubmissionSchema, certificateSchema };

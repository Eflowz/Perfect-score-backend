# Perfect Score Backend Endpoints Reference

All API routes are prefixed with `/api` by default in the server setup.
Some endpoints require a Bearer token (`Authorization: Bearer <token>`).

## Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout (invalidate refresh token)

## Courses (`/api/courses`)
- `GET /api/courses` - List all courses (Admin)
- `POST /api/courses` - Create a course (Admin)
- `GET /api/courses/:id` - Get course details by ID
- `PUT /api/courses/:id` - Update a course (Admin)
- `DELETE /api/courses/:id` - Delete a course (Admin)
- `POST /api/courses/:courseId/modules` - Add a module to a course (Admin)
- `PUT /api/courses/modules/:moduleId` - Update a module (Admin)
- `DELETE /api/courses/modules/:moduleId` - Delete a module (Admin)

## IDE (`/api/ide`)
- `POST /api/ide/execute` - Execute code payload
- `WS /api/ide/session/:sessionId?token=<token>` - Join an IDE collaboration session (WebSocket)

## Roadmap (`/api/roadmap`)
- `GET /api/roadmap` - Get current user's generated learning roadmap
- `POST /api/roadmap/generate` - Generate a new AI roadmap for user

## Submissions (`/api/submissions`)
- `POST /api/submissions` - Submit code solution for a course module
- `GET /api/submissions/:id/review` - Get the AI review for a submission
- `WS /api/submissions/:id/stream` - Stream the AI review process for a submission (WebSocket)

## Users (`/api/users`)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/:id` - Get user by ID (Admin)
- `GET /api/users` - List all users (Admin)

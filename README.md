# AI Goal Setter

An AI-powered goal setting and tracking application that helps users set, track, and achieve their goals with intelligent insights and progress visualization.

## Features

- **Smart Goal Setting**: AI-assisted goal creation and refinement
- **Progress Tracking**: Visual progress tracking with milestones
- **Moodboard**: Visual inspiration and motivation board
- **Reflections**: AI-powered reflection prompts and insights
- **User Authentication**: Secure user registration and login
- **Responsive Design**: Modern UI built with React and Mantine

## Tech Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma** for database ORM
- **SQLite** for development database
- **JWT** for authentication
- **OpenAI API** for AI features
- **bcrypt** for password hashing

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Mantine** for UI components
- **React Query** for data fetching
- **React Router** for navigation
- **Axios** for API calls

## Project Structure

```
ai-goal-setter/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Database schema and migrations
│   └── generated/           # Generated Prisma client
├── frontend/                # React application
│   ├── src/
│   │   ├── api/             # API client and hooks
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   └── ui/              # Reusable UI components
│   └── public/              # Static assets
└── package.json             # Root package.json for workspace
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-goal-setter.git
cd ai-goal-setter
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret-key"
OPENAI_API_KEY="your-openai-api-key"
PORT=3000
```

4. Set up the database:
```bash
cd backend
npx prisma generate
npx prisma db push
```

5. Start the development servers:
```bash
# From the root directory
npm run dev
```

This will start both the backend server (port 3000) and frontend development server (port 5173).

### Available Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run backend` - Start only the backend server
- `npm run frontend` - Start only the frontend server

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Progress
- `GET /api/progress` - Get progress data
- `POST /api/progress` - Log progress

### Moodboard
- `GET /api/moodboard` - Get moodboard items
- `POST /api/moodboard` - Add moodboard item
- `DELETE /api/moodboard/:id` - Remove moodboard item

### Reflections
- `GET /api/reflections` - Get reflections
- `POST /api/reflections` - Create reflection

### AI Features
- `POST /api/ai/suggest-goals` - Get AI goal suggestions
- `POST /api/ai/analyze-progress` - Analyze progress with AI

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for AI capabilities
- Mantine for the beautiful UI components
- The React and Node.js communities

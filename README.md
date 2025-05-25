# OpenForge

OpenForge is an open-source platform for creating, managing, and interacting with AI assistants. It supports both API-based language models and in-browser WebLLM models for complete privacy.

<!-- ![OpenForge Dashboard](/public/screenshot-dashboard.png) -->

## Features

- **Create Custom Bots**: Design AI assistants with specific personalities and knowledge areas
- **WebLLM Support**: Run models directly in your browser with no data leaving your device
- **API Integration**: Connect to various LLM providers including OpenAI, Anthropic, Cohere, and more
- **Chat Interface**: User-friendly conversation UI with message history
- **Settings Management**: Fine-tune model parameters like temperature and context size
- **Authentication**: GitHub-based authentication with user profiles
- **Responsive Design**: Works on both desktop and mobile devices

## Technologies

- Next.js 14 (App Router)
- React
- MongoDB
- NextAuth.js
- Tailwind CSS
- shadcn/ui components
- WebLLM for in-browser model execution

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- MongoDB database (local or Atlas)
- GitHub OAuth application for authentication

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/openforge.git
   cd openforge
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/openforge

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # GitHub OAuth
   GITHUB_ID=your-github-oauth-app-id
   GITHUB_SECRET=your-github-oauth-app-secret
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Environment Variables

- `MONGODB_URI`: Connection string for MongoDB
- `NEXTAUTH_URL`: Base URL for NextAuth.js
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js session encryption
- `GITHUB_ID`: GitHub OAuth application client ID
- `GITHUB_SECRET`: GitHub OAuth application client secret

### LLM Provider Setup

To use API-based LLM providers, you'll need to:

1. Create accounts with your preferred providers (OpenAI, Anthropic, etc.)
2. Generate API keys from their developer portals
3. Add these keys in the Preferences section of OpenForge

## Usage

### First-time Setup

1. Sign in with GitHub
2. Set up your LLM preferences (WebLLM or API provider)
3. Create your first bot by clicking "Create New Bot" on the dashboard

### Creating a Bot

1. Provide a name and description for your bot
2. Configure the system prompt to define its personality and capabilities
3. Set model parameters (temperature, top-p, context window)
4. Add example conversations to guide the bot's behavior
5. Save the bot to start chatting

### Chatting

1. Select a bot from your dashboard
2. Click "Chat with this Bot" to start a conversation
3. Type messages in the input field at the bottom of the chat window
4. Adjust settings using the settings dialog if needed

## Project Structure

```
openforge/
├── app/                # Next.js App Router pages and layouts
│   ├── api/            # API routes and endpoints
│   ├── auth/           # Authentication pages
│   ├── bots/           # Bot creation and management pages
│   ├── chat/           # Chat interface pages
│   ├── dashboard/      # User dashboard
│   └── preferences/    # User preferences page
├── components/         # Reusable React components
├── context/            # React context providers
├── lib/                # Utility functions and helpers
│   ├── api.js          # API client functions
│   ├── chat-api.js     # Chat-specific API functions
│   ├── mongodb.js      # MongoDB connection
│   └── webllm-models.js # WebLLM model definitions
├── public/             # Static assets
└── styles/             # Global styles
```

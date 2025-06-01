# OpenForge

OpenForge is an open-source platform for creating, managing, and interacting with AI assistants. It supports both API-based language models and in-browser WebLLM models for complete privacy.

**[Try the Deployed Demo →](https://openforge.vercel.app/)**  
**[Watch the Demo Video →](https://youtu.be/xFzvdjYmjEE)**

![OpenForge Dashboard](/public/screenshot-dashboard.png)

## Features

- **Create Custom Bots**: Design AI assistants with specific personalities and knowledge areas
- **WebLLM Support**: Run models directly in your browser with no data leaving your device
- **API Integration**: Connect to various LLM providers including OpenAI, Anthropic, Cohere, and more
- **Chat Interface**: User-friendly conversation UI with message history
- **Settings Management**: Fine-tune model parameters like temperature and context size
- **Authentication**: GitHub-based authentication with user profiles
- **Responsive Design**: Works on both desktop and mobile devices
- **Git-like Version Control**: Track changes to your bots with commits and branches
- **Branch Management**: Create and switch between different versions of your bots
- **Pull Requests**: Review and merge changes between branches with inline comments
- **Visual Diff Tool**: Compare changes between versions with an intuitive side-by-side diff viewer
- **Model Export**: Download your models as standalone applications with a local HTML interface
- **Collaboration**: Work with team members on the same bot with access controls

## Technologies

- Next.js 14 (App Router)
- React
- MongoDB
- NextAuth.js
- Tailwind CSS
- shadcn/ui components
- WebLLM for in-browser model execution
- JSZip for model export functionality

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- MongoDB database (local or Atlas)
- GitHub OAuth application for authentication

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Varun-Patkar/openforge.git
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

### Version Control

1. **Committing Changes**: Save versions of your bot with descriptive commit messages
2. **Creating Branches**: Experiment with changes by creating a new branch
3. **Pull Requests**: Submit changes for review and merge them into the target branch
4. **Code Reviews**: Comment on specific lines of changes in pull requests
5. **Resolving Comments**: Mark comments as resolved before completing pull requests

### Downloading Models

1. Navigate to your bot's page
2. Click the "Download" button to export the model
3. The downloaded zip contains:
   - `model.json`: Your custom model configuration
   - `index.html`: A standalone interface to run your model locally

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

## Advanced Features

### Branch Management

- Create branches to work on features without affecting the main version
- The master branch is protected and serves as the stable version
- Create pull requests to merge changes from feature branches

### Pull Request Workflow

1. Create a branch for your changes
2. Make and commit your modifications
3. Create a pull request targeting the branch you want to merge into
4. Review changes in the visual diff tool
5. Add and resolve comments
6. Complete the pull request to merge changes

### Model Exporting

Export your model as a standalone application that can run without the OpenForge platform. The exported package includes:

- Model configuration with your custom parameters
- WebLLM-compatible interface for local usage
- No server dependencies required

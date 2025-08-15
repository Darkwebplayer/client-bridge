# 🌉 Client Bridge

> Simple client communication, zero hassle

It is highly recommended to fork this project and self-host. Just create a `.env` file with `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL` and create a Supabase storage bucket called 'project-files' and you're done.

## What This Actually Does

Client Bridge is focused on one thing: keeping you and your clients on the same page without all the project management overhead.

### Task Updates
- Quick task notes so clients know what you're working on
- Simple progress tracking
- No complex project management features

### Threaded Discussions
- Create threads for bugs, feedback, or change requests
- Both you and your client can participate
- Attach images when needed

### Document Sharing
- Share contracts, invoices, and project files in one place
- No more "I sent it last week" confusion

### Client Access
- Invite clients with a simple link
- Clean interface that works for everyone
- Real-time updates

## Tech Stack

- React + Vite
- Tailwind CSS
- Supabase

## Getting Started

1. Clone and install:
   ```bash
   git clone <repo-url>
   cd client-bridge
   npm install
   ```

2. Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Set up Supabase:
   - Create the required tables
   - Create a 'project-files' storage bucket
   - Configure security policies

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting platform.

## License

MIT License
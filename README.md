# 🌉 Client Bridge

> *Because keeping clients in the loop shouldn't feel like herding cats*

It is highly recommended to fork this project and self-host 🏠. Just create a `.env` file with `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL` and create a Supabase storage bucket called 'project-files' and you're done ✅.

Client Bridge is laser-focused on one thing: making client interaction effortless. No fancy project management features, no complex workflows - just simple, effective communication between you and your clients.

## 🎯 What Client Bridge Actually Does

Let's be real here. Your clients don't care about your Gantt charts or Kanban boards. They want to know what's happening with their project RIGHT NOW. That's where we come in.

### 📋 Simple Task Updates
- Add quick task notes so clients know what you're working on
- Mark things as done when you finish them (clients love progress!)
- Keep it simple - no overcomplicated task management here

### 💬 Real Talk (Threads)
- Open threads for specific topics (bugs, change requests, feedback)
- Back-and-forth conversations that actually stay organized
- Both you and your client can participate without clogging up email 📧
- Attach images when words aren't enough 📸

### 📄 Document Sharing
- Share project files, contracts, invoices in one place
- No more "I sent it last week" confusion
- Clients can access documents anytime

### 👥 Easy Client Access
- Invite clients with a simple link (zero tech skills required)
- Clean interface that won't intimidate anyone
- Real-time updates so clients always know what's happening

## 🧰 Built With Cool Stuff

- **React** + **Vite** - Fast and reliable ⚡
- **Tailwind CSS** - Clean, minimal design 🎨
- **Supabase** - Handles the backend magic 🤝
- **Lucide React** - Pretty icons 🎯

## 🛠️ Getting Started (Client Communication Edition)

### Prerequisites
- Node.js (v16 or higher) 🟩
- A Supabase account (it's free!) 🆓

### Setup Steps

1. **Clone the repo**:
   ```bash
   git clone <repository-url>
   cd client-bridge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or yarn install
   # or pnpm install
   ```

3. **Create your `.env` file**:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Set up Supabase**:
   - Create the required tables (profiles, projects, project_clients, todos, threads, thread_replies, documents)
   - Create a storage bucket named 'project-files'
   - Configure appropriate security policies

5. **Start the app**:
   ```bash
   npm run dev
   # or yarn dev
   # or pnpm dev
   ```

## 🚀 Deployment

1. **Build it**:
   ```bash
   npm run build
   # or yarn build
   # or pnpm build
   ```

2. **Deploy the `dist` folder** to your hosting platform of choice 🌍

## 🎮 How to Keep Clients Happy

1. Create a project for each client 👤
2. Add quick task updates as you work 📝
3. Invite your client using that magic link 💌
4. Open threads for discussions (bugs, changes, feedback)
5. Share documents directly in the project
6. Enjoy stress-free client communication 🎉

## 🤝 Want to Help?

Found a bug? Have an idea to make client communication even easier? We'd love to hear it! Open an issue and let's chat about it 🗨️.

## 📜 License

MIT License - do what you want with it, just don't blame us if your clients become too chatty 😄

---

*Client Bridge: Keeping clients updated since 2025* 🤝
import { User, Project, Todo, Thread, ThreadReply, Document } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@freelancer.com',
    role: 'freelancer'
  },
  {
    id: '2',
    name: 'David Chen',
    email: 'david@techcorp.com',
    role: 'client'
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@startup.io',
    role: 'client'
  },
  {
    id: '4',
    name: 'Michael Rodriguez',
    email: 'michael@agency.com',
    role: 'client'
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'TechCorp Website Redesign',
    freelancerId: '1',
    clientId: '2',
    clientName: 'David Chen',
    description: 'Complete redesign of company website with modern UI/UX, responsive design, and improved user experience',
    timeline: '8 weeks',
    progress: 75,
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastActivity: new Date('2024-02-20')
  },
  {
    id: '2',
    name: 'Startup Landing Page',
    freelancerId: '1',
    clientId: '3',
    clientName: 'Emma Davis',
    description: 'High-converting landing page for SaaS product launch with A/B testing setup',
    timeline: '4 weeks',
    progress: 40,
    status: 'active',
    createdAt: new Date('2024-02-01'),
    lastActivity: new Date('2024-02-18')
  },
  {
    id: '3',
    name: 'E-commerce Platform',
    freelancerId: '1',
    clientId: '4',
    clientName: 'Michael Rodriguez',
    description: 'Custom e-commerce solution with payment integration, inventory management, and admin dashboard',
    timeline: '12 weeks',
    progress: 25,
    status: 'active',
    createdAt: new Date('2024-02-10'),
    lastActivity: new Date('2024-02-19')
  }
];

export const mockTodos: Todo[] = [
  {
    id: '1',
    projectId: '1',
    title: 'Design homepage mockups',
    description: 'Create wireframes and high-fidelity mockups for the new homepage',
    completed: true,
    category: 'design',
    priority: 'high',
    createdAt: new Date('2024-01-16'),
    completedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    projectId: '1',
    title: 'Implement responsive navigation',
    description: 'Build mobile-first navigation with hamburger menu and smooth transitions',
    completed: true,
    category: 'feature',
    priority: 'high',
    createdAt: new Date('2024-01-18'),
    completedAt: new Date('2024-01-25')
  },
  {
    id: '3',
    projectId: '1',
    title: 'Fix mobile menu overlay issue',
    description: 'Mobile menu overlay not closing properly on iOS Safari',
    completed: false,
    category: 'bug',
    priority: 'medium',
    createdAt: new Date('2024-02-15')
  },
  {
    id: '4',
    projectId: '1',
    title: 'Add contact form validation',
    description: 'Implement client-side and server-side validation for contact form',
    completed: false,
    category: 'feature',
    priority: 'medium',
    createdAt: new Date('2024-02-18')
  },
  {
    id: '5',
    projectId: '1',
    title: 'Optimize images for web',
    description: 'Compress and optimize all images for faster loading times',
    completed: false,
    category: 'content',
    priority: 'low',
    createdAt: new Date('2024-02-19')
  },
  {
    id: '6',
    projectId: '2',
    title: 'Create hero section design',
    description: 'Design compelling hero section with clear value proposition',
    completed: true,
    category: 'design',
    priority: 'high',
    createdAt: new Date('2024-02-02'),
    completedAt: new Date('2024-02-05')
  },
  {
    id: '7',
    projectId: '2',
    title: 'Implement pricing calculator',
    description: 'Interactive pricing calculator with different plan options',
    completed: false,
    category: 'feature',
    priority: 'high',
    createdAt: new Date('2024-02-10')
  },
  {
    id: '8',
    projectId: '3',
    title: 'Set up product catalog structure',
    description: 'Design database schema and admin interface for product management',
    completed: true,
    category: 'feature',
    priority: 'high',
    createdAt: new Date('2024-02-11'),
    completedAt: new Date('2024-02-14')
  },
  {
    id: '9',
    projectId: '3',
    title: 'Integrate payment gateway',
    description: 'Set up Stripe integration for secure payment processing',
    completed: false,
    category: 'feature',
    priority: 'high',
    createdAt: new Date('2024-02-15')
  }
];

export const mockThreads: Thread[] = [
  {
    id: '1',
    projectId: '1',
    title: 'Homepage feedback and revisions',
    category: 'feedback',
    creatorId: '2',
    creatorName: 'David Chen',
    createdAt: new Date('2024-02-20'),
    replyCount: 3,
    lastActivity: new Date('2024-02-20'),
    isResolved: false
  },
  {
    id: '2',
    projectId: '1',
    title: 'Mobile menu not working on iPhone',
    category: 'bug',
    creatorId: '2',
    creatorName: 'David Chen',
    createdAt: new Date('2024-02-19'),
    replyCount: 2,
    lastActivity: new Date('2024-02-19'),
    isResolved: false
  },
  {
    id: '3',
    projectId: '2',
    title: 'Pricing section updates needed',
    category: 'general',
    creatorId: '3',
    creatorName: 'Emma Davis',
    createdAt: new Date('2024-02-18'),
    replyCount: 1,
    lastActivity: new Date('2024-02-18'),
    isResolved: true
  },
  {
    id: '4',
    projectId: '1',
    title: 'SEO optimization requirements',
    category: 'feature',
    creatorId: '1',
    creatorName: 'Sarah Johnson',
    createdAt: new Date('2024-02-17'),
    replyCount: 4,
    lastActivity: new Date('2024-02-18'),
    isResolved: false
  },
  {
    id: '5',
    projectId: '3',
    title: 'Product image requirements',
    category: 'general',
    creatorId: '4',
    creatorName: 'Michael Rodriguez',
    createdAt: new Date('2024-02-16'),
    replyCount: 2,
    lastActivity: new Date('2024-02-17'),
    isResolved: false
  }
];

export const mockThreadReplies: ThreadReply[] = [
  {
    id: '1',
    threadId: '1',
    authorId: '1',
    authorName: 'Sarah Johnson',
    content: 'Thanks for the detailed feedback! I\'ll implement those changes by tomorrow. The color adjustments and spacing improvements you mentioned will definitely enhance the overall look.',
    createdAt: new Date('2024-02-20')
  },
  {
    id: '2',
    threadId: '1',
    authorId: '2',
    authorName: 'David Chen',
    content: 'Perfect! Also, could we make the call-to-action button slightly larger? I think it would help with conversions.',
    createdAt: new Date('2024-02-20')
  },
  {
    id: '3',
    threadId: '1',
    authorId: '1',
    authorName: 'Sarah Johnson',
    content: 'Absolutely! I\'ll increase the button size and make it more prominent. Should have the updates ready for review this afternoon.',
    createdAt: new Date('2024-02-20')
  },
  {
    id: '4',
    threadId: '2',
    authorId: '1',
    authorName: 'Sarah Johnson',
    content: 'I\'ve identified the issue with the mobile menu on iOS Safari. It\'s related to the z-index stacking context. I\'ll push a fix today.',
    createdAt: new Date('2024-02-19')
  },
  {
    id: '5',
    threadId: '2',
    authorId: '2',
    authorName: 'David Chen',
    content: 'Great! Let me know when it\'s ready and I\'ll test it on my iPhone again.',
    createdAt: new Date('2024-02-19')
  },
  {
    id: '6',
    threadId: '3',
    authorId: '1',
    authorName: 'Sarah Johnson',
    content: 'I\'ve updated the pricing section with the new tiers and features you requested. Take a look and let me know if you need any adjustments.',
    createdAt: new Date('2024-02-18')
  }
];

export const mockDocuments: Document[] = [
  {
    id: '1',
    projectId: '1',
    title: 'Website Redesign - Initial Payment',
    type: 'invoice',
    link: 'https://invoice-example.com/inv001',
    amount: 2500,
    status: 'paid',
    createdAt: new Date('2024-01-15'),
    dueDate: new Date('2024-01-30')
  },
  {
    id: '2',
    projectId: '1',
    title: 'Project Contract & Terms',
    type: 'contract',
    link: 'https://contract-example.com/cont001',
    status: 'paid',
    createdAt: new Date('2024-01-14')
  },
  {
    id: '3',
    projectId: '2',
    title: 'Landing Page Development',
    type: 'invoice',
    link: 'https://invoice-example.com/inv002',
    amount: 1800,
    status: 'pending',
    createdAt: new Date('2024-02-01'),
    dueDate: new Date('2024-02-15')
  },
  {
    id: '4',
    projectId: '1',
    title: 'Website Redesign - Final Payment',
    type: 'invoice',
    link: 'https://invoice-example.com/inv003',
    amount: 2500,
    status: 'pending',
    createdAt: new Date('2024-02-15'),
    dueDate: new Date('2024-03-01')
  },
  {
    id: '5',
    projectId: '3',
    title: 'E-commerce Platform Proposal',
    type: 'proposal',
    link: 'https://proposal-example.com/prop001',
    amount: 8500,
    status: 'draft',
    createdAt: new Date('2024-02-10')
  }
];
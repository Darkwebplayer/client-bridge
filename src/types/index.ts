export interface User {
  id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'client';
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  freelancerId: string;
  description: string;
  timeline: string;
  progress: number;
  status: 'active' | 'completed' | 'on-hold';
  inviteToken?: string;
  createdAt: Date;
  lastActivity: Date;
  clients?: User[];
}

export interface Todo {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
}

export interface Thread {
  id: string;
  projectId: string;
  title: string;
  content?: string;
  category: 'general' | 'bug' | 'feature' | 'feedback';
  creatorId: string;
  creatorName: string;
  createdAt: Date;
  lastActivity: Date;
  replyCount: number;
  isResolved?: boolean;
  url?: string;
}

export interface ThreadReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  isEdited?: boolean;
  imageUrl?: string;
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  type: 'invoice' | 'contract' | 'proposal';
  link: string;
  amount?: number;
  status: 'pending' | 'paid' | 'overdue' | 'draft';
  createdAt: Date;
  dueDate?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'thread_reply' | 'project_update' | 'document_shared' | 'payment_received';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  projectId?: string;
  threadId?: string;
}
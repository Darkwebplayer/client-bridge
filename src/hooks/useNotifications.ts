import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Send notification to all project members except the creator
 * @param userId - ID of the user who created the item
 * @param projectId - ID of the project
 * @param type - Type of notification (thread, document, reply)
 * @param title - Title of the notification
 * @param message - Message content
 * @param relatedId - ID of the related item (thread, document, or reply)
 */
export async function sendNotification(
  userId: string,
  projectId: string,
  type: 'thread' | 'document' | 'reply',
  title: string,
  message: string,
  relatedId: string
) {
  try {
    console.log('sendNotification called with:', { userId, projectId, type, title, message, relatedId });
    
    // Get all project members except the creator
    console.log('Fetching project members for project:', projectId, 'excluding user:', userId);
    
    // Get the current user's role to determine how to fetch project members
    // Since we can't use useAuth hook here (this is not a React component),
    // we'll check if the user is a freelancer by trying to use the RPC function
    let projectMembers: { client_id: string }[] = [];
    let freelancerId: string | null = null;
    
    // Try to get project clients using the RPC function (for freelancers)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_project_clients_for_freelancer', { project_uuid: projectId });
    
    if (!rpcError && rpcData) {
      // This user is a freelancer, and we successfully got the clients
      projectMembers = rpcData.map((client: any) => ({ client_id: client.client_id }));
      
      // Get the freelancer ID
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('freelancer_id')
        .eq('id', projectId)
        .single();
      
      if (!projectError && projectData) {
        freelancerId = projectData.freelancer_id;
      }
    } else {
      // This user is likely a client, try direct query (which will work for clients)
      const { data: directData, error: directError } = await supabase
        .from('project_clients')
        .select('client_id')
        .eq('project_id', projectId)
        .neq('client_id', userId);
      
      if (!directError && directData) {
        projectMembers = directData;
      }
      
      // Get the freelancer ID
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('freelancer_id')
        .eq('id', projectId)
        .single();
      
      if (!projectError && projectData) {
        freelancerId = projectData.freelancer_id;
      }
    }

    console.log('Project members result:', projectMembers);
    console.log('Freelancer ID:', freelancerId);

    // Combine all recipients
    let recipientIds = [
      ...projectMembers.map(member => member.client_id),
    ];
    
    console.log('Creator ID:', userId);
    console.log('Freelancer ID:', freelancerId);
    console.log('Project members:', projectMembers);
    console.log('Initial recipient IDs:', recipientIds);
    
    // If the creator is not the freelancer, also notify the freelancer
    // If the creator is the freelancer, notify all clients
    if (freelancerId && userId !== freelancerId) {
      recipientIds.push(freelancerId);
      console.log('Added freelancer to recipients');
    }
    
    // Remove duplicates and exclude the creator
    recipientIds = [...new Set(recipientIds)].filter(id => id !== userId);
    
    console.log('Final recipient IDs:', recipientIds);

    // Create notifications for each recipient
    const notifications = recipientIds.map(recipientId => ({
      user_id: recipientId,
      project_id: projectId,
      type,
      title,
      message,
      related_id: relatedId
    }));

    if (notifications.length > 0) {
      console.log('Inserting notifications:', notifications);
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error inserting notifications:', insertError);
      } else {
        console.log('Notifications inserted:', notifications);
      }
    } else {
      console.log('No notifications to send');
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}
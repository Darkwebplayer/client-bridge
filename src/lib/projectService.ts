import { supabase } from '../lib/supabase';

export const createProjectWithClients = async (projectData: {
  name: string;
  description: string;
  timeline: string;
  freelancerId: string;
  clientEmails: string[];
}) => {
  try {
    console.log('Creating project with data:', projectData);
    
    // Generate a simple, URL-friendly random token
    const invite_token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    console.log('Generated invite token:', invite_token);

    // Start a Supabase transaction
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description,
        timeline: projectData.timeline,
        freelancer_id: projectData.freelancerId,
        invite_token: invite_token,
        status: 'active',
        progress: 0
      })
      .select()
      .single();

    console.log('Project creation result:', { project, projectError });

    if (projectError) throw projectError;

    // If client emails are provided, add them to the allowed_clients table
    if (projectData.clientEmails && projectData.clientEmails.length > 0) {
      const allowedClientsData = projectData.clientEmails.map(email => ({
        project_id: project.id,
        email: email.trim()
      }));

      console.log('Adding allowed clients:', allowedClientsData);
      
      const { error: allowedClientsError } = await supabase
        .from('allowed_clients')
        .insert(allowedClientsData);

      console.log('Allowed clients insertion result:', { error: allowedClientsError });

      if (allowedClientsError) throw allowedClientsError;
    }

    return { success: true, project };
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, error };
  }
};
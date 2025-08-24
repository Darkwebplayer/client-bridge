import { supabase } from '../lib/supabase';

export const createProjectWithClients = async (projectData: {
  name: string;
  description: string;
  timeline: string;
  freelancerId: string;
  clientEmails: string[];
}) => {
  try {
    // Start a Supabase transaction
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description,
        timeline: projectData.timeline,
        freelancer_id: projectData.freelancerId,
        status: 'active',
        progress: 0
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // If client emails are provided, add them to the allowed_clients table
    if (projectData.clientEmails && projectData.clientEmails.length > 0) {
      const allowedClientsData = projectData.clientEmails.map(email => ({
        project_id: project.id,
        email: email.trim()
      }));

      const { error: allowedClientsError } = await supabase
        .from('allowed_clients')
        .insert(allowedClientsData);

      if (allowedClientsError) throw allowedClientsError;
    }

    return { success: true, project };
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, error };
  }
};
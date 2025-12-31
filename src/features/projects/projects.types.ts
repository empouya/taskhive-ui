export interface Project {
  id: string;
  name: string;
  description: string;
  is_archived: boolean;
  team_id: string;
  created_at: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}
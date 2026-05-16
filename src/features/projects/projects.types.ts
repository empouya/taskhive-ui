export interface Project {
  id: number;
  name: string;
  description: string;
  is_archived: boolean;
  team_id: number;
  created_at: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}
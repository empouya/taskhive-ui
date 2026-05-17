export interface Project {
  id: number;
  name: string;
  description: string;
  is_archived: boolean;
  team_id: number;
  created_at: string;
}

export interface ProjectFormValues {
  name: string;
  description: string;
}

export type CreateProjectPayload = ProjectFormValues;
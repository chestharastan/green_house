export type UserRole = "Admin" | "FarmManager" | "Worker";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

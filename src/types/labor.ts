export type TaskStatus = "Pending" | "InProgress" | "Done" | "Cancelled";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  createdBy: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface WorkHourRecord {
  id: string;
  workerId: string;
  taskId?: string;
  clockIn: string;
  clockOut?: string;
  hoursLogged?: number;
  notes?: string;
}

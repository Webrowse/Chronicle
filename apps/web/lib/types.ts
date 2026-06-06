export type Task = {
  id: string;
  title: string;
  done: boolean;
  estimatedTime?: number;
};

export type DayRecord = {
  journal: string;
  reflection: string;
  mood: number;
  energy: number;
  tasks: Task[];
};

export type Store = {
  days: Record<string, DayRecord>;
};

// common
export enum TaskStatus {
  TODO = 0,
  Doing,
  Done,
  Pending,
  Closed
}

export function GetEnumKeys(enumType: Object): string[] {
  let ret = [] as string[]
  for (let item in enumType) {
    if (isNaN(Number(item))) {
        ret.push(item)
    }
  }
  return ret
}

// common
export interface Task {
  name: string;
  status: TaskStatus;
  plan: TaskPlan
  due_time: string;
  project: string;
}

export interface TaskPlan {
  year: number
  month: number
  week: number
  day: number
}

// view
export interface ViewTask {
  name: string;
  plan: TaskPlan
  status: TaskStatus;
  due_time: Date;
  project: string;
  editing?: boolean;
  editingName?: string;
}
import { Task, ViewTask } from '../models/tasks'
import { Pagination } from '../models/page'
import { axiosPost, axiosGet, axiosPatch, axiosDelete } from './axios'

const API_PREFIX = "/api/v1"

export async function AddTask(task: ViewTask, fn: (success: boolean)=>(void)) {
  let data = viewTaskToTask(task)
  let res = await axiosPost(`${API_PREFIX}/tasks`, data)
  fn(res)
}

export async function QueryAllTask(pg: Pagination, fn: (data: ViewTask[]|false) => (void)) {
  let res: any[] | false = await axiosGet(`${API_PREFIX}/tasks`)
  let ret = res
  if (res) {
    ret = res.map((one: Task) => taskToViewTask(one))
  }
  fn(ret)
}

export async function UpdateTask(name: string, task: ViewTask, fn: (success: boolean)=>(void)) {
  let data = viewTaskToTask(task)
  let res = await axiosPatch(`${API_PREFIX}/tasks/${name}`, data)
  fn(res)
}

export async function DeleteTask(name: string, fn: (success: boolean)=>(void)) {
  let res = await axiosDelete(`${API_PREFIX}/tasks/${name}`)
  fn(res)
}

// utility
  
function dateToString(date: Date): string {
  return date.toISOString()
} 

function viewTaskToTask(task: ViewTask): Task {
  let ret = {
    name: task.name,
    plan: task.plan,
    status: task.status,
    due_time: dateToString(task.due_time),
    project: task.project
  }
  return ret
}

function taskToViewTask(task: Task): ViewTask {
  let ret = {
    name: task.name,
    plan: task.plan,
    status: task.status,
    due_time: new Date(task.due_time),
    project: task.project
  }
  return ret
}
import { Task, ViewTask } from '../models/tasks'
import { axiosPut, axiosGet, axiosPatch, axiosDelete } from './axios'
import { taskToViewTask, viewTaskToTask } from './convert'

const API_PREFIX = "/api/v1"

export async function AddTask(name: string, fn: (success: boolean)=>(void)) {
  let res = await axiosPut(`${API_PREFIX}/tasks/${name}`, {})
  fn(res)
}

export async function QueryAllTask(fn: (data: ViewTask[]|false) => (void)) {
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
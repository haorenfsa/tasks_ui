import { Task, ViewTask } from '../models/tasks'
import { axiosPost, axiosPut, axiosGet, axiosPatch, axiosDelete } from './axios'
import { taskToViewTask, viewTaskToTask } from './convert'

const API_PREFIX = "/api/v1"

export async function AddTask(task: ViewTask, fn: (ret: ViewTask| false)=>(void)) {
  let res = await axiosPost(`${API_PREFIX}/tasks`, task, true)
  if (res) {
    let ret = taskToViewTask(res)
    fn(ret)
  }
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

export async function UpdateTask(task: ViewTask, fn: (success: boolean)=>(void)) {
  let data = viewTaskToTask(task)
  let res = await axiosPatch(`${API_PREFIX}/tasks`, data)
  fn(res)
}

export async function DeleteTask(id: number, fn: (success: boolean)=>(void)) {
  let res = await axiosDelete(`${API_PREFIX}/tasks/${id}`)
  fn(res)
}

export async function ChangePosition(id: number, position: number, fn: (success: boolean)=>(void)) {
  let res = await axiosPut(`${API_PREFIX}/tasks/${id}/position/${position}`, {})
  fn(res)
}
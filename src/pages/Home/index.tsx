import React, { Fragment } from "react";
import {
  Table,
  Input,
  Button,
  Row,
  Col,
  Select,
  Divider,
  Icon,
  DatePicker,
  Tag,
} from "antd";
import moment from "moment";
import { TaskStatus, ViewTask, GetEnumKeys, TaskPlan } from "../../models/tasks";

import {AddTask, QueryAllTask, UpdateTask, DeleteTask} from '../../api/tasks'
import { Pagination } from "../../models/page";

interface HomeState {
  currentView: string
  tasks: ViewTask[];
  pg: Pagination
}

const views = ["all", "none"]
const planViews = ["month", "week", "day"]

interface HomeProps {}

class Home extends React.Component<HomeProps, HomeState> {
  state = {
    currentView: "all",
    tasks: [] as ViewTask[],
    pg: {
      per_page: 10,
      page: 1,
    } as Pagination,
  };
  // rowSelection object indicates the need for row selection
  rowSelection = {
    onChange: (selectedRowKeys: any[], selectedRows: ViewTask[]) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
    getCheckboxProps: (record: ViewTask) => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name
    })
  };

  columns = [
    {
      width: 300,
      title: "Name",
      key: "name",
      render: (record: ViewTask) => {
        return (
          <div>
            {record.editing ? (
              <Input
                onPressEnter={this.handleUpdateTaskName(record)}
                onBlur={this.handleUpdateTaskName(record)}
                placeholder={"Input a name"}
                autoFocus={true}
                defaultValue={record.name}
                onChange={this.handleEditingTaskName(record)}
              />
            ) : (
              <Button type="dashed" onClick={this.handleStartEditingTaskName(record)} block={true}>
                {record.name} <Icon type="edit" />
              </Button>
            )}
          </div>
        );
      }
    },
    {
      width: 100,
      title: "Status",
      key: "status",
      render: (record: ViewTask) => (
        <Select value={record.status} onChange={this.updateTaskStatus(record)}>
          {GetEnumKeys(TaskStatus).map((name: any) => (
            <Select.Option key={`status-${name}`} value={TaskStatus[name]}>{name}</Select.Option>
          ))}
        </Select>
      )
    },
    {
      width: 200,
      title: "Plan",
      key: "plan",
      render: (record: ViewTask) => (
        <div>
          <DatePicker/>
        </div>
      )
    },
    {
      width: 200,
      title: "Due Time",
      key: "due_time",
      dataIndex: "due_time",
      render: (time: Date) => <DatePicker defaultValue={moment(time)} />
    },
    {
      width: 100,
      title: "Project",
      key: "project",
      dataIndex: "project",
      render: (plan: string) => <Tag color="cyan">{plan}</Tag>
    },
    {
      width: 100,
      title: "Action",
      key: "action",
      render: (record: ViewTask) => {
        return (<Button type="danger" onClick={this.handleDeleteTask(record.name)}>delete</Button>)
      }
    }
  ];

  componentDidMount() {
    this.queryAllTask()
  }

  queryAllTask = () => {
    let { pg } = this.state
    QueryAllTask(pg, (ret: ViewTask[] | false) => {
      if (ret) {
        this.setState({
          tasks: ret
        })
      }
    })
  }

  updateTaskStatus = (task: ViewTask) => {
    return (newStatus: TaskStatus) => {
      task.status = newStatus
      UpdateTask(task.name, task, (success:boolean) => {
        if (success) {
          this.setStateUpdateTask(task.name, task)
        }
      })
    }
  }

  setStateUpdateTask(name: string, task: ViewTask) {
    let { tasks } = this.state
    let i = tasks.findIndex((old: ViewTask) => name === old.name)
    tasks[i] = task
    this.setState({
      tasks
    })
  }

  handleStartEditingTaskName = (task: ViewTask) => () => {
    task.editing = true
    task.editingName = task.name
    this.setStateUpdateTask(task.name, task)
  }

  handleEditingTaskName = (task: ViewTask) => (e: any) => {
    task.editingName = e.target.value
    this.setStateUpdateTask(task.name, task)
  }

  handleUpdateTaskName = (task: ViewTask) => () => {
    const oldName = task.name
    if (!task.editingName) {
      return
    }
    task.name = task.editingName
    task.editingName = undefined
    task.editing = false
    if (task.name === oldName) {
      this.setStateUpdateTask(oldName, task)
      return
    }
    UpdateTask(oldName, task, (ok: boolean) => {
      if (ok) {
        this.setStateUpdateTask(oldName, task)
      }
    })
  };

  handleAddTask = (task: ViewTask) => () => {
    AddTask(task, (ok: boolean) => {
      if (ok) {
        let { tasks } = this.state
        tasks = [task, ...tasks]
        this.setState({tasks})
      }
    })
  };

  handleAddNewTask = () => {
    let tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    const newTask = {
      name: `{new task}`,
      status: TaskStatus.TODO,
      plan: {} as TaskPlan,
      due_time: tomorrow,
      project: "",
      editing: true,
    };

    this.setState({
    }, this.handleAddTask(newTask));
  };

  handleDeleteTask = (name: string) => () => {
    DeleteTask(name, (success: boolean) => {
      if (success) {
        let tasks = this.state.tasks.filter((one: ViewTask) => {
          return one.name !== name
        })
        this.setState({ tasks })
      }
    })
  }

  render() {
    let { tasks } = this.state
    return (
      <Fragment>
        <Row>
          <Col span={4}>
            {"Plan: "}
            <Select defaultValue="all" style={{ width: 90 }}>
              <Select.Option key="all">all</Select.Option>
              <Select.Option key="none">none</Select.Option>
              <Select.Option key="day">day</Select.Option>
              <Select.Option key="wk">week</Select.Option>
              <Select.Option key="mon">month</Select.Option>
            </Select>
          </Col>
          <Col span={6}>
            {"Date: "}
            <DatePicker />{" "}
            <Button shape="circle">
              <Icon type="left" />
            </Button>
            <Button shape="circle">
              <Icon type="right" />
            </Button>
          </Col>
          <Col span={1} />
          <Col span={4}>
            <Input.Search />
          </Col>
        </Row>
        <Row>
          <Divider
            orientation="left"
            style={{ color: "#333", fontWeight: "normal" }}
          />
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={4}>
            <Button
              type="primary"
              shape="round"
              onClick={this.handleAddNewTask}
            >
              <Icon type="plus" />
              Add
            </Button>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Table
            rowKey="name"
            rowSelection={this.rowSelection}
            columns={this.columns}
            dataSource={tasks}
          />
        </Row>
       
      </Fragment>
    );
  }
}
export default Home;

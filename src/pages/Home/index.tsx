import React, { Fragment } from "react";
import { Input, Button, Row, Col, Select, Icon, Radio } from "antd";
import { TaskStatus, ViewTask, GetEnumKeys } from "../../models/tasks";

import {
  AddTask,
  QueryAllTask,
  UpdateTask,
  DeleteTask,
  ChangePosition,
} from "../../api/tasks";
import { Pagination } from "../../models/page";

import PlanPicker from "../../components/PlanPicker";
import DragTable from "../../components/DragableTable";

interface HomeState {
  currentView: string;
  tasks: ViewTask[];
  pg: Pagination;
  filter: any;
}

interface HomeProps {}

class Home extends React.Component<HomeProps, HomeState> {
  state = {
    currentView: "all",
    tasks: [] as ViewTask[],
    pg: {
      per_page: 10,
      page: 1,
    } as Pagination,
    filter: this.filterGetter([TaskStatus.TODO]),
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
      name: record.name,
    }),
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
              <Button
                type="dashed"
                onClick={this.handleStartEditingTaskName(record)}
                block={true}
              >
                {record.name} <Icon type="edit" />
              </Button>
            )}
          </div>
        );
      },
    },
    {
      width: 200,
      title: "Status",
      key: "status",
      render: (record: ViewTask) => (
        <Select
          style={{ width: 150 }}
          value={record.status}
          onChange={this.updateTaskStatus(record)}
        >
          {GetEnumKeys(TaskStatus).map((name: any) => (
            <Select.Option key={`status-${name}`} value={TaskStatus[name]}>
              {name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      width: 200,
      title: "Plan",
      key: "plan",
      render: (record: ViewTask) => (
        <div>
          <PlanPicker
            value={record.plan.moment}
            onChangePicker={this.handleChangePlanDate(record)}
            defaultPickerLevel={record.plan.level}
          />
        </div>
      ),
    },
    {
      width: 100,
      title: "Action",
      key: "action",
      render: (record: ViewTask) => {
        return (
          <Button type="danger" onClick={this.handleDeleteTask(record.id)}>
            delete
          </Button>
        );
      },
    },
  ];

  componentDidMount() {
    this.queryAllTask();
  }

  queryAllTask = () => {
    QueryAllTask((ret: ViewTask[] | false) => {
      if (ret) {
        this.setState({
          tasks: ret,
        });
      }
    });
  };

  updateTaskStatus = (task: ViewTask) => {
    return (newStatus: TaskStatus) => {
      task.status = newStatus;
      this.updateTask(task);
    };
  };

  updateTask = (task: ViewTask) => {
    UpdateTask(task, (success: boolean) => {
      if (success) {
        this.setStateUpdateTask(task);
      }
    });
  };

  setStateUpdateTask(task: ViewTask) {
    let { tasks } = this.state;
    let i = tasks.findIndex((old: ViewTask) => task.id === old.id);
    tasks[i] = task;
    this.setState({
      tasks,
    });
  }

  handleChangePlanDate = (task: ViewTask) => (moment: any, level: string) => {
    task.plan = { moment: moment, level: level };
    this.updateTask(task);
  };

  handleStartEditingTaskName = (task: ViewTask) => () => {
    task.editing = true;
    task.editingName = task.name;
    this.setStateUpdateTask(task);
  };

  handleEditingTaskName = (task: ViewTask) => (e: any) => {
    task.editingName = e.target.value;
    this.setStateUpdateTask(task);
  };

  handleUpdateTaskName = (task: ViewTask) => () => {
    const oldName = task.name;
    if (!task.editingName) {
      return;
    }
    task.name = task.editingName;
    task.editingName = undefined;
    task.editing = false;
    if (task.name === oldName) {
      this.setStateUpdateTask(task);
      return;
    }
    UpdateTask(task, (ok: boolean) => {
      if (ok) {
        this.setStateUpdateTask(task);
      }
    });
  };

  handleAddTask = (name: string) => () => {
    AddTask({ name: name } as ViewTask, (ok: ViewTask | false) => {
      if (ok) {
        this.queryAllTask();
      }
    });
  };

  handleAddNewTask = () => {
    let tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    this.setState({}, this.handleAddTask("New Task"));
  };

  handleDeleteTask = (id: number) => () => {
    DeleteTask(id, (success: boolean) => {
      if (success) {
        let tasks = this.state.tasks.filter((one: ViewTask) => {
          return one.id !== id;
        });
        this.setState({ tasks });
      }
    });
  };

  onMoveRow = async (index: number, newIndex: number) => {
    const targetPosition = this.state.tasks.length - newIndex;
    let ret = false;
    await ChangePosition(
      this.state.tasks[index].id,
      targetPosition,
      (success: boolean) => {
        ret = success;
      }
    );
    return ret;
  };

  allFilter(tasks: any[]) {
    return tasks;
  }

  filterGetter(statuses: TaskStatus[]) {
    return (tasks: ViewTask[]) => {
      return tasks.filter((v: ViewTask) => {
        for (let index = 0; index < statuses.length; index++) {
          if (v.status === statuses[index]) {
            return true;
          }
        }
        return false;
      });
    }
  }

  render() {
    let { tasks } = this.state;
    let filteredTasks = this.state.filter(tasks);
    return (
      <Fragment>
        <Row>
          Status:{" "}
          <Radio.Group defaultValue="2">
            <Radio.Button value="1"
              onClick={() => this.setState({ filter: this.allFilter })}
            >
              All
            </Radio.Button>
            <Radio.Button value="2"
              onClick={() =>
                this.setState({ filter: this.filterGetter([TaskStatus.TODO]) })
              }
            >
              TODO
            </Radio.Button>
            <Radio.Button value="3"
              onClick={() =>
                this.setState({
                  filter: this.filterGetter([
                    TaskStatus.Doing,
                    TaskStatus.Pending,
                  ]),
                })
              }
            >
              Doing/Pending
            </Radio.Button>
            <Radio.Button value="4"
              onClick={() =>
                this.setState({
                  filter: this.filterGetter([
                    TaskStatus.Done,
                    TaskStatus.Closed,
                  ]),
                })
              }
            >
              Done/Closed
            </Radio.Button>
          </Radio.Group>
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
          <DragTable
            onMoveRow={this.onMoveRow}
            rowKey="id"
            rowSelection={this.rowSelection}
            columns={this.columns}
            data={filteredTasks}
          />
        </Row>
      </Fragment>
    );
  }
}
export default Home;

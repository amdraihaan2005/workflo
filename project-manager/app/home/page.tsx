"use client";

import {
  Priority,
  Project,
  Task,
  useGetProjectsQuery,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useGetTasksByUserQuery,
  useGetTeamsQuery,
  useGetUserQuery,
} from "@/state/api";
import React, { useState } from "react";
import { useAppSelector } from "../redux";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Header from "@/components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Users,
  PlusCircle,
  FolderOpen,
  User,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

const HomePage = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const cognitoId = user?.userId;

  // Redux & State
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [chartTab, setChartTab] = useState<"priority" | "status">("priority");
  const [taskScope, setTaskScope] = useState<"all" | "my">("my");

  // Form Fields for Quick Create Task
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newPriority, setNewPriority] = useState(Priority.Medium);
  const [newStatus, setNewStatus] = useState("To Do");
  const [newPoints, setNewPoints] = useState("3");
  const [taskSuccessMessage, setTaskSuccessMessage] = useState("");

  // Queries & Mutations
  const { data: dbUser } = useGetUserQuery(cognitoId || "", { skip: !cognitoId });
  const { data: projects, isLoading: isProjectsLoading } = useGetProjectsQuery();
  const { data: teams } = useGetTeamsQuery();
  const { data: allTasks, isLoading: isAllTasksLoading, isError: isAllTasksError } = useGetTasksQuery();
  
  const { 
    data: myTasks, 
    isLoading: isMyTasksLoading 
  } = useGetTasksByUserQuery(dbUser?.userId || 0, {
    skip: !dbUser?.userId,
  });

  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  // Loading / Error Screen
  if (isProjectsLoading || isAllTasksLoading || (dbUser?.userId && isMyTasksLoading)) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading Dashboard analytics...</p>
      </div>
    );
  }

  if (isAllTasksError || !allTasks || !projects) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-3 text-red-500">
        <AlertCircle className="h-10 w-10" />
        <p className="text-sm font-medium">Error fetching dashboard data from server</p>
      </div>
    );
  }

  // Calculate Metrics
  const totalProjects = projects.length;
  const activeTasksCount = allTasks.filter(t => t.status !== "Completed").length;
  const completedTasksCount = allTasks.filter(t => t.status === "Completed").length;
  const userTeamName = teams?.find((t) => t.id === dbUser?.teamId)?.teamName || "Not Assigned";

  // Recharts Chart Distributions
  const priorityCount = allTasks.reduce(
    (acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      return acc;
    },
    {},
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  const projectStatusCount = projects.reduce(
    (acc: Record<string, number>, project: Project) => {
      const status = project.endDate ? "Completed" : "Active";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {},
  );

  const projectStatusData = Object.keys(projectStatusCount).map((key) => ({
    name: key,
    count: projectStatusCount[key],
  }));

  const chartColors = isDarkMode
    ? {
        bar: "#3b82f6",
        barGrid: "#2d3135",
        pieFill: "#60a5fa",
        text: "#FFFFFF",
      }
    : {
        bar: "#0275ff",
        barGrid: "#e5e7eb",
        pieFill: "#93c5fd",
        text: "#374151",
      };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Inline complete handler
  const handleToggleComplete = async (taskId: number, currentStatus?: string) => {
    try {
      const nextStatus = currentStatus === "Completed" ? "To Do" : "Completed";
      await updateTaskStatus({ taskId, status: nextStatus }).unwrap();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  // Quick Task Form Submit
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProject) return;

    try {
      await createTask({
        title: newTitle,
        description: newDesc,
        status: newStatus as any,
        priority: newPriority as any,
        projectId: Number(newProject),
        points: Number(newPoints) || 0,
        authorUserId: dbUser?.userId || 1,
        assignedUserId: dbUser?.userId || 1,
      }).unwrap();

      // Reset
      setNewTitle("");
      setNewDesc("");
      setNewPoints("3");
      setTaskSuccessMessage("Task created successfully!");
      setTimeout(() => setTaskSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  // Determine active list tasks
  const displayTasks = taskScope === "my" ? (myTasks || []) : allTasks;

  // DataGrid Columns Definition
  const taskColumns: GridColDef[] = [
    { field: "title", headerName: "Title", width: 220 },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => {
        const status = params.value;
        const isCompleted = status === "Completed";
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isCompleted
              ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
              : "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400"
          }`}>
            {status || "To Do"}
          </span>
        );
      }
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 130,
      renderCell: (params) => {
        const priority = params.value;
        let colorClass = "bg-gray-100 text-gray-800 dark:bg-dark-tertiary dark:text-gray-300";
        if (priority === "Urgent" || priority === "High") {
          colorClass = "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400";
        } else if (priority === "Medium") {
          colorClass = "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400";
        }
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
            {priority}
          </span>
        );
      }
    },
    { field: "dueDate", headerName: "Due Date", width: 140 },
    {
      field: "completeAction",
      headerName: "Action",
      width: 130,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const task = params.row as Task;
        const isCompleted = task.status === "Completed";
        return (
          <div className="flex h-full w-full items-center justify-center">
            <button
              onClick={() => handleToggleComplete(task.id, task.status)}
              className={`flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                isCompleted
                  ? "border-green-200 bg-green-50/50 text-green-600 dark:border-green-800/30 dark:bg-green-500/10 dark:text-green-400"
                  : "border-blue-200 bg-blue-50/50 text-blue-primary hover:bg-blue-50 dark:border-blue-800/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Completed
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" />
                  Mark Done
                </>
              )}
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8 space-y-6">
      
      {/* Banner/Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-blue-500/10 bg-gradient-to-r from-blue-600/10 to-indigo-600/5 p-6 dark:border-blue-500/20 dark:from-blue-600/10 dark:to-indigo-500/5">
        <div className="flex items-center gap-4">
          <div className="relative rounded-full border-2 border-blue-500/30 p-0.5 overflow-hidden">
            <img
              src={`/${dbUser?.profilePictureUrl || "p1.jpeg"}`}
              alt="Avatar"
              className="h-14 w-14 rounded-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Welcome back, {dbUser?.username || user?.username || "Guest"}!
              </h2>
              <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/20 animate-pulse" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Here's the latest update for your projects and active assignments today.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Projects KPI */}
        <div className="flex items-center justify-between rounded-xl border border-gray-250 bg-white p-5 shadow-sm transition-all hover:scale-102 hover:shadow-md dark:border-stroke-dark dark:bg-dark-secondary">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Projects</span>
            <h3 className="text-2xl font-bold text-gray-950 dark:text-white">{totalProjects}</h3>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>

        {/* Active Tasks KPI */}
        <div className="flex items-center justify-between rounded-xl border border-gray-250 bg-white p-5 shadow-sm transition-all hover:scale-102 hover:shadow-md dark:border-stroke-dark dark:bg-dark-secondary">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Tasks</span>
            <h3 className="text-2xl font-bold text-gray-950 dark:text-white">{activeTasksCount}</h3>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Completed Tasks KPI */}
        <div className="flex items-center justify-between rounded-xl border border-gray-250 bg-white p-5 shadow-sm transition-all hover:scale-102 hover:shadow-md dark:border-stroke-dark dark:bg-dark-secondary">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Completed Tasks</span>
            <h3 className="text-2xl font-bold text-gray-950 dark:text-white">{completedTasksCount}</h3>
          </div>
          <div className="rounded-lg bg-green-50 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Assigned Team KPI */}
        <div className="flex items-center justify-between rounded-xl border border-gray-250 bg-white p-5 shadow-sm transition-all hover:scale-102 hover:shadow-md dark:border-stroke-dark dark:bg-dark-secondary">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Assigned Team</span>
            <h3 className="text-lg font-bold text-gray-950 dark:text-white truncate max-w-[150px]">{userTeamName}</h3>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts & Form Middle Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Visual Charts Card (2/3 width) */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-md font-bold text-gray-900 dark:text-white">Analytics Overview</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Distribution analysis of tasks and projects</p>
            </div>
            
            {/* Visualizer Tabs */}
            <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-dark-bg">
              <button
                type="button"
                onClick={() => setChartTab("priority")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  chartTab === "priority"
                    ? "bg-white text-gray-900 shadow dark:bg-dark-secondary dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Task Priorities
              </button>
              <button
                type="button"
                onClick={() => setChartTab("status")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  chartTab === "status"
                    ? "bg-white text-gray-900 shadow dark:bg-dark-secondary dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Project Status
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[300px]">
            {chartTab === "priority" ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.barGrid} />
                  <XAxis dataKey="name" stroke={chartColors.text} fontSize={11} />
                  <YAxis stroke={chartColors.text} fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1d1f21" : "#ffffff",
                      borderColor: isDarkMode ? "#2d3135" : "#e5e7eb",
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                    itemStyle={{
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                    labelStyle={{
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                  />
                  <Bar dataKey="count" fill={chartColors.bar} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="count"
                    data={projectStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    fill="#82ca9d"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1d1f21" : "#ffffff",
                      borderColor: isDarkMode ? "#2d3135" : "#e5e7eb",
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                    itemStyle={{
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                    labelStyle={{
                      color: isDarkMode ? "#ffffff" : "#000000",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Task Form Card (1/3 width) */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
          <div className="mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-stroke-dark pb-3">
            <PlusCircle className="h-5 w-5 text-blue-500" />
            <div>
              <h3 className="text-md font-bold text-gray-900 dark:text-white">Quick Task Creator</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Insert a task instantly to a project</p>
            </div>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            {/* Project Select */}
            <div>
              <label htmlFor="formProject" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Target Project</label>
              <select
                id="formProject"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-stroke-dark dark:bg-dark-bg dark:text-white"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
              >
                <option value="">Select Project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Title */}
            <div>
              <label htmlFor="formTitle" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Task Title</label>
              <input
                id="formTitle"
                type="text"
                required
                placeholder="Name your task..."
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-stroke-dark dark:bg-dark-bg dark:text-white"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            {/* Task Description */}
            <div>
              <label htmlFor="formDesc" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Description</label>
              <textarea
                id="formDesc"
                placeholder="Task details..."
                className="mt-1 block w-full h-16 rounded-lg border border-gray-300 bg-white p-2.5 text-xs focus:border-blue-500 focus:outline-none resize-none dark:border-stroke-dark dark:bg-dark-bg dark:text-white"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            {/* Status & Priority Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="formStatus" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</label>
                <select
                  id="formStatus"
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none dark:border-stroke-dark dark:bg-dark-bg dark:text-white"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="To Do">To Do</option>
                  <option value="Work In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label htmlFor="formPriority" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Priority</label>
                <select
                  id="formPriority"
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none dark:border-stroke-dark dark:bg-dark-bg dark:text-white"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
                >
                  <option value={Priority.Backlog}>Backlog</option>
                  <option value={Priority.Low}>Low</option>
                  <option value={Priority.Medium}>Medium</option>
                  <option value={Priority.High}>High</option>
                  <option value={Priority.Urgent}>Urgent</option>
                </select>
              </div>
            </div>

            {/* Points & Submit */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-1/3">
                <label htmlFor="formPoints" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Points</label>
                <input
                  id="formPoints"
                  type="number"
                  min="0"
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none dark:border-stroke-dark dark:bg-dark-bg dark:text-white"
                  value={newPoints}
                  onChange={(e) => setNewPoints(e.target.value)}
                />
              </div>
              <div className="w-2/3 pt-4">
                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-primary py-2 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-60 transition-colors"
                >
                  {isCreatingTask ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add Task"
                  )}
                </button>
              </div>
            </div>

            {/* Success Feedback Badge */}
            {taskSuccessMessage && (
              <div className="text-center rounded-lg bg-green-500/10 border border-green-500/20 py-2 text-xs font-semibold text-green-600 dark:text-green-400 transition-all">
                {taskSuccessMessage}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Row - Your Work Task List (Full Width) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-md font-bold text-gray-900 dark:text-white">Your Work Tasks</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">View tasks and complete them inline</p>
          </div>

          {/* Scope Filters */}
          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-dark-bg w-fit">
            <button
              type="button"
              onClick={() => setTaskScope("my")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                taskScope === "my"
                  ? "bg-white text-gray-900 shadow dark:bg-dark-secondary dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              My Assigned
            </button>
            <button
              type="button"
              onClick={() => setTaskScope("all")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                taskScope === "all"
                  ? "bg-white text-gray-900 shadow dark:bg-dark-secondary dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              All System
            </button>
          </div>
        </div>

        {/* DataGrid View */}
        <div style={{ height: 350, width: "100%" }}>
          <DataGrid
            rows={displayTasks}
            columns={taskColumns}
            checkboxSelection
            getRowClassName={() => "data-grid-row"}
            getCellClassName={() => "data-grid-cell"}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
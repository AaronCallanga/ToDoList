import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  SxProps,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import UpdateIcon from "@mui/icons-material/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useEffect, useReducer, useState } from "react";
import {
  ArrowDownward,
  ArrowUpward,
  Cancel,
  Check,
  CheckCircleOutline,
  Close,
  Info,
  Summarize,
  Task,
} from "@mui/icons-material";
import { Theme } from "@emotion/react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { v4 as uuidv4 } from "uuid";

type Status = "Not Started" | "In Progress" | "Paused" | "Completed";

type Task = {
  id: string;
  taskSummary: string;
  taskDescription: string;
  deadline: Dayjs;
  status: Status;
};

type Action =
  | { type: "ADD"; payload: Task }
  | { type: "UPDATE"; payload: Task }
  | { type: "DELETE"; payload: { id: string } }
  | { type: "FETCH"; payload: Task[] };

type SortBy = "deadline" | "summary" | "status";
type SortOrder = "ASC" | "DESC";

type ResponseMessage =
  | "Task added succesfully"
  | "Task updated succesfully"
  | "Task deleted succesfully";

type ResponseSeverity = "success" | "error" | "info" | "warning";

type Response = {
  open: boolean;
  message: ResponseMessage;
  severity: ResponseSeverity;
};

const modalStyle: SxProps<Theme> = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const App = () => {
  //const [tasks, setTasks] = useState<Task[]>([]);
  const [response, setResponse] = useState<Response>({
    open: false,
    message: "Task added succesfully",
    severity: "success",
  });
  const [summary, setSummary] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [deadline, setDeadline] = useState<Dayjs | null>(dayjs());
  const [status, setStatus] = useState<Status>("Not Started");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showInfo, setShowinfo] = useState<boolean>(false);
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [showUpdate, setShowUpdate] = useState<boolean>(false);
  const [dataHasFetched, setDataHasFetched] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortBy>("deadline");
  const [sortOrder, setSortOrder] = useState<SortOrder>("ASC");

  const taskReducer = (state: Task[], action: Action): Task[] => {
    switch (action.type) {
      case "ADD":
        return [...state, action.payload];

      case "UPDATE":
        return state.map((task) =>
          task.id === action.payload?.id
            ? {
                ...task, // can also be just ...action.payload
                taskSummary: action.payload.taskSummary, //overwrite the data
                taskDescription: action.payload.taskDescription,
                deadline: action.payload.deadline ?? dayjs(),
                status: action.payload.status,
              }
            : task
        );

      case "DELETE":
        return state.filter((task) => task.id !== action.payload.id);

      case "FETCH":
        return action.payload;

      default:
        return state;
    }
  };

  const [tasks, dispatch] = useReducer(taskReducer, []);

  const resetForm = () => {
    setSummary("");
    setDescription("");
    setDeadline(dayjs());
    setStatus("Not Started");
  }

  useEffect(() => {
    const savedData = localStorage.getItem("tasks"); //get the json string
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const restored = parsed.map((task: Task) => ({
        ...task,
        deadline: dayjs(task.deadline),
      }));
      dispatch({ type: "FETCH", payload: restored });
    } //make it json to object of type Task
    setDataHasFetched(true);
  }, []);

  useEffect(() => {
    if (dataHasFetched) localStorage.setItem("tasks", JSON.stringify(tasks)); //make it as json string
  }, [tasks, dataHasFetched]);

  const handleSummaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(e.target.value);
  };
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };
  const handleDeadlineChange = (newDate: Dayjs | null) => {
    setDeadline(newDate);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(e.target.value as Status);
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddTask = () => {
    const task: Task = {
      id: uuidv4(), //npm install uuid, npm install --save-dev @types/uuidement>
      taskSummary: summary,
      taskDescription: description?.trim() //empty string "" result to false
        ? description
        : "No Task Description",
      deadline: deadline ?? dayjs(), //default if null "??"
      status,
    };
    // setTasks((prev) => [...prev, task]);
    dispatch({ type: "ADD", payload: task });

    resetForm();
  };

  const handleUpdateTask = () => {
    const updatedTask: Task = {
      id: selectedTask ? selectedTask?.id : uuidv4(),
      taskSummary: summary, //overwrite the data
      taskDescription: description,
      deadline: deadline ?? dayjs(),
      status,
    };
    dispatch({ type: "UPDATE", payload: updatedTask });

    resetForm();
  };

  const handleDeleteTask = (id: string) => {
    dispatch({ type: "DELETE", payload: { id: id } });
  };

  const handleOpenAddTask = (): void => setShowAddTask(true);
  const handleCloseAddTask = (): void => setShowAddTask(false);

  const handleOpenInfo = (task: Task): void => {
    setSelectedTask(task);
    setShowinfo(true);
  };
  const handleCloseInfo = (): void => {
    setSelectedTask(null);
    setShowinfo(false);
  };

  const handleOpenUpdate = (task: Task): void => {
    setSelectedTask(task); // task?  check if null or undefined
    setSummary(task?.taskSummary);
    setDescription(task?.taskDescription);
    setDeadline(task?.deadline);
    setStatus(task?.status);
    setShowUpdate(true);
  };

  const handleCloseUpdate = (): void => {
    setSelectedTask(null);
    resetForm();
    setShowUpdate(false);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;

    if (sortField === "deadline") {
      comparison = a.deadline.unix() - b.deadline.unix();
    } else if (sortField === "summary") {
      comparison = a.taskSummary.localeCompare(b.taskSummary);
    } else if (sortField === "status") {
      comparison = a.status.localeCompare(b.status);
    }

    return sortOrder === "ASC" ? comparison : -comparison;
  });

  const handleShowResponse = (
    message: ResponseMessage,
    severity: ResponseSeverity
  ) => {
    setResponse({ open: true, message, severity });
  };

  const handleCloseResponse = () => {
    setResponse({ ...response, open: false });
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        gap: 2,
      }}
    >
      <Snackbar
        open={response.open}
        onClose={handleCloseResponse}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={response.severity}>{response.message}</Alert>
      </Snackbar>
      <Typography variant="h4" gutterBottom sx={{ marginTop: 3 }}>
        Task Management
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          width: "100%",
          mb: 4,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          label="Search Task"
          size="small"
          sx={{ flex: 7 }}
          value={searchTerm}
          onChange={handleChangeSearch}
        />
        <ToggleButtonGroup
          value={sortOrder}
          exclusive
          onChange={(_, newOrder) => {
            if (newOrder !== null) setSortOrder(newOrder);
          }}
          aria-label="sort order"
          size="small"
        >
          <ToggleButton value="ASC" aria-label="Ascending">
            <ArrowUpward />
          </ToggleButton>
          <ToggleButton value="DESC" aria-label="Descending">
            <ArrowDownward />
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={sortField}
          exclusive
          onChange={(_, newField) => {
            if (newField !== null) setSortField(newField);
          }}
          aria-label="sort field"
          size="small"
        >
          <ToggleButton value="deadline">
            <ScheduleIcon />
          </ToggleButton>
          <ToggleButton value="summary">
            <Summarize />
          </ToggleButton>
          <ToggleButton value="status">
            <CheckCircleOutline />
          </ToggleButton>
        </ToggleButtonGroup>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ flex: 1 }}
          endIcon={<AddBoxIcon />}
          onClick={handleOpenAddTask}
        >
          Task
        </Button>
      </Box>
      <Modal open={showAddTask} onClose={handleCloseAddTask}>
        <Box sx={modalStyle} display={"flex"} gap={2} flexDirection={"column"}>
          <Stack
            direction={"row"}
            textAlign={"center"}
            alignItems={"center"}
            gap={2}
          >
            <Typography>Summary: </Typography>
            <TextField
              label="Summary"
              fullWidth
              value={summary}
              onChange={handleSummaryChange}
              error={!summary.trim()}
              helperText={!summary.trim() ? "Summary is required" : ""}
              required
            ></TextField>
          </Stack>
          <Stack direction={"column"} gap={2}>
            <Typography>Description: </Typography>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={handleDescriptionChange}
            ></TextField>
          </Stack>
          <Stack direction={"row"} alignItems={"center"} gap={1.5}>
            <Typography>Deadline: </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker value={deadline} onChange={handleDeadlineChange} />
            </LocalizationProvider>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <RadioGroup
                sx={{ display: "flex", flexDirection: "row" }}
                value={status}
                onChange={handleStatusChange}
              >
                <FormControlLabel
                  control={<Radio size="small" />}
                  label="Not Started"
                  value="Not Started"
                  labelPlacement="bottom"
                />
                <FormControlLabel
                  control={<Radio size="small" />}
                  label="In Progress"
                  value="In Progress"
                  labelPlacement="bottom"
                />
                <FormControlLabel
                  control={<Radio size="small" />}
                  label="Paused"
                  value="Paused"
                  labelPlacement="bottom"
                />
                <FormControlLabel
                  control={<Radio size="small" />}
                  label="Completed"
                  value="Completed"
                  labelPlacement="bottom"
                />
              </RadioGroup>
            </FormControl>
          </Stack>
          <Stack direction={"row"} justifyContent={"space-evenly"}>
            <Button
              onClick={handleCloseAddTask}
              variant="contained"
              color="error"
            >
              <Close />
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleAddTask();
                handleCloseAddTask();
                handleShowResponse("Task added succesfully", "success");
              }}
              disabled={!summary.trim() || !status.trim()}
            >
              <Check />
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
        }}
      >
        {sortedTasks
          .filter((task) =>
            task.taskSummary.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((task, i) => (
            <Paper
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "center",
                p: 1,
              }}
              elevation={1}
              key={i}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flex: 3,
                  textAlign: "center",
                  alignItems: "center",
                  marginRight: 2,
                }}
              >
                <Typography sx={{ flex: 6 }}>{task.taskSummary}</Typography>
                <Stack
                  direction={"row"}
                  gap={2}
                  justifyContent={"space-evenly"}
                >
                  <Chip
                    label={task.deadline?.format("MMM D, YYYY")}
                    color="error"
                    variant="outlined"
                    sx={{ minWidth: 120, justifyContent: "center" }}
                  />
                  <Chip
                    sx={{ minWidth: 90, justifyContent: "center" }}
                    label={task.status}
                    color={
                      task.status === "Not Started"
                        ? "default"
                        : task.status === "In Progress"
                        ? "primary"
                        : task.status === "Paused"
                        ? "warning"
                        : "success"
                    }
                  />
                </Stack>
              </Box>
              <ButtonGroup>
                {/*sx={{ display: "flex", gap: 2 }}*/}
                <Button
                  variant="contained"
                  endIcon={<Info />}
                  onClick={() => handleOpenInfo(task)}
                  color="info"
                >
                  Info
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  endIcon={<UpdateIcon />}
                  onClick={() => handleOpenUpdate(task)}
                >
                  Update
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  endIcon={<DeleteIcon />}
                  onClick={() => {
                    handleDeleteTask(task.id);
                    handleShowResponse("Task deleted succesfully", "warning");
                  }}
                >
                  Delete
                </Button>
              </ButtonGroup>
            </Paper>
          ))}
        <Modal open={showInfo} onClose={handleCloseInfo}>
          <Box sx={{ ...modalStyle, p: 4, borderRadius: 3, minWidth: 300 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              textAlign="center"
              gutterBottom
            >
              {selectedTask?.taskSummary ?? "Untitled Task"}
            </Typography>

            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Description:
            </Typography>
            <Typography variant="body1" textAlign="justify" sx={{ mb: 2 }}>
              {selectedTask?.taskDescription ?? "No description provided."}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Deadline:
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {selectedTask?.deadline?.format("MMMM D, YYYY") ??
                  "No deadline"}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 3,
                gap: 2,
              }}
            >
              <Typography variant="body2" color="textSecondary">
                Status:
              </Typography>
              <Chip
                label={selectedTask?.status ?? "Unknown"}
                color={
                  selectedTask?.status === "Completed"
                    ? "success"
                    : selectedTask?.status === "In Progress"
                    ? "info"
                    : selectedTask?.status === "Paused"
                    ? "warning"
                    : selectedTask?.status === "Not Started"
                    ? "default"
                    : "error"
                }
                variant="filled"
                size="small"
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                color="error"
                onClick={handleCloseInfo}
                startIcon={<Cancel />}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Modal>

        <Modal open={showUpdate} onClose={handleCloseUpdate}>
          <Box
            sx={modalStyle}
            display={"flex"}
            gap={2}
            flexDirection={"column"}
          >
            <Stack
              direction={"row"}
              textAlign={"center"}
              alignItems={"center"}
              gap={2}
            >
              <Typography>Summary: </Typography>
              <TextField
                label="Summary"
                fullWidth
                value={summary}
                onChange={handleSummaryChange}
                error={!summary.trim()}
                helperText={!summary.trim() ? "Summary is required" : ""}
                required
              ></TextField>
            </Stack>
            <Stack direction={"column"} gap={2}>
              <Typography>Description: </Typography>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={handleDescriptionChange}
              ></TextField>
            </Stack>
            <Stack direction={"row"} alignItems={"center"} gap={1.5}>
              <Typography>Deadline: </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker value={deadline} onChange={handleDeadlineChange} />
              </LocalizationProvider>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <RadioGroup
                  sx={{ display: "flex", flexDirection: "row" }}
                  value={status}
                  onChange={handleStatusChange}
                >
                  <FormControlLabel
                    control={<Radio size="small" />}
                    label="Not Started"
                    value="Not Started"
                    labelPlacement="bottom"
                  />
                  <FormControlLabel
                    control={<Radio size="small" />}
                    label="In Progress"
                    value="In Progress"
                    labelPlacement="bottom"
                  />
                  <FormControlLabel
                    control={<Radio size="small" />}
                    label="Paused"
                    value="Paused"
                    labelPlacement="bottom"
                  />
                  <FormControlLabel
                    control={<Radio size="small" />}
                    label="Completed"
                    value="Completed"
                    labelPlacement="bottom"
                  />
                </RadioGroup>
              </FormControl>
            </Stack>
            <Stack direction={"row"} justifyContent={"space-evenly"}>
              <Button
                onClick={handleCloseUpdate}
                variant="contained"
                color="error"
              >
                <Close />
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleUpdateTask();
                  handleCloseUpdate();
                  handleShowResponse("Task updated succesfully", "info");
                }}
                disabled={!summary.trim() || !status.trim()}
              >
                <Check />
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </Container>
  );
};
export default App;

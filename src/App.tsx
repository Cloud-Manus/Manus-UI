import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ChatPage from "./pages/ChatPage";
import TasksPage from "./pages/TasksPage";
// import TaskDetailPage from "./pages/TaskDetailPage";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<ChatPage />} />
              <Route path="tasks" element={<TasksPage />} />
              {/* <Route path="tasks/:taskId" element={<TaskDetailPage />} /> */}
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </>
  );
}

export default App;

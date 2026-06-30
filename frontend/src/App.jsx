//frontend>src>App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import TodoList from "./pages/TodoList/TodoList";
import MakeTodo from "./pages/MakeTodo/MakeTodo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 여기가 핵심! 대문(/)에는 반드시 Home이 들어가야 합니다 */}
        <Route path="/" element={<Home />} />
        <Route path="/make" element={<MakeTodo />} />
        <Route path="/list" element={<TodoList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
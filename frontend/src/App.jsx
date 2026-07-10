import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Home from "./pages/Home/Home";
import TodoList from "./pages/TodoList/TodoList";
import MakeTodo from "./pages/MakeTodo/MakeTodo";
import LoginPage from "./pages/Login/LoginPage";
import MyPage from "./pages/MyPage/MyPage";
import Layout from "./components/Layout";

function App() {
  const [user, setUser] = useState(undefined); // undefined: 확인중, null: 비로그인

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩중...</div>;
  }

  const PrivateRoute = ({ children }) => (user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/make" element={<PrivateRoute><MakeTodo /></PrivateRoute>} />
        <Route path="/list" element={<PrivateRoute><TodoList /></PrivateRoute>} />
        <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
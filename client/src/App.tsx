import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Layout from "./components/Layout";
import AIComposer from "./pages/AIComposer";
import Scheduler from "./pages/Scheduler";
import { Toaster } from "react-hot-toast";

function ProtectedRoute() {
    return localStorage.getItem("token") ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <>
           <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout/>}>
                        <Route path="/dashboard" element={<Dashboard/>} />
                        <Route path="/accounts" element={<Accounts/>} />
                        <Route path="/schedule" element={<Scheduler/>} />
                        <Route path="/ai-composer" element={<AIComposer/>} />
                    </Route>
                </Route>
            </Routes>
        </>
    );
}
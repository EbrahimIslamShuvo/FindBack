import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import AIChatbot from "../pages/Ai/AIChatbot";

const Root = () => {
    return (
        <div className="min-h-screen">
            <Navbar />

            <Outlet />

            <AIChatbot />
        </div>
    );
};

export default Root;
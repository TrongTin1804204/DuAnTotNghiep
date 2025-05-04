import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-[200px] z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-[200px] flex flex-col">
        {/* Navbar - now spans full width minus sidebar */}
        <div className="fixed top-0 left-[200px] right-0 z-20">
          <Navbar />
        </div>

        {/* Main Content Area with padding for navbar */}
        <div className="mt-16 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

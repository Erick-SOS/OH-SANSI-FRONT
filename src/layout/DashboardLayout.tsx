import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import DashboardHeader from "./DashboardHeader";
import { SidebarProvider } from "../context/SidebarContext";

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Dashboard Header */}
          <DashboardHeader />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl p-4 md:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
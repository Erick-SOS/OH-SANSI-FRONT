import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import DashboardHeader from "../components/header/DashboardHeader";
import { useSidebar } from "../context/SidebarContext";
import Backdrop from "./Backdrop";
import { ScrollToTop } from "../components/common/ScrollToTop";

const ProtectedLayout = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <Backdrop />
        <main
          className={`flex-1 transition-all duration-300 ${
            isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
          } ${isMobileOpen ? "ml-0" : ""}`}
        >
          <ScrollToTop />
          <div className="p-4 md:p-6 mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
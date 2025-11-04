import { SidebarProvider } from "../context/SidebarContext";
import ProtectedLayout from "./ProtectedLayout";

const ProtectedLayoutWithSidebar = () => (
  <SidebarProvider>
    <ProtectedLayout />
  </SidebarProvider>
);

export default ProtectedLayoutWithSidebar;
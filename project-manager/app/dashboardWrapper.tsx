"use client";

import React, { useEffect, useMemo } from "react";
import Navbar from "@/components/NavBar";
import Sidebar from "@/components/SideBar";
import StoreProvider, { useAppSelector } from "./redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSideBarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode) ?? false;

  useEffect(() => {
    if (typeof isDarkMode === "boolean") {
      document.documentElement.classList.toggle("dark", isDarkMode);
    }
  }, [isDarkMode]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
        },
      }),
    [isDarkMode]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
        <Sidebar />
        <main
          className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
            isSidebarCollapsed ? "" : "md:pl-64"
          }`}
        >
          <Navbar />
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
        <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;
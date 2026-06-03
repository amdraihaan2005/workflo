import React from 'react';
import { Search, Settings, Menu, Moon, Sun, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode, setIsSideBarCollapsed } from '@/state';
import { signOut } from 'aws-amplify/auth';

const NavBar = () => {
    const dispatch = useAppDispatch();
    const isSideBarCollapsed = useAppSelector((state) => state.global.isSideBarCollapsed);
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = "/";
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black">
        {/* Search Bar*/}
        <div className="flex items-center gap-8">
            {!isSideBarCollapsed ? null : (
                <button onClick={() => dispatch(setIsSideBarCollapsed(!isSideBarCollapsed))}>
                    <Menu className="h-8 w-8 dark:text-white" />
                </button>
            )}

            <div className="relative flex h-min w-[200px]">
                <Search className="absolute left-1 top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-white" /> 
                <input 
                    className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white" 
                    type="search" 
                    placeholder="Search..."
                />
            </div>
        </div>
        {/* Icons */}
        <div className="flex items-center">
            <button onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
                className={isDarkMode 
                    ? 'rounded p-2 dark:hover:bg-gray-700' 
                    : 'rounded p-2 hover:bg-gray-100'}>
                        {isDarkMode ? (
                            <Sun className="h-6 w-6 cursor-pointer dark:text-white" />
                        ) : (
                            <Moon className="h-6 w-6 cursor-pointer dark:text-white" />
                        )}
            </button>
            <Link
                href="/settings"
                className={isDarkMode 
                    ? 'h-min w-min rounded p-2 dark:hover:bg-gray-700' 
                    : 'h-min w-min rounded p-2 hover:bg-gray-100'}>
            <Settings className="h-6 w-6 cursor-pointer dark:text-white" />
            </Link>
            <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
            <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
            </button>
        </div>
    </div>
  );
};

export default NavBar;

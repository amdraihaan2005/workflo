"use client";
import {AlertCircle, AlertOctagon, AlertTriangle, Briefcase, ChevronDown, ChevronUp, Home, Layers3, LockIcon, LucideIcon, Search, Settings, ShieldAlert, User, Users, X} from "lucide-react";
import React, { useState } from 'react'
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import Link from 'next/link';
import { setIsSideBarCollapsed } from '@/state';
import { useGetProjectsQuery } from "@/state/api";

const SideBar = () => {
    const [showProjects, setShowProjects] = useState(true);
    const [showPriority, setShowPriority] = useState(true);

    const { data: projects } = useGetProjectsQuery();
    const dispatch = useAppDispatch();
    const isSideBarCollapsed = useAppSelector((state) => state.global.isSideBarCollapsed);
    const SidebarClassNames = `fixed flex flex-col h-full justify-between shadow-xl transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white ${ isSideBarCollapsed ? "w-0 hidden" : "w-64"}`;

return <div className={SidebarClassNames}>
    <div className="flex h-100% w-full flex-col justify-start">
        {/* Logo Section */}
        <div className="z-50 flex min-h-14 w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-black">
            <div className="text-xl font-bold text-gray-800 dark:text-white">
                Project Manager 
            </div>
            {isSideBarCollapsed ? null : (
                <button className="py-3" onClick={() => {dispatch(setIsSideBarCollapsed(!isSideBarCollapsed))}}>
                    <X className="h-8 w-8 text-gray-800 hover:text-gray-500 dark:text-white" />
                    </button>
            )}
        </div>
        {/* Team */}
        <div className='flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700'>
            <Image src="/logo.png" alt="Logo" width={40} height={40}/>
            <div>
                <h3 className="text-md font-bold tracking-wide dark:text-gray-200">
                    Team Alpha
                </h3>
                <div className="mt-1 flex items-start gap-2">
                    <LockIcon className="mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400" />
                    <p className='text-xs text-gray-500'>Private</p>
                </div>
            </div>
        </div>
        {/* NavBar Links */}
        <nav className="z-10 w-full">
            <SideBarLink icon={Home} label="Home" href="/" />
            <SideBarLink icon={Briefcase} label="Timeline" href="/timeline" />
            <SideBarLink icon={Search} label="Search" href="/search" />
            <SideBarLink icon={Settings} label="Settings" href="/settings" />
            <SideBarLink icon={User} label="Users" href="/users" />
            <SideBarLink icon={Users} label="Teams" href="/teams" />
        </nav>
        { /* Projects Links */}
        <button onClick={() => setShowProjects((prev) => !prev)}
        className="flex w-full items-center justify-between px-8 py-3 text-gray-500">
            <span className=''>Projects</span>
            {showProjects ? <ChevronUp className='h-5 w-5' /> : <ChevronDown className='h-5 w-5' />} 
        </button>
        { /* Projects List */}
        {showProjects && projects?.map((project) => (
            <SideBarLink
            key={project.id}
            icon={Briefcase}
            label={project.name}
            href={`/projects/${project.id}`} />
            ))}
        { /* Priorities Links */}
        <button onClick={() => setShowPriority((prev) => !prev)}
        className="flex w-full items-center justify-between px-8 py-3 text-gray-500">
            <span className=''>Priority</span>
            {showPriority ? <ChevronUp className='h-5 w-5' /> : <ChevronDown className='h-5 w-5' />} 
        </button>
        {showPriority && (
            <>
                <SideBarLink icon={AlertCircle} label="Urgent" href="/priority/urgent" />
                <SideBarLink icon={ShieldAlert} label="High" href="/priority/high" />
                <SideBarLink icon={AlertTriangle} label="Medium" href="/priority/medium" />
                <SideBarLink icon={AlertOctagon} label="Low" href="/priority/low" />
                <SideBarLink icon={Layers3} label="Backlog" href="/priority/backlog" />
            </>
        )} 
    </div>
  </div> 
};

interface SideBarLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
}
const SideBarLink = ({
    href,
    icon: Icon,
    label,
}: SideBarLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || (pathname=== '/' && href === '/dashboard');

    return (
        <Link href={href} className="w-full">
            <div className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${ isActive ? 'bg-gray-100 dark:bg-gray-600' : ""} justify-start px-8 py-3`}>
            {isActive && ( <div className="absolute left-0 top-0 h-full w-[5px] bg-blue-200"></div> )}
            <Icon className='h-5 w-5 text-gray-800 dark:text-gray-100' />
            <span className='font-medium text-gray-800 dark:text-gray-100'>
                {label}
                </span>
            </div>
        </Link>
    );

};

export default SideBar;
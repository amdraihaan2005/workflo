"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import UserCard from "@/components/UserCard";
import { useSearchQuery, useGetProjectsQuery, useGetUsersQuery, useGetTasksQuery } from "@/state/api";
import React, { useEffect, useState } from "react";
import { Search as SearchIcon, X, Briefcase, Users, AlertCircle, Clock, CheckSquare } from "lucide-react";

const Search = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Retrieve workspace statistics for the dashboard/empty state
  const { data: projects } = useGetProjectsQuery();
  const { data: users } = useGetUsersQuery();
  const { data: allTasks } = useGetTasksQuery();

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useSearchQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("recentSearches");
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse recent searches", e);
        }
      }
    }
  }, []);

  // Save new searches to recent searches (only runs when searchTerm is explicitly committed)
  useEffect(() => {
    const cleaned = searchTerm.trim();
    if (cleaned.length >= 3) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item.toLowerCase() !== cleaned.toLowerCase());
        const updated = [cleaned, ...filtered].slice(0, 15);
        if (typeof window !== "undefined") {
          localStorage.setItem("recentSearches", JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [searchTerm]);

  const handleClearRecent = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("recentSearches");
    }
  };

  const handleRemoveRecent = (termToRemove: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((term) => term !== termToRemove);
      if (typeof window !== "undefined") {
        localStorage.setItem("recentSearches", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const triggerSearch = () => {
    const cleaned = inputValue.trim();
    if (cleaned.length >= 3) {
      setSearchTerm(cleaned);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const isBackspace = value.length < inputValue.length;
    setInputValue(value);

    if (value.trim() === "" || isBackspace) {
      setSearchTerm("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      triggerSearch();
    }
  };

  const handleClearSearch = () => {
    setInputValue("");
    setSearchTerm("");
  };

  const handleTagClick = (tag: string) => {
    setInputValue(tag);
    setSearchTerm(tag);
  };

  const hasResults =
    (searchResults?.tasks?.length || 0) +
      (searchResults?.projects?.length || 0) +
      (searchResults?.users?.length || 0) >
    0;

  const showInitialDashboard = searchTerm.length < 3;
  const projectsCount = projects?.length || 0;
  const usersCount = users?.length || 0;
  const tasksCount = allTasks?.length || 0;



  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <Header name="Search" />

      {/* Centered Search Bar */}
      <div className="flex flex-col items-center justify-center w-full mb-10">
        <div className="relative w-full max-w-2xl flex items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks, projects, or team members..."
              className="w-full rounded-full border border-gray-300 bg-white py-3.5 pl-12 pr-28 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 dark:border-stroke-dark dark:bg-dark-secondary dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-primary dark:focus:ring-blue-primary/30"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {inputValue && (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-650 dark:text-gray-500 dark:hover:text-gray-300 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={triggerSearch}
                className="rounded-full bg-blue-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        </div>
        {inputValue && inputValue.trim().length < 3 && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Please enter at least 3 characters to search.
          </p>
        )}
      </div>

      {/* Main Content Area */}
      <div>
        {/* Loading & Error States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Searching workspace databases...</p>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 max-w-xl mx-auto">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">An error occurred while fetching search results. Please try again.</p>
          </div>
        )}

        {/* 1. Initial Dashboard (Empty Query State) */}
        {!isLoading && !isError && showInitialDashboard && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Metrics */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Workspace Overview
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-stroke-dark dark:bg-dark-secondary">
                  <div className="rounded-lg bg-blue-50 p-3 text-blue-500 dark:bg-blue-950/30 dark:text-blue-400">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Total Projects</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{projectsCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-stroke-dark dark:bg-dark-secondary">
                  <div className="rounded-lg bg-purple-50 p-3 text-purple-500 dark:bg-purple-950/30 dark:text-purple-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Active Team Members</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{usersCount}</p>
                  </div>
                </div>

                {/* Total Tasks Count Card */}
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-stroke-dark dark:bg-dark-secondary">
                  <div className="rounded-lg bg-green-50 p-3 text-green-500 dark:bg-green-950/30 dark:text-green-400">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Total Tasks</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{tasksCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Recent Searches Box */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary md:col-span-2 animate-fadeIn">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-800 dark:text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Recent Searches
                  </h3>
                  {recentSearches.length > 0 && (
                    <button
                      onClick={handleClearRecent}
                      className="text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Scrollable list inside the container */}
                <div className="max-h-[140px] overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                  {recentSearches.length > 0 ? (
                    recentSearches.map((term, index) => (
                      <div
                        key={`${term}-${index}`}
                        onClick={() => handleTagClick(term)}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-stroke-dark cursor-pointer transition-colors group text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Clock className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="flex-1 font-medium">{term}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRecent(term);
                          }}
                          className="text-gray-450 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">
                      No recent searches yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Project Links */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-800 dark:text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  Quick Project Links
                </h3>
                <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">
                  Jump directly to active project boards:
                </p>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                  {projects && projects.length > 0 ? (
                    projects.slice(0, 5).map((project) => (
                      <a
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-stroke-dark text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <span className="truncate">{project.name}</span>
                      </a>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 py-4 text-center">
                      No projects available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Results Found Grid View */}
        {!isLoading && !isError && !showInitialDashboard && hasResults && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-fadeIn">
            {/* Tasks Column */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary/30">
              <div className="mb-4 flex items-center justify-between border-b border-gray-200 dark:border-stroke-dark pb-3">
                <h3 className="text-md font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Tasks
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {searchResults?.tasks?.length || 0}
                </span>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {searchResults?.tasks && searchResults.tasks.length > 0 ? (
                  searchResults.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-10 text-center">No tasks matched this query.</p>
                )}
              </div>
            </div>

            {/* Projects Column */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary/30">
              <div className="mb-4 flex items-center justify-between border-b border-gray-200 dark:border-stroke-dark pb-3">
                <h3 className="text-md font-bold text-gray-900 dark:text-white">
                  Projects
                </h3>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {searchResults?.projects?.length || 0}
                </span>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {searchResults?.projects && searchResults.projects.length > 0 ? (
                  searchResults.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-10 text-center">No projects matched this query.</p>
                )}
              </div>
            </div>

            {/* Users Column */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary/30">
              <div className="mb-4 flex items-center justify-between border-b border-gray-200 dark:border-stroke-dark pb-3">
                <h3 className="text-md font-bold text-gray-900 dark:text-white">
                  Team Members
                </h3>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  {searchResults?.users?.length || 0}
                </span>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
                {searchResults?.users && searchResults.users.length > 0 ? (
                  searchResults.users.map((user) => (
                    <UserCard key={user.userId} user={user} />
                  ))
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-10 text-center">No members matched this query.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Empty State (No Matches Found) */}
        {!isLoading && !isError && !showInitialDashboard && !hasResults && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-dashed border-gray-300 dark:border-stroke-dark bg-white dark:bg-dark-secondary max-w-xl mx-auto shadow-sm animate-fadeIn">
            <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No matches found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
              We couldn't find any projects, tasks, or users matching "{searchTerm}".
            </p>
            <div className="mt-6 text-left bg-gray-55 dark:bg-dark-bg p-4 rounded-lg border border-gray-200 dark:border-stroke-dark w-full">
              <p className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-2">Search Suggestions:</p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <li>Check for typos or spelling mistakes.</li>
                <li>Try searching for broader keywords.</li>
                <li>Search for specific developer names or default projects.</li>
                <li>Try clicking one of the suggested tags above.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
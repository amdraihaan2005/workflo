import { Project } from "@/state/api";
import React from "react";

type Props = {
  project: Project;
};

const ProjectCard = ({ project }: Props) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary dark:text-white transition-all duration-200">
      <h3 className="font-bold text-gray-900 dark:text-white">{project.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{project.description || "No description provided."}</p>
      <div className="mt-4 pt-2 border-t border-gray-100 dark:border-stroke-dark text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p><strong>Start Date:</strong> {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set."}</p>
        <p><strong>End Date:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set."}</p>
      </div>
    </div>
  );
};

export default ProjectCard;
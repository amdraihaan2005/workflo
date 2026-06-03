"use client";

import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useAuthenticator } from "@aws-amplify/ui-react";

const Settings = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const getUserAttributes = async () => {
      try {
        const attributes = await fetchUserAttributes();
        if (attributes.email) {
          setEmail(attributes.email);
        }
      } catch (error) {
        console.error("Error fetching user attributes", error);
      }
    };
    getUserAttributes();
  }, []);

  const userSettings = {
    username: user?.username || "N/A",
    email: email || user?.signInDetails?.loginId || "N/A",
    teamName: "Development Team",
    roleName: "Developer",
  };

  const labelStyles = "block text-sm font-medium dark:text-white";
  const textStyles =
    "mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:text-white dark:bg-dark-bg";

  return (
    <div className="p-8">
      <Header name="Settings" />
      <div className="space-y-4">
        <div>
          <label className={labelStyles}>Username</label>
          <div className={textStyles}>{userSettings.username}</div>
        </div>
        <div>
          <label className={labelStyles}>Email</label>
          <div className={textStyles}>{userSettings.email}</div>
        </div>
        <div>
          <label className={labelStyles}>Team</label>
          <div className={textStyles}>{userSettings.teamName}</div>
        </div>
        <div>
          <label className={labelStyles}>Role</label>
          <div className={textStyles}>{userSettings.roleName}</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
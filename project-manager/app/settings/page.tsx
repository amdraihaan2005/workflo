"use client";

import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useAppDispatch, useAppSelector } from "../redux";
import { setIsDarkMode, setIsSideBarCollapsed } from "@/state";
import { useGetUserQuery, useCreateUserMutation, useUpdateUserMutation, useGetTeamsQuery } from "@/state/api";
import { User, Mail, Briefcase, Settings as SettingsIcon, Check, Bell, Moon, Sun, Loader2, Users } from "lucide-react";

const Settings = () => {
  const { user } = useAuthenticator((context) => [context.user]);
  const cognitoId = user?.userId;
  const dispatch = useAppDispatch();

  // Redux Global States
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSideBarCollapsed);

  // Queries & Mutations
  const { data: dbUser, isLoading: isDbUserLoading, isError: isDbUserError } = useGetUserQuery(cognitoId || "", {
    skip: !cognitoId,
  });
  const { data: teams } = useGetTeamsQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // Form Field States
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("p1.jpeg");
  const [teamId, setTeamId] = useState<number>(1);

  // Notifications Preferences
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: false,
    weeklyDigest: true,
  });

  // Action States
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Self-Healing database sync: If Cognito user is authenticated but not in database, create them
  useEffect(() => {
    if (cognitoId && !isDbUserLoading && !dbUser) {
      console.log("Synchronizing Cognito user to PostgreSQL database...");
      createUser({
        cognitoId,
        username: user?.username || "GuestUser",
        profilePictureUrl: "p1.jpeg",
        teamId: 1,
      });
    }
  }, [cognitoId, dbUser, isDbUserLoading, createUser, user]);

  // 2. Populate form fields once database user record loads
  useEffect(() => {
    if (dbUser) {
      setUsername(dbUser.username || "");
      setProfilePictureUrl(dbUser.profilePictureUrl || "p1.jpeg");
      setTeamId(dbUser.teamId || 1);
    }
  }, [dbUser]);

  // 3. Fetch authenticated email attribute from Cognito
  useEffect(() => {
    const getUserAttributes = async () => {
      try {
        const attributes = await fetchUserAttributes();
        if (attributes.email) {
          setEmail(attributes.email);
        }
      } catch (error) {
        console.error("Error fetching user email from Cognito:", error);
      }
    };
    getUserAttributes();

    // Load notification preferences from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("settings_notifications");
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cognitoId) return;

    setIsSaving(true);
    setErrorMessage("");
    try {
      // 1. Save profile details to backend database
      await updateUser({
        cognitoId,
        username,
        profilePictureUrl,
        teamId,
      }).unwrap();

      // 2. Save notification configurations in local storage
      if (typeof window !== "undefined") {
        localStorage.setItem("settings_notifications", JSON.stringify(notifications));
      }

      // Show success toast feedback
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err: any) {
      console.error("Failed to update user profile:", err);
      const msg = err?.data?.message || "Failed to update user profile. Please try again.";
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (dbUser) {
      setUsername(dbUser.username || "");
      setProfilePictureUrl(dbUser.profilePictureUrl || "p1.jpeg");
      setTeamId(dbUser.teamId || 1);
    }
    setNotifications({
      emailAlerts: true,
      pushAlerts: false,
      weeklyDigest: true,
    });
  };

  const avatars = [
    "p1.jpeg",
    "p2.jpeg",
    "p3.jpeg",
    "p4.jpeg",
    "p5.jpeg",
    "p6.jpeg",
    "p7.jpeg",
    "p8.jpeg",
    "p9.jpeg",
    "p10.jpeg",
  ];

  const labelStyles = "block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400";
  const inputStyles =
    "mt-1.5 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-stroke-dark dark:bg-dark-secondary dark:text-white dark:focus:border-blue-primary dark:focus:ring-blue-primary/30";

  // Derive active team name
  const userTeamName = teams?.find((t) => t.id === teamId)?.teamName || "N/A";

  return (
    <div className="p-8 w-full max-w-7xl mx-auto relative min-h-[calc(100vh-80px)]">
      <Header name="Settings" />

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-xl bg-green-500 px-5 py-4 text-white shadow-xl animate-slideUp">
          <Check className="h-5 w-5" />
          <span className="text-sm font-semibold">Settings updated successfully!</span>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-xl bg-red-500 px-5 py-4 text-white shadow-xl animate-slideUp">
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}

      {isDbUserLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading your profile settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: User Database Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
              <div className="mb-6 flex items-center gap-3 border-b border-gray-100 dark:border-stroke-dark pb-4">
                <User className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white">Profile Details</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Edit your public profile settings synced to the database</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Username Input */}
                <div>
                  <label htmlFor="username" className={labelStyles}>Username</label>
                  <input
                    id="username"
                    type="text"
                    required
                    className={inputStyles}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {/* Email (Read-Only Cognito Identity) */}
                <div>
                  <label htmlFor="email" className={labelStyles}>Email Address</label>
                  <div className="relative mt-1.5">
                    <input
                      id="email"
                      type="email"
                      disabled
                      className="block w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-400 dark:border-stroke-dark dark:bg-dark-bg/60 dark:text-gray-500"
                      value={email || user?.signInDetails?.loginId || "N/A"}
                    />
                    <Mail className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-450 dark:text-gray-500" />
                  </div>
                </div>

                {/* Role (Read-Only) */}
                <div>
                  <label className={labelStyles}>Job Role / Title</label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      disabled
                      className="block w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-400 dark:border-stroke-dark dark:bg-dark-bg/60 dark:text-gray-500"
                      value="Developer"
                    />
                    <Briefcase className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-450 dark:text-gray-500" />
                  </div>
                </div>

                {/* Team (Read-Only) */}
                <div>
                  <label className={labelStyles}>Team Assignment</label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      disabled
                      className="block w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-400 dark:border-stroke-dark dark:bg-dark-bg/60 dark:text-gray-500"
                      value={userTeamName}
                    />
                    <Users className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-450 dark:text-gray-500" />
                  </div>
                </div>

                {/* Avatar Picker Grid */}
                <div className="md:col-span-2">
                  <label className={labelStyles}>Select Profile Avatar</label>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-3">Choose a public avatar to display next to your tasks:</p>
                  
                  <div className="flex flex-wrap gap-3">
                    {avatars.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setProfilePictureUrl(avatar)}
                        className={`relative rounded-full overflow-hidden border-2 transition-all p-0.5 hover:scale-105 active:scale-95 ${
                          profilePictureUrl === avatar
                            ? "border-blue-500 scale-105 shadow-md"
                            : "border-gray-200 dark:border-stroke-dark hover:border-blue-400"
                        }`}
                      >
                        <img
                          src={`/${avatar}`}
                          alt={avatar}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                        {profilePictureUrl === avatar && (
                          <div className="absolute inset-0 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <div className="bg-blue-500 text-white rounded-full p-0.5 shadow-sm">
                              <Check className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200 dark:hover:bg-stroke-dark cursor-pointer transition-colors"
              >
                Reset Defaults
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-blue-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-blue-primary/60 cursor-pointer transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: App Preferences & Notification channels */}
          <div className="space-y-6">
            {/* App Customization Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
              <div className="mb-6 flex items-center gap-3 border-b border-gray-100 dark:border-stroke-dark pb-4">
                <SettingsIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white">App Preferences</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Configure theme and layout settings</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Theme Selector (Dark Mode Toggle) */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">Dark Theme</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Toggle website interface colors</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isDarkMode ? "bg-blue-primary" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex h-5 w-5 items-center justify-center ${
                        isDarkMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    >
                      {isDarkMode ? (
                        <Moon className="h-3 w-3 text-blue-primary" />
                      ) : (
                        <Sun className="h-3 w-3 text-amber-500" />
                      )}
                    </span>
                  </button>
                </div>

                {/* Sidebar Collapse Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">Collapse Sidebar</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Minimize side navigation bar</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(setIsSideBarCollapsed(!isSidebarCollapsed))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isSidebarCollapsed ? "bg-blue-primary" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out h-5 w-5 ${
                        isSidebarCollapsed ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Notification settings Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary">
              <div className="mb-6 flex items-center gap-3 border-b border-gray-100 dark:border-stroke-dark pb-4">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white">Notifications</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Configure alert delivery channels</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Email Alerts */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-primary focus:ring-blue-primary/20 dark:border-stroke-dark dark:bg-dark-bg cursor-pointer"
                    checked={notifications.emailAlerts}
                    onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">Email Alerts</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Receive emails for task comments & status updates</p>
                  </div>
                </label>

                {/* Push Notifications */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-primary focus:ring-blue-primary/20 dark:border-stroke-dark dark:bg-dark-bg cursor-pointer"
                    checked={notifications.pushAlerts}
                    onChange={(e) => setNotifications({ ...notifications, pushAlerts: e.target.checked })}
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">Push Notifications</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Get browser notifications for direct assignments</p>
                  </div>
                </label>

                {/* Weekly Digest */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-primary focus:ring-blue-primary/20 dark:border-stroke-dark dark:bg-dark-bg cursor-pointer"
                    checked={notifications.weeklyDigest}
                    onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">Weekly Report Digest</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Receive a weekly summary of completed project targets</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
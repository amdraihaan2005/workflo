import { User } from "@/state/api";
import Image from "next/image";
import React from "react";

type Props = {
  user: User;
};

const UserCard = ({ user }: Props) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-stroke-dark dark:bg-dark-secondary dark:text-white transition-all duration-200">
      {user.profilePictureUrl && (
        <Image
          src={`/${user.profilePictureUrl}`}
          alt="profile picture"
          width={36}
          height={36}
          className="rounded-full object-cover"
        />
      )}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{user.username}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || "No email available."}</p>
      </div>
    </div>
  );
};

export default UserCard;
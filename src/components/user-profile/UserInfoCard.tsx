"use client";
import React from "react";

type UserInfoCardProps = {
  name?: string;
  email?: string;
  role?: string;
};

export default function UserInfoCard({ name = 'Admin User', email = 'admin@example.com', role = 'admin' }: UserInfoCardProps) {
  // We no longer need modal functionality since edit button is removed
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
          Personal Information
        </h4>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Full Name
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {name}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Email address
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {email}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Role
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";


type UserMetaCardProps = {
  name?: string;
  email?: string;
  avatar?: string;
};

export default function UserMetaCard({ name = 'Admin', email = 'admin@example.com', avatar = '/images/user/default-avatar.png' }: UserMetaCardProps) {
  // We no longer need modal functionality since edit button is removed
  return (
    <>
      <div className="p-5 border border-white/20 bg-white/5 rounded-2xl lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={avatar}
                alt={name}
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {name.split(' ')[0] || 'Admin'} - {email.split('@')[0]}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Admin User
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

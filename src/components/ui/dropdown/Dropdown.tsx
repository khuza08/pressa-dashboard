"use client";
import type React from "react";
import { useEffect, useRef } from "react";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  onMouseEnter,
  onMouseLeave,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);



  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute z-40 right-0 mt-2 rounded-xl border border-white/20 bg-black/5 shadow-theme-lg backdrop-blur-lg ${className}`}
    >
      {children}
    </div>
  );
};

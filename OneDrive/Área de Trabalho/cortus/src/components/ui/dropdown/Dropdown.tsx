"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  triggerRef?: React.RefObject<HTMLElement>;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  triggerRef,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.dropdown-toggle')
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right + window.scrollX,
      });
    } else {
      setPosition(null);
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  // Se temos triggerRef e posição, usar fixed positioning
  if (triggerRef && position) {
    return (
      <div
        ref={dropdownRef}
        className={`fixed z-[100] rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`}
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`,
        }}
      >
        {children}
      </div>
    );
  }

  // Caso contrário, usar absolute positioning padrão
  return (
    <div
      ref={dropdownRef}
      className={`absolute z-50 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`}
    >
      {children}
    </div>
  );
};

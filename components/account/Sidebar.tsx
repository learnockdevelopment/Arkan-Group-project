"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Personal Information", href: "/account" },
  { name: "Cards", href: "/account/cards" },
  { name: "ID Verification", href: "/account/verification" },
  { name: "Change PIN", href: "/account/change-pin" },
  { name: "Notifications", href: "/account/notifications" },
  { name: "Language", href: "/account/language" },
  { name: "Help & Support", href: "/account/help" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64  p-6 mt-12">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Account Settings
      </h2>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-md text-sm font-medium transition text-black ${
                active
                  ? "bg-[#7AC1FF]/37"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

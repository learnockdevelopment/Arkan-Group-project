"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";

export default function Breadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <div className="text-sm text-gray-500">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      {parts.map((part, idx) => {
        const href = "/" + parts.slice(0, idx + 1).join("/");
        const name =
          part.charAt(0).toUpperCase() + part.slice(1).replace("-", " ");
        return (
          <span key={idx}>
            {" "}
            /{" "}
            <Link
              href={href}
              className={`hover:underline ${
                idx === parts.length - 1
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              {name}
            </Link>
          </span>
        );
      })}
    </div>
  );
}

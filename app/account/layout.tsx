"use client";

import React from "react";
import Sidebar from "@/components/account/Sidebar";
import Breadcrumb from "@/components/account/Breadcrumb";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-50 flex max-w-7xl mx-auto py-24">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-6 text-center">  
                  <span className="bg-yellow-100 px-4 py-1 rounded-full text-sm font-medium">
            Account
          </span>
          </div>
        <Breadcrumb />
        <div className="bg-white rounded-lg shadow-sm p-6 mt-4">{children}</div>
      </div>
    </section>
  );
}

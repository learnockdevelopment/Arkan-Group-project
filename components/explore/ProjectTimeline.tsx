"use client";

import { Calendar, CheckCircle, Clock, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectTimeline() {
  const phases = [
    {
      title: "Phase 1",
      date: "2025-2026",
      description: "Land down payment + initial construction",
      status: "current",
      progress: 40,
    },
    {
      title: "Phase 2",
      date: "2026-2028",
      description: "Unit sales cover installments",
      status: "upcoming",
      progress: 0,
    },
    {
      title: "Phase 3",
      date: "2028-2030",
      description: "Completion & Investor returns",
      status: "upcoming",
      progress: 0,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "current":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-blue-500 border-blue-500 text-white";
      case "completed":
        return "bg-green-500 border-green-500 text-white";
      default:
        return "bg-gray-300 border-gray-400 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "current":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Upcoming";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Project Timeline</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track the progress of your investment through each development phase
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Main timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-gray-300" />
        
        <div className="space-y-8">
          {phases.map((phase, index) => (
            <div key={index} className="relative flex gap-6 group">
              {/* Timeline dot and connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${getStatusColor(
                    phase.status
                  )}`}
                >
                  {getStatusIcon(phase.status)}
                </div>
                {index < phases.length - 1 && (
                  <div className="flex-1 w-0.5 bg-gray-200 mt-2" />
                )}
              </div>

              {/* Content Card */}
              <Card className="flex-1 transition-all duration-300 hover:shadow-lg border border-gray-200 group-hover:border-blue-200">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {phase.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          phase.status === "current"
                            ? "bg-blue-100 text-blue-700"
                            : phase.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getStatusText(phase.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                      <Calendar className="w-4 h-4" />
                      <span>{phase.date}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {phase.description}
                  </p>

                  {/* Progress Bar */}
                  {phase.status === "current" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{phase.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${phase.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Indicator */}
                  {phase.status !== "current" && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {phase.status === "completed" ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Successfully completed</span>
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 text-gray-400" />
                          <span>Scheduled for {phase.date.split('-')[0]}</span>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-100 rounded-full opacity-50 blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-100 rounded-full opacity-50 blur-xl" />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-sm text-gray-600">Current Phase</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-sm text-gray-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full" />
          <span className="text-sm text-gray-600">Upcoming</span>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import ExtendCard from "@/components/dashboard/extend-card";

export default function page() {
  const extensions = [
    {
      title: "Digital Brochure",
      date: { month: "Jan", day: "28" },
      time: "10:30 AM",
      location: "Algiers",
      assignee: "K. Moore",
      duration: "2h",
      avatars: ["KM", "JS", "AL"],
      variant: "primary" as const,
    },
    {
      title: "Teach Online Art Class For Children",
      date: { month: "Jan", day: "31" },
      time: "12:00 PM",
      location: "Kyiv",
      assignee: "C. Richardson",
      duration: "2h",
      avatars: ["CR", "MK", "DL"],
      variant: "secondary" as const,
    },
    {
      title: "A Young Boy Yeti Character",
      date: { month: "Jan", day: "30" },
      time: "7:30 PM",
      location: "SF, CA",
      assignee: "A. Schmidt",
      duration: "2h",
      avatars: ["AS", "BT", "LM"],
      variant: "tertiary" as const,
    },
    {
      title: "Full Rebrand",
      date: { month: "Feb", day: "03" },
      time: "12:00 PM",
      location: "Paris",
      assignee: "N. Sims",
      duration: "2h",
      avatars: ["NS", "RP", "VG"],
      variant: "default" as const,
    },
    {
      title: "Digital Brochure",
      date: { month: "Jan", day: "28" },
      time: "10:30 AM",
      location: "Algiers",
      assignee: "K. Moore",
      duration: "2h",
      avatars: ["KM", "JS", "AL"],
      variant: "primary" as const,
    },
    {
      title: "Teach Online Art Class For Children",
      date: { month: "Jan", day: "31" },
      time: "12:00 PM",
      location: "Kyiv",
      assignee: "C. Richardson",
      duration: "2h",
      avatars: ["CR", "MK", "DL"],
      variant: "secondary" as const,
    },
    {
      title: "A Young Boy Yeti Character",
      date: { month: "Jan", day: "30" },
      time: "7:30 PM",
      location: "SF, CA",
      assignee: "A. Schmidt",
      duration: "2h",
      avatars: ["AS", "BT", "LM"],
      variant: "tertiary" as const,
    },
    {
      title: "Full Rebrand",
      date: { month: "Feb", day: "03" },
      time: "12:00 PM",
      location: "Paris",
      assignee: "N. Sims",
      duration: "2h",
      avatars: ["NS", "RP", "VG"],
      variant: "default" as const,
    },
  ];
  return (
    <div className="space-y-6 px-6 pt-4 pb-12">
      <div className="">
        <h2 className="text-2xl font-light">Extend</h2>
        <p className="text-muted-foreground">
          Manage your Extensions & Permissions
        </p>
      </div>
      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {extensions.map((extension, index) => (
          <ExtendCard
            key={index}
            title={extension.title}
            date={extension.date}
            time={extension.time}
            location={extension.location}
            assignee={extension.assignee}
            duration={extension.duration}
            avatars={extension.avatars}
            variant={extension.variant}
          />
        ))}
      </div>
    </div>
  );
}

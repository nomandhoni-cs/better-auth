import { NavigationSection } from "../types/navigation";

export const navigationData: NavigationSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", icon: "layoutDashboard", href: "/dashboard" },
      { label: "Profile", icon: "user", href: "/dashboard/profile" },
      { label: "Settings", icon: "settings", href: "/dashboard/settings" },
    ],
  },
  {
    title: "Business configuration",
    items: [
      // {
      //   label: "User management",
      //   icon: "Users",
      //   href: "/dashboard/user-management",
      // },
      // {
      //   label: "Business configuration",
      //   icon: "Settings",
      //   href: "/dashboard/business-configuration",
      // },
      // {
      //   label: "System administration",
      //   icon: "MonitorCog",
      //   href: "/dashboard/system-administration",
      // },
      // {
      //   label: "Surface Editor",
      //   icon: "layoutDashboard",
      //   href: "/dashboard/surface-editor",
      // },
      // {
      //   label: "Content & Marketing",
      //   icon: "FileVideoCamera",
      //   href: "/dashboard/content-marketing",
      // },
      // {
      //   label: "Personal data",
      //   icon: "Shredder",
      //   href: "/dashboard/personal-data",
      // },
      // {
      //   label: "Product scheduler",
      //   icon: "CalendarCheck2",
      //   href: "/dashboard/product-scheduler",
      // },
      // {
      //   label: "General Admin",
      //   icon: "UserStar",
      //   href: "/dashboard/general-admin",
      // },
      // {
      //   label: "WeSeeDo",
      //   icon: "Video",
      //   href: "/dashboard/weesee-do",
      // },
      // {
      //   label: "Notification admin",
      //   icon: "BellRing",
      //   href: "/dashboard/notification-admin",
      // },
    ],
  },
  {
    title: "Pages",
    items: [
      // { label: "Profile", icon: "user", href: "/profile" },
      // { label: "Settings", icon: "settings", href: "/dashboard/settings" },
    ],
  },
  {
    title: "General",
    items: [
      // { label: "Forms", icon: "formInput", href: "/forms" },
      // { label: "UI Elements", icon: "palette", href: "/ui-elements" },
    ],
  },
];

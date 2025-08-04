import React from "react";
import MenuItem from "@/components/dashboard/MenuItem";
import { navigationData } from "@/data/navigation";
import { NavigationSection } from "@/types/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";

export const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <aside
      className={`bg-sidebar-primary h-screen border-r transition-all duration-300 fixed left-0 top-0 z-10 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 py-4 border-b h-16">
        <div className="flex items-center">
          <Image
            src={isDark ? "/images/LogoDark.png" : "/images/LogoLight.png"}
            alt="Logo"
            className="w-9 h-9 mr-2"
            width={36}
            height={36}
          />
          {!isCollapsed && (
            <span className="text-3xl text-[#7A7A7A] font-extralight ml-3">
              Orchestra<span className="font-extralight"> 9</span>
            </span>
          )}
        </div>
      </div>
      <nav className="mt-4 px-2 space-y-6">
        {navigationData.map((section) => (
          <div key={section.title} className="space-y-2">
            {!isCollapsed && (
              <h3 className="px-4 text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item: NavigationSection["items"][0]) => (
                <MenuItem
                  key={item.label}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Icon } from "@/components/shared/Icon";
import { useTheme } from "next-themes";

interface MenuItemProps {
  item: {
    label: string;
    icon: string;
    href?: string;
    submenu?: MenuItemProps["item"][];
  };
  isCollapsed: boolean;
}

const MenuItem = ({ item, isCollapsed }: MenuItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive =
    (item.href && pathname === item.href) ||
    (item.submenu &&
      item.submenu.some((sub) => sub.href && pathname === sub.href));

  const content = (
    <>
      <Icon
        name={item.icon}
        className={`w-5 h-5 flex-shrink-0 ${
          isActive && mounted
            ? resolvedTheme === "dark"
              ? "text-[#44cc00]"
              : "text-white"
            : ""
        }`}
      />
      {!isCollapsed && (
        <>
          <span className="ml-3 flex-1 text-left">{item.label}</span>
          {hasSubmenu && (
            <span className="ml-auto">
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="relative group">
      {item.href ? (
        <Link
          href={item.href}
          className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
            isCollapsed ? "justify-center" : ""
          } ${
            isActive
              ? "text-white bg-sidebar-primary-foreground"
              : "text-[#7A7A7A] hover:text-white hover:bg-sidebar-primary-foreground"
          }`}
          onMouseEnter={() => isCollapsed && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {content}
        </Link>
      ) : (
        <button
          onClick={() => hasSubmenu && setIsOpen(!isOpen)}
          className={`w-full flex items-center px-4 py-2 rounded-lg transition-colors ${
            isCollapsed ? "justify-center" : ""
          } ${
            isActive
              ? "text-white bg-sidebar-primary-foreground"
              : "text-[#7A7A7A] hover:text-white hover:bg-sidebar-primary-foreground"
          }`}
          onMouseEnter={() => isCollapsed && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {content}
        </button>
      )}

      {/* Tooltip */}
      {isCollapsed && showTooltip && (
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-50 px-2 py-1 rounded text-sm whitespace-nowrap bg-[#44cc00] text-white">
          {item.label}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-[#44cc00]"></div>
        </div>
      )}
      {hasSubmenu && isOpen && !isCollapsed && (
        <div className="ml-4 mt-1 space-y-1">
          {item.submenu &&
            item.submenu.map((subItem) => (
              <MenuItem
                key={subItem.label}
                item={subItem}
                isCollapsed={isCollapsed}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default MenuItem;

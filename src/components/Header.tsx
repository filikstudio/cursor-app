"use client";

import SidebarToggle from "./SidebarToggle";
import ProfileMenu from "./ProfileMenu";

export default function Header({ isSidebarOpen, onToggleSidebar }: { isSidebarOpen: boolean; onToggleSidebar: () => void }) {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-4">
      <div>
        {!isSidebarOpen && <SidebarToggle onClick={onToggleSidebar} />}
      </div>
      <div className="pr-0">
        <ProfileMenu />
      </div>
    </div>
  );
}


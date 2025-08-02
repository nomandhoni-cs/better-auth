"use client";

import React, { useState, useMemo } from "react";
import { UserTable } from "@/components/dashboard/UserTable";
import { UserDetailsSheet } from "@/components/dashboard/UserDetailsSheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockUsers } from "@/data/mockUsers";
import { User } from "@/types/user";
import { Search, Filter, ChevronDown } from "lucide-react";

export default function UserManagementPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [teamFilters, setTeamFilters] = useState<string[]>([]);

  // Get unique statuses and teams for filters
  const allStatuses = Array.from(new Set(mockUsers.map((user) => user.status)));
  const allTeams = Array.from(new Set(mockUsers.flatMap((user) => user.teams)));

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilters.length === 0 || statusFilters.includes(user.status);

      const matchesTeam =
        teamFilters.length === 0 ||
        user.teams.some((team) => teamFilters.includes(team));

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [searchQuery, statusFilters, teamFilters]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleTeamFilter = (team: string) => {
    setTeamFilters((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    );
  };

  return (
    <div className="space-y-6 px-6 pt-4 pb-12">
      <div>
        <h2 className="text-2xl font-light">User Management</h2>
        <p className="text-muted-foreground">
          Manage your team members and their permissions
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Teammates ({filteredUsers.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Invite sent (1)</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Status:{" "}
              {statusFilters.length > 0 ? statusFilters.join(", ") : "All"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {allStatuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilters.includes(status)}
                onCheckedChange={() => toggleStatusFilter(status)}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Teams Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Teams:{" "}
              {teamFilters.length > 0
                ? `${teamFilters.length} selected`
                : "All"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {allTeams.map((team) => (
              <DropdownMenuCheckboxItem
                key={team}
                checked={teamFilters.includes(team)}
                onCheckedChange={() => toggleTeamFilter(team)}
              >
                {team}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Roles Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Roles: All
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem>Admin</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Editor</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Viewer</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters */}
      {(statusFilters.length > 0 || teamFilters.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {statusFilters.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleStatusFilter(status)}
            >
              Status: {status} ×
            </Badge>
          ))}
          {teamFilters.map((team) => (
            <Badge
              key={team}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => toggleTeamFilter(team)}
            >
              Team: {team} ×
            </Badge>
          ))}
        </div>
      )}

      {/* Users Table */}
      <UserTable users={filteredUsers} onUserClick={handleUserClick} />

      {/* User Details Sheet */}
      <UserDetailsSheet
        user={selectedUser}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Bell,
  Share2,
  KeyRound,
  Check,
  Save,
  Youtube,
  Radio,
  Building2,
  Users,
  Mail,
  Copy,
  Clock,
  Trash2,
  UserMinus,
  Shield,
  FileText,
  AlertCircle,
} from "lucide-react";
import { DEFAULT_CREATOR, ALL_VIDEO_PLATFORMS, PLATFORM_CONFIG } from "@/lib/constants";
import {
  AuditLog,
  VideoPlatform,
  WorkspaceInvitation,
  WorkspaceMemberDetail,
  WorkspaceRole,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

import {
  fetchUserSettingsAction,
  updateUserSettingsAction,
} from "@/app/actions/settings";
import { getAuthSessionAction, AuthSessionResponse } from "@/app/actions/auth";
import {
  fetchWorkspaceMembersAction,
  updateWorkspaceAction,
  updateMemberRoleAction,
  removeMemberAction,
  leaveWorkspaceAction,
} from "@/app/actions/workspace";
import {
  createInvitationAction,
  fetchWorkspaceInvitationsAction,
  revokeInvitationAction,
} from "@/app/actions/invitations";
import {
  fetchUserProfileAction,
  updateUserProfileAction,
} from "@/app/actions/profile";
import { fetchWorkspaceAuditLogsAction } from "@/app/actions/audit";

type SettingsTab =
  | "profile"
  | "workspace"
  | "appearance"
  | "preferences"
  | "notifications"
  | "platforms";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile");

  // Profile Form State
  const [name, setName] = React.useState(DEFAULT_CREATOR.name);
  const [handle, setHandle] = React.useState(DEFAULT_CREATOR.handle);
  const [robloxUsername, setRobloxUsername] = React.useState(DEFAULT_CREATOR.robloxUsername);
  const [primaryPlatform, setPrimaryPlatform] = React.useState<VideoPlatform>(
    DEFAULT_CREATOR.primaryPlatform
  );
  const [bio, setBio] = React.useState(
    "Roblox content creator focusing on Murder Mystery 2 comedic skits, trading challenges, and character animations."
  );
  const [timezone, setTimezone] = React.useState("UTC");
  const [avatarUrl, setAvatarUrl] = React.useState("");

  // Workspace Form State
  const [workspaceName, setWorkspaceName] = React.useState("");
  const [workspaceSlug, setWorkspaceSlug] = React.useState("");
  const [workspaceMembers, setWorkspaceMembers] = React.useState<WorkspaceMemberDetail[]>([]);
  const [invitations, setInvitations] = React.useState<WorkspaceInvitation[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);

  // Invite creation state
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<WorkspaceRole>("MEMBER");
  const [generatedInviteUrl, setGeneratedInviteUrl] = React.useState<string | null>(null);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [actionMessage, setActionMessage] = React.useState<{ text: string; error?: boolean } | null>(null);

  // Preferences State
  const [weeklyUploadGoal, setWeeklyUploadGoal] = React.useState(3);
  const [notifyDeadlines, setNotifyDeadlines] = React.useState(true);
  const [notifyReadyScripts, setNotifyReadyScripts] = React.useState(true);
  const [neonGlow, setNeonGlow] = React.useState(true);

  // Saved Feedback
  const [isSaved, setIsSaved] = React.useState(false);
  const [authSession, setAuthSession] = React.useState<AuthSessionResponse | null>(null);

  // Initialize active tab from query param if available
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const tabParam = new URLSearchParams(window.location.search).get("tab");
      if (
        tabParam &&
        ["profile", "workspace", "appearance", "preferences", "notifications", "platforms"].includes(
          tabParam
        )
      ) {
        setActiveTab(tabParam as SettingsTab);
      }
    }
  }, []);

  // Load initial settings, profile, and session
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      const [res, sessionRes, profileRes] = await Promise.all([
        fetchUserSettingsAction(),
        getAuthSessionAction(),
        fetchUserProfileAction(),
      ]);
      if (mounted && res.success) {
        setNotifyDeadlines(res.data.emailNotifications);
        setNotifyReadyScripts(res.data.browserNotifications);
      }
      if (mounted && sessionRes.success && sessionRes.data) {
        setAuthSession(sessionRes.data);
        setWorkspaceName(sessionRes.data.workspace.name);
        setWorkspaceSlug(sessionRes.data.workspace.slug);
      }
      if (mounted && profileRes.success) {
        setName(profileRes.data.name);
        setHandle(profileRes.data.creatorTag || DEFAULT_CREATOR.handle);
        setBio(profileRes.data.bio || "");
        setTimezone(profileRes.data.timezone || "UTC");
        setAvatarUrl(profileRes.data.avatarUrl || "");
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Load workspace-specific details when workspace tab is active
  React.useEffect(() => {
    let mounted = true;
    if (activeTab === "workspace") {
      Promise.all([
        fetchWorkspaceMembersAction(),
        fetchWorkspaceInvitationsAction(),
        fetchWorkspaceAuditLogsAction(30),
      ]).then(([membersRes, invitesRes, auditRes]) => {
        if (!mounted) return;
        if (membersRes.success) setWorkspaceMembers(membersRes.data);
        if (invitesRes.success) setInvitations(invitesRes.data);
        if (auditRes.success) setAuditLogs(auditRes.data);
      });
    }
    return () => {
      mounted = false;
    };
  }, [activeTab]);

  const showFeedback = (text: string, error = false) => {
    setActionMessage({ text, error });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateUserProfileAction({
      name,
      creatorTag: handle,
      bio,
      timezone,
      avatarUrl: avatarUrl || undefined,
    });
    if (res.success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
      showFeedback("Profile updated successfully!");
    } else {
      showFeedback(res.error, true);
    }
  };

  const handleSaveWorkspaceDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateWorkspaceAction({
      name: workspaceName,
      slug: workspaceSlug,
    });
    if (res.success) {
      showFeedback("Workspace details saved successfully!");
      if (authSession) {
        setAuthSession({
          ...authSession,
          workspace: res.data,
        });
      }
    } else {
      showFeedback(res.error, true);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: WorkspaceRole) => {
    const res = await updateMemberRoleAction(targetUserId, newRole);
    if (res.success) {
      setWorkspaceMembers((prev) =>
        prev.map((m) => (m.userId === targetUserId ? res.data : m))
      );
      showFeedback("Member role updated.");
    } else {
      showFeedback(res.error, true);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to remove this member from the workspace?")) {
      return;
    }
    const res = await removeMemberAction(targetUserId);
    if (res.success) {
      setWorkspaceMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
      showFeedback("Member removed.");
    } else {
      showFeedback(res.error, true);
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!confirm("Are you sure you want to leave this workspace?")) {
      return;
    }
    const res = await leaveWorkspaceAction();
    if (res.success) {
      window.location.href = "/dashboard";
    } else {
      showFeedback(res.error, true);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const res = await createInvitationAction({
      email: inviteEmail,
      role: inviteRole,
    });

    if (res.success) {
      setGeneratedInviteUrl(res.data.inviteUrl);
      setInvitations((prev) => [res.data.invitation, ...prev]);
      setInviteEmail("");
      showFeedback("Invitation created successfully!");
    } else {
      showFeedback(res.error, true);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    const res = await revokeInvitationAction(invitationId);
    if (res.success) {
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? { ...inv, status: "REVOKED" } : inv))
      );
      showFeedback("Invitation revoked.");
    } else {
      showFeedback(res.error, true);
    }
  };

  const handleCopyLink = () => {
    if (generatedInviteUrl) {
      navigator.clipboard.writeText(generatedInviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const tabs = [
    { id: "profile" as SettingsTab, label: "Creator Profile", icon: User },
    { id: "workspace" as SettingsTab, label: "Workspace & Team", icon: Building2 },
    { id: "appearance" as SettingsTab, label: "Appearance", icon: Palette },
    { id: "preferences" as SettingsTab, label: "Preferences", icon: SettingsIcon },
    { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { id: "platforms" as SettingsTab, label: "Connected Platforms", icon: Share2 },
  ];

  const isOwner = authSession?.role === "OWNER";
  const isAdminOrOwner = authSession?.role === "OWNER" || authSession?.role === "ADMIN";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Settings & Configuration
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30 uppercase tracking-wider">
              Studio Config
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your Roblox creator profile, workspace collaboration, team roles, and platform settings.
          </p>
        </div>

        {actionMessage && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold animate-in fade-in",
              actionMessage.error
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            )}
          >
            {actionMessage.error ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            <span>{actionMessage.text}</span>
          </span>
        )}
      </div>

      {/* Main Container: Tabs Left + Content Right */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="md:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left",
                  isActive
                    ? "bg-violet-600/20 text-white font-bold border-l-2 border-violet-500"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-violet-400" : "text-slate-400")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3">
          <div className="p-6 rounded-2xl glass-panel bg-surface-panel/90 border border-white/[0.08]">
            {/* Tab: Profile */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Creator Identity
                    </h3>
                    <p className="text-xs text-slate-400">
                      Personal creator information displayed across ROXIE HUB.
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0 bg-surface-canvas">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUrl || authSession?.user.avatarUrl || DEFAULT_CREATOR.avatarUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Display Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Creator Tag / Handle</label>
                    <Input value={handle} onChange={(e) => setHandle(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Avatar Image URL</label>
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
                    >
                      <option value="UTC">UTC (Universal Coordinated Time)</option>
                      <option value="America/New_York">Eastern Time (America/New_York)</option>
                      <option value="America/Chicago">Central Time (America/Chicago)</option>
                      <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
                      <option value="Europe/London">London (Europe/London)</option>
                      <option value="Asia/Tokyo">Tokyo (Asia/Tokyo)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Creator Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-surface-canvas text-xs text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-violet-500 resize-none"
                  />
                  <div className="text-[10px] text-slate-500 text-right">{bio.length}/500</div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                  <Button type="submit" variant="primary" size="sm" className="gap-2">
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile</span>
                  </Button>
                </div>
              </form>
            )}

            {/* Tab: Workspace & Team */}
            {activeTab === "workspace" && (
              <div className="space-y-8">
                {/* 1. Workspace Details */}
                <form onSubmit={handleSaveWorkspaceDetails} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-violet-400" />
                        Workspace Details
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isOwner
                          ? "Configure the name and public slug for this creator workspace."
                          : "View workspace details. Only workspace Owners can edit name and slug."}
                      </p>
                    </div>
                    <Badge variant="purple" size="sm">
                      ROLE: {authSession?.role || "MEMBER"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Workspace Name</label>
                      <Input
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        disabled={!isOwner}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Workspace Slug</label>
                      <Input
                        value={workspaceSlug}
                        onChange={(e) => setWorkspaceSlug(e.target.value)}
                        disabled={!isOwner}
                        required
                      />
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex justify-end pt-2">
                      <Button type="submit" variant="primary" size="sm" className="gap-2">
                        <Save className="w-3.5 h-3.5" />
                        <span>Update Workspace</span>
                      </Button>
                    </div>
                  )}
                </form>

                {/* 2. Team Members */}
                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        Team Members ({workspaceMembers.length})
                      </h3>
                      <p className="text-xs text-slate-400">
                        Creators and collaborators with access to this workspace.
                      </p>
                    </div>
                    {!isOwner && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleLeaveWorkspace}
                        className="text-rose-400 hover:text-rose-300 border-rose-500/20 gap-1.5"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Leave Workspace</span>
                      </Button>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-surface-canvas/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-elevated/40 text-slate-400 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4">Member</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4">Role</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {workspaceMembers.map((member) => {
                          const isSelf = member.userId === authSession?.user.id;
                          const isMemberOwner = member.role === "OWNER";
                          const canManage =
                            isOwner ||
                            (authSession?.role === "ADMIN" &&
                              member.role === "MEMBER" &&
                              !isMemberOwner);

                          return (
                            <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg overflow-hidden bg-surface-elevated ring-1 ring-white/10 shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={member.avatarUrl || DEFAULT_CREATOR.avatarUrl}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span>{member.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] text-cyan-400 font-mono">(You)</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-slate-400 font-mono">{member.email}</td>
                              <td className="py-3 px-4">
                                {canManage && !isSelf ? (
                                  <select
                                    value={member.role}
                                    onChange={(e) =>
                                      handleRoleChange(member.userId, e.target.value as WorkspaceRole)
                                    }
                                    className="bg-surface-elevated text-xs text-white border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
                                  >
                                    <option value="MEMBER">MEMBER</option>
                                    <option value="ADMIN">ADMIN</option>
                                  </select>
                                ) : (
                                  <Badge
                                    variant={
                                      member.role === "OWNER"
                                        ? "purple"
                                        : member.role === "ADMIN"
                                        ? "neon"
                                        : "default"
                                    }
                                    size="sm"
                                  >
                                    {member.role}
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {canManage && !isSelf && !isMemberOwner ? (
                                  <button
                                    onClick={() => handleRemoveMember(member.userId)}
                                    className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-colors"
                                    title="Remove Member"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-slate-600 text-[10px] font-mono">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Team Invitations */}
                {isAdminOrOwner && (
                  <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        Invite Collaborators
                      </h3>
                      <p className="text-xs text-slate-400">
                        Create secure cryptographic invitation links for new editors and creators.
                      </p>
                    </div>

                    <form onSubmit={handleCreateInvite} className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <Input
                          type="email"
                          placeholder="collaborator@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                        />
                      </div>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                        className="bg-surface-canvas text-xs text-white border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
                      >
                        <option value="MEMBER">Member (Editor)</option>
                        {isOwner && <option value="ADMIN">Admin (Manager)</option>}
                      </select>
                      <Button type="submit" variant="primary" size="sm" className="gap-2 shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Generate Link</span>
                      </Button>
                    </form>

                    {generatedInviteUrl && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 animate-in fade-in">
                        <div className="text-xs font-mono text-emerald-300 truncate">
                          {generatedInviteUrl}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleCopyLink}
                          className="shrink-0 gap-1.5 text-xs text-emerald-300 border-emerald-500/30"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                        </Button>
                      </div>
                    )}

                    {/* Pending Invitations Table */}
                    {invitations.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Active & Recent Invitations
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-surface-canvas/60">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-surface-elevated/40 text-slate-400 uppercase font-mono text-[10px]">
                              <tr>
                                <th className="py-2 px-3">Email</th>
                                <th className="py-2 px-3">Role</th>
                                <th className="py-2 px-3">Status</th>
                                <th className="py-2 px-3">Expires</th>
                                <th className="py-2 px-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                              {invitations.map((inv) => (
                                <tr key={inv.id} className="hover:bg-white/[0.02]">
                                  <td className="py-2.5 px-3 font-mono text-white">{inv.email}</td>
                                  <td className="py-2.5 px-3">
                                    <Badge variant="neon" size="sm">
                                      {inv.role}
                                    </Badge>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <Badge
                                      variant={
                                        inv.status === "ACCEPTED"
                                          ? "emerald"
                                          : inv.status === "PENDING"
                                          ? "amber"
                                          : "default"
                                      }
                                      size="sm"
                                    >
                                      {inv.status}
                                    </Badge>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                                    {new Date(inv.expiresAt).toLocaleDateString()}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {inv.status === "PENDING" && (
                                      <button
                                        onClick={() => handleRevokeInvite(inv.id)}
                                        className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold"
                                      >
                                        Revoke
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Workspace Audit Log */}
                <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-violet-400" />
                        Workspace Audit Log
                      </h3>
                      <p className="text-xs text-slate-400">
                        Immutable history of membership changes, role grants, and workspace modifications.
                      </p>
                    </div>
                  </div>

                  {auditLogs.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-surface-canvas/60">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface-elevated/40 text-slate-400 uppercase font-mono text-[10px]">
                          <tr>
                            <th className="py-2 px-3">Timestamp</th>
                            <th className="py-2 px-3">Action</th>
                            <th className="py-2 px-3">Entity</th>
                            <th className="py-2 px-3">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/[0.02]">
                              <td className="py-2 px-3 text-slate-400">
                                {new Date(log.createdAt).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="py-2 px-3 text-white font-bold">{log.action}</td>
                              <td className="py-2 px-3 text-cyan-400">{log.entityType}</td>
                              <td className="py-2 px-3 text-slate-400 truncate max-w-xs">
                                {log.metadata ? JSON.stringify(log.metadata) : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-surface-canvas/40 border border-white/5 text-center text-xs text-slate-500">
                      No audit events recorded yet for this workspace.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Appearance */}
            {activeTab === "appearance" && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Interface Theme & Aesthetics
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customize the ROXIE HUB gaming dark aesthetic.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Dark Gaming SaaS (Active)</span>
                      <Check className="w-4 h-4 text-violet-400" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tailwind tokens with deep canvas (#07090E), violet/cyan gradients, and glassmorphic panels.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-canvas/40 border border-white/5 opacity-60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Light Studio Mode</span>
                      <span className="text-[9px] text-slate-500 uppercase font-mono">Coming Soon</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      High-contrast daylight theme for studio production monitors.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Neon Glow Effects</span>
                    <span className="text-slate-400 text-[11px]">
                      Enable pulsating glow rings on HOT ideas and streak counters.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNeonGlow((prev) => !prev)}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative p-0.5",
                      neonGlow ? "bg-violet-600" : "bg-surface-elevated"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full bg-white transition-transform",
                        neonGlow && "translate-x-5"
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Preferences */}
            {activeTab === "preferences" && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await updateUserSettingsAction({
                    emailNotifications: notifyDeadlines,
                    browserNotifications: notifyReadyScripts,
                  });
                  showFeedback("Preferences saved.");
                }}
                className="space-y-4"
              >
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Content Production Targets
                  </h3>
                  <p className="text-xs text-slate-400">
                    Set cadence targets and studio pacing benchmarks.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Weekly Upload Target (Videos / Week)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={weeklyUploadGoal}
                    onChange={(e) => setWeeklyUploadGoal(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-[11px] text-slate-500">
                    Current cadence: 14-day continuous consistency streak maintained.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                  <Button type="submit" variant="primary" size="sm" className="gap-2">
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Preferences</span>
                  </Button>
                </div>
              </form>
            )}

            {/* Tab: Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Studio Notification Rules
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure deterministic in-app alerts and notifications.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-canvas/60 border border-white/5 text-xs">
                    <div>
                      <span className="font-bold text-white block">Scheduled Drop Warnings</span>
                      <span className="text-[11px] text-slate-400">
                        Alert when a scheduled upload is approaching on the calendar.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyDeadlines}
                      onChange={(e) => setNotifyDeadlines(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-500 bg-surface-canvas border-white/10"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-canvas/60 border border-white/5 text-xs">
                    <div>
                      <span className="font-bold text-white block">Script Ready Alerts</span>
                      <span className="text-[11px] text-slate-400">
                        Notify when a screenplay completes review and is ready for production.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyReadyScripts}
                      onChange={(e) => setNotifyReadyScripts(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-500 bg-surface-canvas border-white/10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Connected Platforms */}
            {activeTab === "platforms" && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    External Distribution & API Links
                  </h3>
                  <p className="text-xs text-slate-400">
                    OAuth channels and API synchronization endpoints.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-600/15 flex items-center justify-center text-red-400">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          YouTube Data API v3
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Automatic video metadata sync and real-time view counts.
                        </span>
                      </div>
                    </div>
                    <Badge variant="purple" size="sm">
                      Coming in Phase 9+
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-600/15 flex items-center justify-center text-cyan-400">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Roblox Open Cloud API
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Avatar thumbnails, place analytics, and badge hooks.
                        </span>
                      </div>
                    </div>
                    <Badge variant="purple" size="sm">
                      Coming in Phase 9+
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-canvas/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-violet-600/15 flex items-center justify-center text-violet-400">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          TikTok Creator Account Sync
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Short-form video publishing direct to TikTok.
                        </span>
                      </div>
                    </div>
                    <Badge variant="purple" size="sm">
                      Coming in Phase 9+
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

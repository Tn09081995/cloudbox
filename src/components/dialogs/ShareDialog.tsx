"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  Calendar,
  UserPlus,
  Eye,
  Download,
} from "lucide-react";
import { FileNode } from "@/lib/mock/types";
import { useFileMutations } from "@/lib/hooks/useFiles";
import { vi } from "@/lib/i18n/vi";
import { toast } from "sonner";

interface ShareDialogProps {
  node: FileNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ node, open, onOpenChange }: ShareDialogProps) {
  const { updateShare } = useFileMutations();

  const [isPublic, setIsPublic] = useState(true);
  const [accessLevel, setAccessLevel] = useState<"view" | "download">("download");
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("cloudbox2026");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [inviteEmail, setInviteEmail] = useState("");
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/s/${node.id}`
    : `https://cloudbox.app/s/${node.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success(vi.dialogs.linkCopied);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    toast.success(`Đã gửi lời mời cộng tác đến ${inviteEmail.trim()}`);
    setInviteEmail("");
  };

  const handleSave = async () => {
    await updateShare({
      id: node.id,
      settings: {
        isPublic,
        accessLevel,
        hasPassword,
        password: hasPassword ? password : undefined,
        expiresAt: hasExpiry ? new Date(Date.now() + expiryDays * 86400000).toISOString() : null,
        sharedWith: [],
      },
    });
    toast.success("Đã cập nhật cài đặt chia sẻ");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 rounded-dialog bg-surface border border-border shadow-xl font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-btn bg-primary-soft text-primary flex items-center justify-center">
              <Share2 className="h-4 w-4 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {vi.dialogs.shareTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {node.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Add People Mock Form */}
          <form onSubmit={handleAddPerson} className="flex items-center gap-2">
            <div className="relative flex-1">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Thêm email người nhận..."
                className="pl-9 h-9 rounded-btn bg-surface-2 border-border text-xs"
              />
            </div>
            <Button
              type="submit"
              disabled={!inviteEmail.trim()}
              className="h-9 px-3 rounded-btn text-xs font-semibold bg-primary text-white hover:bg-primary-ink"
            >
              Mời
            </Button>
          </form>

          {/* Public Link Section */}
          <div className="p-3.5 rounded-card bg-surface-2 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  {vi.dialogs.sharePublic}
                </span>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            {isPublic && (
              <>
                {/* Permission select: Chỉ xem / Cho phép tải */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-muted-foreground">Quyền hạn</span>
                  <div className="flex items-center gap-1 p-0.5 bg-surface rounded-btn border border-border">
                    <button
                      type="button"
                      onClick={() => setAccessLevel("view")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                        accessLevel === "view"
                          ? "bg-primary-soft text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Eye className="h-3 w-3" />
                      <span>{vi.dialogs.shareViewOnly}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccessLevel("download")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                        accessLevel === "download"
                          ? "bg-primary-soft text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Download className="h-3 w-3" />
                      <span>{vi.dialogs.shareAllowDownload}</span>
                    </button>
                  </div>
                </div>

                {/* Password Protection Toggle */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" />
                      {vi.dialogs.sharePassword}
                    </span>
                    <Switch checked={hasPassword} onCheckedChange={setHasPassword} />
                  </div>
                  {hasPassword && (
                    <Input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="h-8 rounded-btn bg-surface border-border text-xs font-mono"
                    />
                  )}
                </div>

                {/* Expiry Date Toggle */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {vi.dialogs.shareExpiry}
                    </span>
                    <Switch checked={hasExpiry} onCheckedChange={setHasExpiry} />
                  </div>
                  {hasExpiry && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Hết hạn sau:</span>
                      <select
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(Number(e.target.value))}
                        className="h-8 px-2 rounded-btn bg-surface border border-border text-xs outline-none"
                      >
                        <option value={1}>1 ngày</option>
                        <option value={7}>7 ngày</option>
                        <option value={30}>30 ngày</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Copy Link Input & Button */}
                <div className="pt-2 flex items-center gap-2">
                  <Input
                    readOnly
                    value={publicUrl}
                    className="h-9 rounded-btn bg-surface border-border text-xs font-mono select-all truncate text-muted-foreground"
                  />
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    className="h-9 px-3.5 rounded-btn text-xs font-semibold gap-1.5 bg-primary text-white hover:bg-primary-ink flex-shrink-0"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-btn text-xs font-medium"
          >
            {vi.actions.cancel}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="h-9 px-4 rounded-btn text-xs font-semibold bg-primary text-white hover:bg-primary-ink"
          >
            {vi.actions.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

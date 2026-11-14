"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Check, Ban, Clock, Loader2, Link as LinkIcon } from "lucide-react";
import { FileRecord, ShareLink } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileRecord | null;
}

export function ShareModal({ isOpen, onClose, file }: ShareModalProps) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [expiryOption, setExpiryOption] = useState<string>("never"); // 'never' | '1d' | '7d' | '30d'
  const supabase = createClient();

  const fetchShareLinks = useCallback(async (fileId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("share_links")
        .select("*")
        .eq("file_id", fileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch {
      toast.error("Không thể tải danh sách liên kết chia sẻ");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (isOpen && file) {
      fetchShareLinks(file.id);
    } else {
      setLinks([]);
    }
  }, [isOpen, file, fetchShareLinks]);

  const calculateExpiresAt = (option: string): string | null => {
    const now = new Date();
    if (option === "1d") {
      now.setDate(now.getDate() + 1);
      return now.toISOString();
    }
    if (option === "7d") {
      now.setDate(now.getDate() + 7);
      return now.toISOString();
    }
    if (option === "30d") {
      now.setDate(now.getDate() + 30);
      return now.toISOString();
    }
    return null;
  };

  const handleCreateShareLink = async () => {
    if (!file) return;

    try {
      setIsCreating(true);
      // Cryptographically secure long random token
      const token = nanoid(24);
      const expiresAt = calculateExpiresAt(expiryOption);

      const { data, error } = await supabase
        .from("share_links")
        .insert({
          file_id: file.id,
          token,
          expires_at: expiresAt,
          revoked: false,
        })
        .select()
        .single();

      if (error) throw error;

      setLinks((prev) => [data, ...prev]);
      toast.success("Đã tạo liên kết chia sẻ công khai!");
      copyToClipboard(token);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Không thể tạo liên kết chia sẻ";
      toast.error(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("share_links")
        .update({ revoked: true })
        .eq("id", linkId);

      if (error) throw error;

      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, revoked: true } : l))
      );
      toast.success("Đã thu hồi liên kết chia sẻ");
    } catch {
      toast.error("Không thể thu hồi liên kết");
    }
  };

  const copyToClipboard = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/s/${token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(token);
    toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
    setTimeout(() => setCopiedToken(null), 3000);
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <span>Chia sẻ tệp &quot;{file.name}&quot;</span>
          </DialogTitle>
          <DialogDescription>
            Bất kỳ ai có liên kết này đều có thể xem hoặc tải tệp xuống.
          </DialogDescription>
        </DialogHeader>

        {/* Create new share link */}
        <div className="space-y-3 pt-2 pb-4 border-b">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tạo liên kết mới
          </Label>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <select
              value={expiryOption}
              onChange={(e) => setExpiryOption(e.target.value)}
              className="h-9 w-full sm:w-48 rounded-xl border border-input bg-transparent px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="never">Không bao giờ hết hạn</option>
              <option value="1d">Hết hạn sau 1 ngày</option>
              <option value="7d">Hết hạn sau 7 ngày</option>
              <option value="30d">Hết hạn sau 30 ngày</option>
            </select>

            <Button
              onClick={handleCreateShareLink}
              disabled={isCreating}
              className="w-full sm:w-auto rounded-xl gap-2 h-9"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="h-4 w-4" />
              )}
              <span>Tạo liên kết</span>
            </Button>
          </div>
        </div>

        {/* List of existing links */}
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Các liên kết đã tạo ({links.length})
          </Label>

          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Đang tải...</span>
            </div>
          ) : links.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Chưa có liên kết chia sẻ nào cho tệp này.
            </p>
          ) : (
            links.map((link) => {
              const isExpired = Boolean(
                link.expires_at && new Date(link.expires_at) < new Date()
              );
              const isInactive = Boolean(link.revoked || isExpired);

              return (
                <div
                  key={link.id}
                  className={`p-3 rounded-xl border text-xs space-y-2 ${
                    isInactive ? "opacity-60 bg-muted/30" : "bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {link.revoked
                          ? "Đã thu hồi"
                          : isExpired
                          ? "Đã hết hạn"
                          : link.expires_at
                          ? `Hết hạn: ${formatDate(link.expires_at)}`
                          : "Vĩnh viễn (Không hết hạn)"}
                      </span>
                    </div>

                    {!link.revoked && !isExpired && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeLink(link.id)}
                        className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                      >
                        <Ban className="h-3 w-3 mr-1" />
                        <span>Thu hồi</span>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={
                        typeof window !== "undefined"
                          ? `${window.location.origin}/s/${link.token}`
                          : `/s/${link.token}`
                      }
                      className="h-8 text-xs font-mono rounded-lg bg-muted/40"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isInactive}
                      onClick={() => copyToClipboard(link.token)}
                      className="h-8 px-2.5 rounded-lg shrink-0 gap-1.5"
                    >
                      {copiedToken === link.token ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-[11px]">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span className="text-[11px]">Sao chép</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

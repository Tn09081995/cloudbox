import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { repository } from "@/lib/mock/repository";
import { ShareSettings } from "@/lib/mock/types";

export const QUERY_KEYS = {
  folder: (folderId: string | null) => ["files", "folder", folderId],
  breadcrumbs: (folderId: string | null) => ["breadcrumbs", folderId],
  node: (id: string | null) => ["files", "node", id],
  recent: ["files", "recent"],
  starred: ["files", "starred"],
  shared: ["files", "shared"],
  trash: ["files", "trash"],
  search: (q: string) => ["files", "search", q],
  storage: ["files", "storage"],
  photos: ["files", "photos"],
  documents: ["files", "documents"],
  locked: ["files", "locked"],
};

export function useFolderFiles(folderId: string | null = null) {
  return useQuery({
    queryKey: QUERY_KEYS.folder(folderId),
    queryFn: () => repository.listFolder(folderId),
  });
}

export function useBreadcrumbs(folderId: string | null = null) {
  return useQuery({
    queryKey: QUERY_KEYS.breadcrumbs(folderId),
    queryFn: () => repository.getBreadcrumbs(folderId),
  });
}

export function useFileNode(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.node(id),
    queryFn: () => (id ? repository.getNode(id) : null),
    enabled: !!id,
  });
}

export function useRecentFiles() {
  return useQuery({
    queryKey: QUERY_KEYS.recent,
    queryFn: () => repository.getRecentFiles(),
  });
}

export function useStarredFiles() {
  return useQuery({
    queryKey: QUERY_KEYS.starred,
    queryFn: () => repository.getStarredFiles(),
  });
}

export function useSharedFiles() {
  return useQuery({
    queryKey: QUERY_KEYS.shared,
    queryFn: () => repository.getSharedFiles(),
  });
}

export function useTrashFiles() {
  return useQuery({
    queryKey: QUERY_KEYS.trash,
    queryFn: () => repository.getTrashFiles(),
  });
}

export function useSearchFiles(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.search(query),
    queryFn: () => repository.search(query),
    enabled: query.trim().length > 0,
  });
}

export function useStorageUsage() {
  return useQuery({
    queryKey: QUERY_KEYS.storage,
    queryFn: () => repository.getStorageUsage(),
  });
}

export function usePhotosAndVideos() {
  return useQuery({
    queryKey: QUERY_KEYS.photos,
    queryFn: () => repository.getPhotosAndVideos(),
  });
}

export function useDocuments() {
  return useQuery({
    queryKey: QUERY_KEYS.documents,
    queryFn: () => repository.getDocuments(),
  });
}

export function useLockedFiles() {
  return useQuery({
    queryKey: QUERY_KEYS.locked,
    queryFn: () => repository.getLockedFiles(),
  });
}

export function useFileMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["files"] });
    queryClient.invalidateQueries({ queryKey: ["breadcrumbs"] });
  };

  const createFolderMutation = useMutation({
    mutationFn: ({ name, parentId, color }: { name: string; parentId: string | null; color?: string }) =>
      repository.createFolder(name, parentId, color),
    onSuccess: invalidateAll,
  });

  const createTextFileMutation = useMutation({
    mutationFn: ({ name, content, parentId }: { name: string; content: string; parentId: string | null }) =>
      repository.createTextFile(name, content, parentId),
    onSuccess: invalidateAll,
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      repository.rename(id, newName),
    onSuccess: invalidateAll,
  });

  const moveMutation = useMutation({
    mutationFn: ({ ids, targetFolderId }: { ids: string[]; targetFolderId: string | null }) =>
      repository.move(ids, targetFolderId),
    onSuccess: invalidateAll,
  });

  const copyMutation = useMutation({
    mutationFn: ({ ids, targetFolderId }: { ids: string[]; targetFolderId: string | null }) =>
      repository.copy(ids, targetFolderId),
    onSuccess: invalidateAll,
  });

  const trashMutation = useMutation({
    mutationFn: (ids: string[]) => repository.trash(ids),
    onSuccess: invalidateAll,
  });

  const restoreMutation = useMutation({
    mutationFn: (ids: string[]) => repository.restore(ids),
    onSuccess: invalidateAll,
  });

  const deleteForeverMutation = useMutation({
    mutationFn: (ids: string[]) => repository.deletePermanently(ids),
    onSuccess: invalidateAll,
  });

  const emptyTrashMutation = useMutation({
    mutationFn: () => repository.emptyTrash(),
    onSuccess: invalidateAll,
  });

  const toggleStarMutation = useMutation({
    mutationFn: (id: string) => repository.toggleStar(id),
    onSuccess: invalidateAll,
  });

  const toggleLockMutation = useMutation({
    mutationFn: (id: string) => repository.toggleLock(id),
    onSuccess: invalidateAll,
  });

  const updateColorMutation = useMutation({
    mutationFn: ({ id, color }: { id: string; color: string }) =>
      repository.updateFolderColor(id, color),
    onSuccess: invalidateAll,
  });

  const updateShareMutation = useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: ShareSettings }) =>
      repository.updateShareSettings(id, settings),
    onSuccess: invalidateAll,
  });

  const resetDataMutation = useMutation({
    mutationFn: () => repository.resetToSeed(),
    onSuccess: invalidateAll,
  });

  return {
    createFolder: createFolderMutation.mutateAsync,
    createTextFile: createTextFileMutation.mutateAsync,
    rename: renameMutation.mutateAsync,
    move: moveMutation.mutateAsync,
    copy: copyMutation.mutateAsync,
    trash: trashMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    deletePermanently: deleteForeverMutation.mutateAsync,
    emptyTrash: emptyTrashMutation.mutateAsync,
    toggleStar: toggleStarMutation.mutateAsync,
    toggleLock: toggleLockMutation.mutateAsync,
    updateColor: updateColorMutation.mutateAsync,
    updateShare: updateShareMutation.mutateAsync,
    resetData: resetDataMutation.mutateAsync,
  };
}

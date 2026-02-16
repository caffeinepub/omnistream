import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob, MediaType, type PublicMediaMeta, type UserProfile, type PublicLiveSession } from '../backend';

export function useGetAllVideos() {
  const { actor, isFetching } = useActor();

  return useQuery<PublicMediaMeta[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllShorts() {
  const { actor, isFetching } = useActor();

  return useQuery<PublicMediaMeta[]>({
    queryKey: ['shorts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllShorts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMediaByTitle(title: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicMediaMeta>({
    queryKey: ['media', title],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMediaByTitle(title);
    },
    enabled: !!actor && !isFetching && !!title,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

interface UploadMediaParams {
  title: string;
  mediaType: MediaType;
  file: File;
  duration: number;
  onProgress?: (percentage: number) => void;
}

export function useUploadMedia() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, mediaType, file, duration, onProgress }: UploadMediaParams) => {
      if (!actor) throw new Error('Actor not available');

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      let blob = ExternalBlob.fromBytes(bytes);
      if (onProgress) {
        blob = blob.withUploadProgress(onProgress);
      }

      const result = await actor.uploadMedia(
        title,
        mediaType,
        BigInt(duration),
        blob
      );

      if (result.__kind__ === 'error') {
        if (result.error === 'durationExceeded') {
          throw new Error('Video duration exceeds the 24-hour limit');
        } else {
          throw new Error('Upload failed due to storage error');
        }
      }

      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['shorts'] });
    },
  });
}

// Live session hooks
export function useGetAllActiveLiveSessions() {
  const { actor, isFetching } = useActor();

  return useQuery<PublicLiveSession[]>({
    queryKey: ['liveSessions', 'active'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveLiveSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLiveSession(title: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicLiveSession>({
    queryKey: ['liveSession', title],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLiveSession(title);
    },
    enabled: !!actor && !isFetching && !!title,
  });
}

interface StartLiveSessionParams {
  title: string;
  description: string;
}

export function useStartLiveSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description }: StartLiveSessionParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.startLiveSession(title, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
    },
  });
}

export function useEndLiveSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.endLiveSession(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
      queryClient.invalidateQueries({ queryKey: ['liveSession'] });
    },
  });
}

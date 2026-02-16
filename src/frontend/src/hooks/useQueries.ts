import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob, MediaType, type PublicMediaMeta, type UserProfile, type PublicLiveSession, type Comment, type CommentInput } from '../backend';

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
      if (!actor) {
        throw new Error('You must be signed in to upload media. Please sign in and try again.');
      }

      let arrayBuffer: ArrayBuffer;
      try {
        arrayBuffer = await file.arrayBuffer();
      } catch (error) {
        throw new Error('Failed to read the file. Please try a different file.');
      }

      const bytes = new Uint8Array(arrayBuffer);
      
      let blob = ExternalBlob.fromBytes(bytes);
      if (onProgress) {
        blob = blob.withUploadProgress(onProgress);
      }

      let result;
      try {
        result = await actor.uploadMedia(
          title,
          mediaType,
          BigInt(duration),
          blob
        );
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Upload failed: ${error.message}`);
        }
        throw new Error('Upload failed due to a network or server error. Please try again.');
      }

      if (result.__kind__ === 'error') {
        if (result.error === 'durationExceeded') {
          throw new Error('Video duration exceeds the 24-hour limit. Please upload a shorter video.');
        } else if (result.error === 'shortIsTooShort') {
          throw new Error('Shorts must be at least 3 seconds long. Please upload a longer video.');
        } else if (result.error === 'storageFailure') {
          throw new Error('Upload failed due to storage error. Please try again or contact support.');
        } else {
          throw new Error('Upload failed. Please try again.');
        }
      }

      return result.success;
    },
    onSuccess: (uploadedMedia) => {
      // Optimistically update the cache with the new media
      const queryKey = uploadedMedia.mediaType === 'video' ? ['videos'] : ['shorts'];
      
      // Update the specific media type cache
      queryClient.setQueryData<PublicMediaMeta[]>(queryKey, (old) => {
        if (!old) return [uploadedMedia];
        return [uploadedMedia, ...old];
      });

      // Update the For You feed cache
      queryClient.setQueryData<PublicMediaMeta[]>(['forYou'], (old) => {
        if (!old) return [uploadedMedia];
        return [uploadedMedia, ...old];
      });

      // Set the individual media cache
      queryClient.setQueryData(['media', uploadedMedia.title], uploadedMedia);

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['shorts'] });
      queryClient.invalidateQueries({ queryKey: ['forYou'] });
    },
  });
}

// Combined For You feed
export function useGetForYouFeed() {
  const { actor, isFetching } = useActor();

  return useQuery<PublicMediaMeta[]>({
    queryKey: ['forYou'],
    queryFn: async () => {
      if (!actor) return [];
      const [videos, shorts] = await Promise.all([
        actor.getAllVideos(),
        actor.getAllShorts(),
      ]);
      // Combine and sort by recency (newest first)
      return [...videos, ...shorts].sort((a, b) => 
        Number(b.createdAt - a.createdAt)
      );
    },
    enabled: !!actor && !isFetching,
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
    refetchInterval: 5000, // Poll every 5 seconds
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

// Comment hooks
export function useGetComments(mediaTitle: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', mediaTitle],
    queryFn: async () => {
      if (!actor) throw new Error('Unable to load comments. Please check your connection.');
      return actor.getComments(mediaTitle);
    },
    enabled: !!actor && !isFetching && !!mediaTitle,
  });
}

interface CreateCommentParams {
  mediaTitle: string;
  text: string;
}

export function useCreateComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mediaTitle, text }: CreateCommentParams) => {
      if (!actor) throw new Error('Unable to post comment. Please check your connection.');
      const commentInput: CommentInput = { text };
      await actor.createComment(mediaTitle, commentInput);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.mediaTitle] });
    },
  });
}

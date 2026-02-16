import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob, MediaType, type PublicMediaMeta, type UserProfile, type PublicLiveSession, type Comment, type CommentInput, type Post } from '../backend';
import type { Poll, PollId } from '../types/poll';
import { Principal } from '@dfinity/principal';

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

export function useGetUserProfile(user: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUploadMedia() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      mediaType,
      durationSeconds,
      mediaData,
    }: {
      title: string;
      mediaType: MediaType;
      durationSeconds: bigint;
      mediaData: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.uploadMedia(title, mediaType, durationSeconds, mediaData);
      
      if (result.__kind__ === 'error') {
        const errorType = result.error;
        if (errorType === 'durationExceeded') {
          throw new Error('Video duration exceeds 24 hours');
        } else if (errorType === 'shortIsTooShort') {
          throw new Error('Short must be at least 3 seconds long');
        } else {
          throw new Error('Upload failed');
        }
      }
      
      return result.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['shorts'] });
      queryClient.invalidateQueries({ queryKey: ['forYouFeed'] });
    },
  });
}

export function useGetForYouFeed() {
  const { actor, isFetching } = useActor();

  return useQuery<PublicMediaMeta[]>({
    queryKey: ['forYouFeed'],
    queryFn: async () => {
      if (!actor) return [];
      const [videos, shorts] = await Promise.all([
        actor.getAllVideos(),
        actor.getAllShorts(),
      ]);
      
      // Combine and sort by createdAt (newest first)
      const combined = [...videos, ...shorts];
      return combined.sort((a, b) => {
        const aTime = Number(a.createdAt);
        const bTime = Number(b.createdAt);
        return bTime - aTime;
      });
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStartLiveSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.startLiveSession(title, description);
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
      return actor.endLiveSession(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
      queryClient.invalidateQueries({ queryKey: ['liveSession'] });
    },
  });
}

export function useGetAllActiveLiveSessions() {
  const { actor, isFetching } = useActor();

  return useQuery<PublicLiveSession[]>({
    queryKey: ['liveSessions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveLiveSessions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
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

export function useCreateComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mediaId, text }: { mediaId: string; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      const commentInput: CommentInput = { text };
      return actor.createComment(mediaId, commentInput);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.mediaId] });
    },
  });
}

export function useGetComments(mediaId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', mediaId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(mediaId);
    },
    enabled: !!actor && !isFetching && !!mediaId,
  });
}

export function useGetAllPolls() {
  const { actor, isFetching } = useActor();

  return useQuery<Poll[]>({
    queryKey: ['polls'],
    queryFn: async () => {
      if (!actor) return [];
      // @ts-expect-error - Poll methods not yet in backend interface
      return actor.getAllPolls();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPoll(pollId: PollId) {
  const { actor, isFetching } = useActor();

  return useQuery<Poll>({
    queryKey: ['poll', pollId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // @ts-expect-error - Poll methods not yet in backend interface
      return actor.getPoll(pollId);
    },
    enabled: !!actor && !isFetching && !!pollId,
  });
}

export function useCreatePoll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ question, options }: { question: string; options: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-expect-error - Poll methods not yet in backend interface
      return actor.createPoll(question, options);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

export function useVotePoll() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pollId, optionIndex }: { pollId: PollId; optionIndex: number }) => {
      if (!actor) throw new Error('Actor not available');
      // @ts-expect-error - Poll methods not yet in backend interface
      return actor.votePoll(pollId, optionIndex);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ image, caption }: { image: ExternalBlob; caption: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(image, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

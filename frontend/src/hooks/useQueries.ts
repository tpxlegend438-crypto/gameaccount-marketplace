import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { type Listing, type ChatMessage, type ChatPreview, type UserProfile, ExternalBlob } from '../backend';

// ─── Listings ────────────────────────────────────────────────────────────────

export function useGetAllActiveListings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<Listing>>({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveListings();
    },
    enabled: !!actor && !actorFetching,
    refetchOnWindowFocus: true,
  });
}

export function useGetListing(id: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Listing | null>({
    queryKey: ['listing', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getListing(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameName,
      description,
      price,
      photos,
    }: {
      gameName: string;
      description: string;
      price: bigint;
      photos: ExternalBlob[];
    }) => {
      if (!actor) throw new Error('Not connected');
      return actor.createListing(gameName, description, price, photos);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useMarkAsSold() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Not connected');
      return actor.markAsSold(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Not connected');
      return actor.deleteListing(listingId);
    },
    onSuccess: (_data, listingId) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId.toString()] });
    },
  });
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export function useGetChatHistory(listingId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<ChatMessage>>({
    queryKey: ['chat', listingId?.toString()],
    queryFn: async () => {
      if (!actor || listingId === null) return [];
      return actor.getChatHistory(listingId);
    },
    enabled: !!actor && !actorFetching && listingId !== null,
    refetchInterval: 5000,
  });
}

export function useSendMessage(listingId: bigint | null) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      photo,
    }: {
      content: string;
      photo: ExternalBlob | null;
    }) => {
      if (!actor || listingId === null) throw new Error('Not connected');
      return actor.sendMessage(listingId, content, photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', listingId?.toString()] });
      queryClient.invalidateQueries({ queryKey: ['userChats'] });
    },
  });
}

// ─── User Chats ───────────────────────────────────────────────────────────────

export function useGetUserChats() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<Array<ChatPreview>>({
    queryKey: ['userChats', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserChats();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    refetchInterval: 10000,
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

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
      if (!actor) throw new Error('Not connected');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

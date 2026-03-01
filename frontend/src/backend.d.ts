import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Listing {
    status: ListingStatus;
    created: Time;
    description: string;
    seller: Principal;
    gameName: string;
    price: bigint;
    photos: Array<ExternalBlob>;
}
export interface ChatPreview {
    listingId: bigint;
    lastMessage?: ChatMessage;
    listingTitle: string;
}
export interface ChatMessage {
    content: string;
    sender: Principal;
    timestamp: Time;
    photo?: ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export enum ListingStatus {
    active = "active",
    sold = "sold"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(gameName: string, description: string, price: bigint, photos: Array<ExternalBlob>): Promise<bigint>;
    deleteListing(listingId: bigint): Promise<void>;
    getAllActiveListings(): Promise<Array<Listing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatHistory(listingId: bigint): Promise<Array<ChatMessage>>;
    getListing(id: bigint): Promise<Listing | null>;
    getUserChats(): Promise<Array<ChatPreview>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAsSold(listingId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(listingId: bigint, content: string, photo: ExternalBlob | null): Promise<void>;
}

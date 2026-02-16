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
export interface PublicLiveSession {
    startTime: Time;
    title: string;
    description: string;
    isActive: boolean;
    streamer: Principal;
}
export type Time = bigint;
export interface PublicMediaMeta {
    title: string;
    createdAt: Time;
    durationSeconds: bigint;
    mediaData: ExternalBlob;
    mediaType: MediaType;
}
export interface UserProfile {
    name: string;
}
export type UploadResult = {
    __kind__: "error";
    error: UploadError;
} | {
    __kind__: "success";
    success: PublicMediaMeta;
};
export enum MediaType {
    video = "video",
    short_ = "short"
}
export enum UploadError {
    storageFailure = "storageFailure",
    durationExceeded = "durationExceeded",
    shortIsTooShort = "shortIsTooShort"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    endLiveSession(title: string): Promise<void>;
    getAllActiveLiveSessions(): Promise<Array<PublicLiveSession>>;
    getAllShorts(): Promise<Array<PublicMediaMeta>>;
    getAllVideos(): Promise<Array<PublicMediaMeta>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLiveSession(title: string): Promise<PublicLiveSession>;
    getMediaByTitle(title: string): Promise<PublicMediaMeta>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startLiveSession(title: string, description: string): Promise<void>;
    uploadMedia(title: string, mediaType: MediaType, durationSeconds: bigint, mediaData: ExternalBlob): Promise<UploadResult>;
}

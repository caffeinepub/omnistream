import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type MediaType = {
    #short;
    #video;
  };

  public type MediaMeta = {
    title : Text;
    mediaType : MediaType;
    createdAt : Time.Time;
    durationSeconds : Nat;
    mediaData : Storage.ExternalBlob;
  };

  module MediaMeta {
    public func toPublic(meta : MediaMeta) : PublicMediaMeta {
      {
        title = meta.title;
        mediaType = meta.mediaType;
        createdAt = meta.createdAt;
        durationSeconds = meta.durationSeconds;
        mediaData = meta.mediaData;
      };
    };
  };

  public type PublicMediaMeta = {
    title : Text;
    mediaType : MediaType;
    createdAt : Time.Time;
    durationSeconds : Nat;
    mediaData : Storage.ExternalBlob;
  };

  public type UserProfile = {
    name : Text;
  };

  public type LiveSession = {
    title : Text;
    description : Text;
    startTime : Time.Time;
    isActive : Bool;
    streamer : Principal;
  };

  module LiveSession {
    public func toPublic(session : LiveSession) : PublicLiveSession {
      {
        title = session.title;
        description = session.description;
        startTime = session.startTime;
        isActive = session.isActive;
        streamer = session.streamer;
      };
    };
  };

  public type PublicLiveSession = {
    title : Text;
    description : Text;
    startTime : Time.Time;
    isActive : Bool;
    streamer : Principal;
  };

  public type Comment = {
    author : Principal;
    text : Text;
    createdAt : Time.Time;
  };

  public type CommentInput = {
    text : Text;
  };

  include MixinStorage();

  let mediaStorage = Map.empty<Text, MediaMeta>();
  let liveSessions = Map.empty<Text, LiveSession>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let commentStore = Map.empty<Text, [Comment]>();

  public type UploadResult = {
    #success : PublicMediaMeta;
    #error : UploadError;
  };

  public type UploadError = {
    #durationExceeded;
    #storageFailure;
    #shortIsTooShort;
  };

  let ONE_DAY_SECONDS = 24 * 60 * 60;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func uploadMedia(title : Text, mediaType : MediaType, durationSeconds : Nat, mediaData : Storage.ExternalBlob) : async UploadResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload media");
    };

    switch (mediaType) {
      case (#short) {
        if (durationSeconds < 3) {
          return #error(#shortIsTooShort);
        };
      };
      case (_) {};
    };

    if (durationSeconds > ONE_DAY_SECONDS) {
      return #error(#durationExceeded);
    };

    let meta = {
      title;
      mediaType;
      createdAt = Time.now();
      durationSeconds;
      mediaData;
    };

    mediaStorage.add(title, meta);
    #success(MediaMeta.toPublic(meta));
  };

  public query ({ caller }) func getAllVideos() : async [PublicMediaMeta] {
    mediaStorage.entries().toArray().filter(func((_, meta)) { meta.mediaType == #video }).map(func((_, meta)) { MediaMeta.toPublic(meta) });
  };

  public query ({ caller }) func getAllShorts() : async [PublicMediaMeta] {
    mediaStorage.entries().toArray().filter(func((_, meta)) { meta.mediaType == #short }).map(func((_, meta)) { MediaMeta.toPublic(meta) });
  };

  public query ({ caller }) func getMediaByTitle(title : Text) : async PublicMediaMeta {
    switch (mediaStorage.get(title)) {
      case (null) { Runtime.trap("Media not found") };
      case (?meta) { MediaMeta.toPublic(meta) };
    };
  };

  public shared ({ caller }) func startLiveSession(title : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start live sessions");
    };

    let session = {
      title;
      description;
      startTime = Time.now();
      isActive = true;
      streamer = caller;
    };

    liveSessions.add(title, session);
  };

  public shared ({ caller }) func endLiveSession(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can end live sessions");
    };

    switch (liveSessions.get(title)) {
      case (null) { Runtime.trap("Live session not found") };
      case (?session) {
        if (session.streamer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the streamer or an admin can end this session");
        };

        let updatedSession = { session with isActive = false };
        liveSessions.add(title, updatedSession);
      };
    };
  };

  public query ({ caller }) func getLiveSession(title : Text) : async PublicLiveSession {
    switch (liveSessions.get(title)) {
      case (null) { Runtime.trap("Live session not found") };
      case (?session) { LiveSession.toPublic(session) };
    };
  };

  public query ({ caller }) func getAllActiveLiveSessions() : async [PublicLiveSession] {
    liveSessions.entries().toArray().filter(func((_, session)) { session.isActive }).map(func((_, session)) { LiveSession.toPublic(session) });
  };

  public shared ({ caller }) func createComment(mediaId : Text, commentInput : CommentInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create comments");
    };

    let newComment : Comment = {
      author = caller;
      text = commentInput.text;
      createdAt = Time.now();
    };

    let existingComments = switch (commentStore.get(mediaId)) {
      case (null) { [] };
      case (?comments) { comments };
    };

    let updatedComments = [newComment].concat(existingComments);
    commentStore.add(mediaId, updatedComments);
  };

  public query ({ caller }) func getComments(mediaId : Text) : async [Comment] {
    switch (commentStore.get(mediaId)) {
      case (null) { [] };
      case (?comments) { comments };
    };
  };
};

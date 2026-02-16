import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import ExternalBlob "blob-storage/Storage";

module {
  public type MediaMeta = {
    title : Text;
    mediaType : {
      #short;
      #video;
    };
    createdAt : Int;
    durationSeconds : Nat;
    mediaData : ExternalBlob.ExternalBlob;
  };

  public type LiveSession = {
    title : Text;
    description : Text;
    startTime : Int;
    isActive : Bool;
    streamer : Principal;
  };

  public type UserProfile = {
    name : Text;
  };

  public type Comment = {
    author : Principal;
    text : Text;
    createdAt : Int;
  };

  public type OldActor = {
    mediaStorage : Map.Map<Text, MediaMeta>;
    liveSessions : Map.Map<Text, LiveSession>;
    userProfiles : Map.Map<Principal, UserProfile>;
    commentStore : Map.Map<Text, [Comment]>;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};

import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";

module {
  type OldActor = {
    mediaStorage : Map.Map<Text, {
      title : Text;
      mediaType : { #short; #video };
      createdAt : Time.Time;
      durationSeconds : Nat;
      mediaData : Storage.ExternalBlob;
    }>;
    liveSessions : Map.Map<Text, {
      title : Text;
      description : Text;
      startTime : Time.Time;
      isActive : Bool;
      streamer : Principal;
    }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type NewActor = {
    mediaStorage : Map.Map<Text, {
      title : Text;
      mediaType : { #short; #video };
      createdAt : Time.Time;
      durationSeconds : Nat;
      mediaData : Storage.ExternalBlob;
    }>;
    liveSessions : Map.Map<Text, {
      title : Text;
      description : Text;
      startTime : Time.Time;
      isActive : Bool;
      streamer : Principal;
    }>;
    commentStore : Map.Map<Text, [ {
      author : Principal;
      text : Text;
      createdAt : Int;
    } ]>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    let newCommentStore = Map.empty<Text, [ {
      author : Principal;
      text : Text;
      createdAt : Int;
    } ]>();
    { old with commentStore = newCommentStore };
  };
};

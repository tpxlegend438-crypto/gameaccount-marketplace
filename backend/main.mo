import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
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

  type Listing = {
    seller : Principal;
    gameName : Text;
    description : Text;
    price : Nat;
    photos : [Storage.ExternalBlob];
    status : ListingStatus;
    created : Time.Time;
  };

  type ListingStatus = {
    #active;
    #sold;
  };

  type ChatMessage = {
    sender : Principal;
    content : Text;
    photo : ?Storage.ExternalBlob;
    timestamp : Time.Time;
  };

  type ChatThread = {
    buyer : Principal;
    seller : Principal;
    listingId : Nat;
    messages : List.List<ChatMessage>;
  };

  type ChatPreview = {
    listingId : Nat;
    listingTitle : Text;
    lastMessage : ?ChatMessage;
  };

  let listings = Map.empty<Nat, Listing>();
  let chatThreads = Map.empty<Nat, ChatThread>();
  var nextListingId = 0;

  let adminPrincipal = Principal.fromText("rokdy-ukica-uacon-xqpk6-46vhi-5fxyu-xqozt-pz437-gqggt-qctjn-lqe");

  func isAdmin(caller : Principal) : Bool {
    caller == adminPrincipal;
  };

  public shared ({ caller }) func createListing(gameName : Text, description : Text, price : Nat, photos : [Storage.ExternalBlob]) : async Nat {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can create listings");
    };
    if (photos.size() > 5) {
      Runtime.trap("Maximum 5 photos allowed");
    };

    let listing : Listing = {
      seller = caller;
      gameName;
      description;
      price;
      photos;
      status = #active;
      created = Time.now();
    };

    listings.add(nextListingId, listing);
    nextListingId += 1;
    nextListingId - 1;
  };

  public query func getListing(id : Nat) : async ?Listing {
    listings.get(id);
  };

  public query func getAllActiveListings() : async [Listing] {
    let iter = listings.values();
    let activeListings = List.empty<Listing>();

    iter.forEach(
      func(listing) {
        if (listing.status == #active) {
          activeListings.add(listing);
        };
      }
    );

    activeListings.toArray();
  };

  public shared ({ caller }) func markAsSold(listingId : Nat) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can mark listings as sold");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        listings.add(
          listingId,
          {
            seller = listing.seller;
            gameName = listing.gameName;
            description = listing.description;
            price = listing.price;
            photos = listing.photos;
            status = #sold;
            created = listing.created;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteListing(listingId : Nat) : async () {
    if (not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin can delete listings");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?_listing) {
        listings.remove(listingId);
      };
    };
  };

  public shared ({ caller }) func sendMessage(listingId : Nat, content : Text, photo : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Account required to send messages");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.status != #active) {
          Runtime.trap("Cannot send message for sold listing");
        };

        let newMessage : ChatMessage = {
          sender = caller;
          content;
          photo;
          timestamp = Time.now();
        };

        switch (chatThreads.get(listingId)) {
          case (null) {
            chatThreads.add(
              listingId,
              {
                buyer = caller;
                seller = listing.seller;
                listingId;
                messages = List.fromArray<ChatMessage>([newMessage]);
              },
            );
          };
          case (?thread) {
            thread.messages.add(newMessage);
          };
        };
      };
    };
  };

  public query ({ caller }) func getChatHistory(listingId : Nat) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Account required to view chat history");
    };
    switch (chatThreads.get(listingId)) {
      case (null) { [] };
      case (?thread) {
        if (caller != thread.buyer and caller != thread.seller and not isAdmin(caller)) {
          Runtime.trap("Unauthorized: Must be the buyer or seller to view this chat");
        };
        thread.messages.toArray();
      };
    };
  };

  public query ({ caller }) func getUserChats() : async [ChatPreview] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Account required to view chats");
    };
    let chatPreviews = List.empty<ChatPreview>();

    for ((listingId, thread) in chatThreads.entries()) {
      if (caller == thread.buyer or caller == thread.seller) {
        switch (listings.get(listingId)) {
          case (null) {};
          case (?listing) {
            let lastMessage = if (thread.messages.isEmpty()) {
              null;
            } else {
              ?thread.messages.at(thread.messages.size() - 1);
            };
            chatPreviews.add({
              listingId;
              listingTitle = listing.gameName;
              lastMessage;
            });
          };
        };
      };
    };

    chatPreviews.toArray();
  };
};

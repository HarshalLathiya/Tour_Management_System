import { ProfileClient } from "./profile-client";
import type { Profile } from "@/types";

export default function ProfilePage() {
  // Profile data will be fetched client-side by ProfileClient.
  // Passing an empty placeholder that conforms to the Profile shape.
  const emptyProfile = {} as Profile;

  return <ProfileClient profile={emptyProfile} />;
}

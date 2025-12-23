import defaultProfile from "@/assets/images/default_profile.png";

export function getProfileImage(src) {
  return src && src.trim() ? src : defaultProfile;
}

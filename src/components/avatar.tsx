import AvatarSvg from "@/assets/images/avatar.svg";
import { normalizeUrl } from "@/utils/url";
import { Avatar } from "react-native-paper";

export function CustomAvatar({
  src,
  size = 40,
}: {
  src?: string | null;
  size?: number;
}) {
  if (src) {
    const normalizedSrc = normalizeUrl(src);
    if (__DEV__) {
      console.log("[CustomAvatar] render", {
        src,
        normalizedSrc,
        size,
      });
    }

    return (
      <Avatar.Image
        size={size}
        source={{
          uri: normalizedSrc,
        }}
        onLoad={() => {
          if (__DEV__) console.log("[CustomAvatar] load success", normalizedSrc);
        }}
        onError={(event) => {
          if (__DEV__) {
            console.error("[CustomAvatar] load failed", {
              normalizedSrc,
              error: event.nativeEvent?.error,
            });
          }
        }}
      />
    );
  }

  return <AvatarSvg width={size} height={size} />;
}

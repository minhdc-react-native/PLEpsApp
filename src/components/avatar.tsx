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
    return (
      <Avatar.Image
        size={size}
        source={{
          uri: normalizeUrl(src),
        }}
      />
    );
  }

  return <AvatarSvg width={size} height={size} />;
}

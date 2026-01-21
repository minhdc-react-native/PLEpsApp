import { helper } from "@/hooks/useHelper";
import { INoti, INotiMetadata, NotiDataKey } from "@/types/noti.model";

export function mapNotiMetadata(schema: any): INotiMetadata {
  let data: Record<string, any> = {};
  if (typeof schema === "string") {
    data = JSON.parse(schema);
  } else {
    data = schema;
  }

  // The schema returns a Record<string, { feature: string; content: string }>
  // but the UI model expects Record<string, INotiMetadataItem> where
  // INotiMetadataItem.key is the NotiDataKey. Map `feature` -> `key` and
  // `content` -> `content` and cast the feature to NotiDataKey.
  const mapped: INotiMetadata = {};

  Object.entries(data).forEach(([k, v]) => {
    mapped[k] = {
      key: v.feature as NotiDataKey,
      content: v.content,
    };
  });

  return mapped;
}

export function mapNoti(schema: any): INoti {
  const { displayDatetime } = helper();

  const metadata = mapNotiMetadata(schema.data);

  // Replace placeholders in the raw body. Placeholders are in the form
  // __variableName__ (two underscores on each side). For each placeholder,
  // look up the corresponding metadata entry by the same key and replace
  // the placeholder with the metadata.content value. If not found, leave
  // the placeholder unchanged.
  const placeholderRegex = /__([a-zA-Z0-9_-]+)__/g;

  const resolvedTitle = schema.title.replace(
    placeholderRegex,
    (match: string, p1: string) => {
      const entry = metadata[p1];
      return entry ? entry.content : match;
    }
  );

  const resolvedBody = schema.bodyMarkdown.replace(
    placeholderRegex,
    (match: string, p1: string) => {
      const entry = metadata[p1];
      return entry ? entry.content : match;
    }
  );

  return {
    id: schema.id,
    title: resolvedTitle,
    body: resolvedBody,
    sendAt: schema.createdDate,
    isRead: schema.readStatus === 1 ? true : false,
    metadata: metadata,
  };
}

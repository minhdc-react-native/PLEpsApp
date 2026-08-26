import { ReactNode, useState } from "react";
import ImageViewing from "react-native-image-viewing";
import { Image, Linking, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { normalizeUrl } from "@/utils/url";

type RichTextNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: RichTextMark[];
  content?: RichTextNode[];
};

type RichTextMark = {
  type?: string;
  attrs?: Record<string, unknown>;
};

type ImageSource = { uri: string };

type RenderContext = {
  images: ImageSource[];
  onImagePress: (index: number) => void;
};

interface TrainingRichTextProps {
  value: unknown;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function isTrainingRichTextValue(value: unknown): boolean {
  if (value && typeof value === "object") {
    return (value as RichTextNode).type === "doc";
  }
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return Boolean(parsed && typeof parsed === "object" && (parsed.type === "doc" || Array.isArray(parsed)));
  } catch {
    return false;
  }
}

export default function TrainingRichText({ value, style, textStyle }: TrainingRichTextProps) {
  const document = toDocument(value);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  if (!document) return null;

  const images = collectImageSources(document);
  const context: RenderContext = {
    images,
    onImagePress: setActiveImageIndex,
  };

  return (
    <>
      <View style={[styles.root, style]}>{renderBlock(document, "root", textStyle, context)}</View>
      {activeImageIndex !== null && images.length > 0 ? <ImageViewing images={images} imageIndex={activeImageIndex} visible onRequestClose={() => setActiveImageIndex(null)} onImageIndexChange={setActiveImageIndex} swipeToCloseEnabled doubleTapToZoomEnabled backgroundColor="#000000" /> : null}
    </>
  );
}

function toDocument(value: unknown): RichTextNode | null {
  if (value && typeof value === "object") {
    const node = value as RichTextNode;
    return node.type === "doc" ? node : { type: "doc", content: [node] };
  }

  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return toDocument(JSON.parse(trimmed));
    } catch {
      // A normal string that happens to start with a brace is still valid text.
    }
  }

  return {
    type: "doc",
    content: value.split(/\r?\n/).map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: stripHtml(line) }] : undefined,
    })),
  };
}

function renderBlock(node: RichTextNode, key: string, textStyle: StyleProp<TextStyle> | undefined, context: RenderContext): ReactNode {
  const children = node.content ?? [];
  switch (node.type) {
    case "doc":
      return children.map((child, index) => renderBlock(child, `${key}-${index}`, textStyle, context));
    case "paragraph":
      return children.some((child) => child.type === "image")
        ? <View key={key} style={styles.paragraphBlock}>{children.map((child, index) => child.type === "image" ? renderBlock(child, `${key}-${index}`, textStyle, context) : <Text key={`${key}-${index}`} style={[styles.paragraph, textStyle]}>{renderInline(child, `${key}-${index}`, textStyle, context)}</Text>)}</View>
        : <Text key={key} style={[styles.paragraph, textStyle]}>{renderInlineChildren(children, `${key}-inline`, textStyle, context)}</Text>;
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      return <Text key={key} style={[styles.heading, level >= 3 && styles.headingSmall, textStyle]}>{renderInlineChildren(children, `${key}-inline`, textStyle, context)}</Text>;
    }
    case "bulletList":
      return <View key={key} style={styles.list}>{children.map((child, index) => renderListItem(child, `${key}-${index}`, "•", textStyle, context))}</View>;
    case "orderedList":
      return <View key={key} style={styles.list}>{children.map((child, index) => renderListItem(child, `${key}-${index}`, `${index + 1}.`, textStyle, context))}</View>;
    case "listItem":
      return <View key={key} style={styles.listItemContent}>{children.map((child, index) => renderBlock(child, `${key}-${index}`, textStyle, context))}</View>;
    case "blockquote":
      return <View key={key} style={styles.blockquote}>{children.map((child, index) => renderBlock(child, `${key}-${index}`, textStyle, context))}</View>;
    case "codeBlock":
      return <Text key={key} style={styles.codeBlock}>{children.length ? renderInlineChildren(children, `${key}-inline`, textStyle, context) : node.text}</Text>;
    case "image":
      return renderImage(node, key, context);
    case "horizontalRule":
      return <View key={key} style={styles.horizontalRule} />;
    case "hardBreak":
      return <Text key={key}>{"\n"}</Text>;
    default:
      return children.length ? <View key={key}>{children.map((child, index) => renderBlock(child, `${key}-${index}`, textStyle, context))}</View> : node.text ? <Text key={key} style={textStyle}>{node.text}</Text> : null;
  }
}

function renderImage(node: RichTextNode, key: string, context: RenderContext) {
  const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
  if (!src) return null;
  const uri = normalizeImageUri(src);
  const imageIndex = context.images.findIndex((image) => image.uri === uri);
  return <RichTextImage key={key} uri={uri} onPress={() => context.onImagePress(Math.max(imageIndex, 0))} />;
}

function RichTextImage({ uri, onPress }: { uri: string; onPress: () => void }) {
  const [aspectRatio, setAspectRatio] = useState(1.5);
  const [containerWidth, setContainerWidth] = useState(0);
  const height = containerWidth > 0 ? Math.min(containerWidth / aspectRatio, 360) : 220;

  return <Pressable style={[styles.imagePressable, { height }]} accessible={false} focusable={false} onLayout={({ nativeEvent }) => setContainerWidth(nativeEvent.layout.width)} onPress={onPress}><Image source={{ uri }} style={[styles.image, { height }]} resizeMode="contain" onLoad={({ nativeEvent }) => { const { width, height: imageHeight } = nativeEvent.source; if (width > 0 && imageHeight > 0) setAspectRatio(width / imageHeight); }} /></Pressable>;
}

function renderListItem(node: RichTextNode, key: string, marker: string, textStyle: StyleProp<TextStyle> | undefined, context: RenderContext) {
  return <View key={key} style={styles.listItem}><Text style={[styles.marker, textStyle]}>{marker}</Text><View style={styles.listItemContent}>{(node.content ?? []).map((child, index) => renderBlock(child, `${key}-${index}`, textStyle, context))}</View></View>;
}

function renderInlineChildren(children: RichTextNode[], key: string, textStyle: StyleProp<TextStyle> | undefined, context: RenderContext): ReactNode[] {
  return children.flatMap((child, index) => renderInline(child, `${key}-${index}`, textStyle, context));
}

function renderInline(node: RichTextNode, key: string, textStyle: StyleProp<TextStyle> | undefined, context: RenderContext): ReactNode[] {
  if (node.type === "hardBreak") return [<Text key={key}>{"\n"}</Text>];
  if (node.type === "image") return [renderImage(node, key, context)];
  if (node.type !== "text") return renderInlineChildren(node.content ?? [], key, textStyle, context);

  const marks = node.marks ?? [];
  const style = marks.reduce<TextStyle>((result, mark) => {
    switch (mark.type) {
      case "bold": return { ...result, fontWeight: "700" };
      case "italic": return { ...result, fontStyle: "italic" };
      case "underline": return { ...result, textDecorationLine: "underline" };
      case "strike": return { ...result, textDecorationLine: "line-through" };
      case "code": return { ...result, fontFamily: "monospace", backgroundColor: "#EEF1F5" };
      case "link": return { ...result, color: "#1769E0", textDecorationLine: "underline" };
      case "textStyle": {
        const color = mark.attrs?.color;
        return typeof color === "string" ? { ...result, color } : result;
      }
      default: return result;
    }
  }, {});
  const link = marks.find((mark) => mark.type === "link")?.attrs?.href;
  const content = node.text ?? "";
  return [<Text key={key} style={[textStyle, style]} onPress={typeof link === "string" ? () => void Linking.openURL(link) : undefined}>{content}</Text>];
}

function collectImageSources(node: RichTextNode): ImageSource[] {
  const images: ImageSource[] = [];
  const visit = (current: RichTextNode) => {
    if (current.type === "image" && typeof current.attrs?.src === "string" && current.attrs.src) {
      images.push({ uri: normalizeImageUri(current.attrs.src) });
    }
    current.content?.forEach(visit);
  };
  visit(node);
  return images;
}

function normalizeImageUri(src: string) {
  return /^(https?:|data:|blob:)/i.test(src) ? src : normalizeUrl(src);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}

const styles = StyleSheet.create({
  root: { flex: 1, minWidth: 0, gap: 6 },
  paragraphBlock: { gap: 6 },
  paragraph: { color: "#5B667A", lineHeight: 22 },
  heading: { color: "#182338", fontSize: 20, fontWeight: "700", lineHeight: 28, marginVertical: 2 },
  headingSmall: { fontSize: 17, lineHeight: 24 },
  list: { gap: 5 },
  listItem: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  marker: { width: 18, color: "#5B667A", lineHeight: 22 },
  listItemContent: { flex: 1, gap: 4 },
  blockquote: { borderLeftWidth: 3, borderLeftColor: "#B7C8E8", paddingLeft: 12 },
  codeBlock: { backgroundColor: "#F0F2F5", borderRadius: 8, color: "#273142", fontFamily: "monospace", padding: 10 },
  imagePressable: { width: "100%", marginVertical: 4, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  image: { width: "100%" },
  horizontalRule: { borderTopWidth: 1, borderTopColor: "#D9DEE7", marginVertical: 6 },
});

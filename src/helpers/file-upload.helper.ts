import { IFile } from "@/types/file.model";
import { api } from "@/utils/epsApi";

export interface LocalUploadFile {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
}

export type UploadFileValue = IFile | LocalUploadFile;

export function isStoredUploadFile(file: UploadFileValue): file is IFile {
  return "id" in file;
}

export function isUploadFileValue(value: unknown): value is UploadFileValue {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" ||
    (typeof candidate.uri === "string" && typeof candidate.name === "string")
  );
}

export async function fetchFilesByIds(fileIds: readonly string[]): Promise<IFile[]> {
  const uniqueFileIds = [...new Set(fileIds.filter(Boolean))];
  return Promise.all(
    uniqueFileIds.map(async (fileId) => (await api.getFile({ fileId })) as IFile),
  );
}

export function mergeUploadFiles(
  currentFiles: readonly UploadFileValue[],
  incomingFiles: readonly UploadFileValue[],
): UploadFileValue[] {
  const seen = new Set<string>();

  return [...currentFiles, ...incomingFiles].filter((file) => {
    const key = isStoredUploadFile(file) ? `id:${file.id}` : `uri:${file.uri}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function appendUploadFilesToFormData(
  formData: FormData,
  files: readonly UploadFileValue[],
): void {
  let retainedFileIndex = 0;

  for (const file of files) {
    if (isStoredUploadFile(file)) {
      formData.append(`files[${retainedFileIndex}]`, file.id);
      retainedFileIndex += 1;
      continue;
    }

    formData.append(
      "files",
      {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? "application/octet-stream",
      } as any,
    );
  }
}

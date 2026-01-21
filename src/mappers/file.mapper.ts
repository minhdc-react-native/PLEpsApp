import { IFile } from "@/types/file.model";

export function mapFile(schema: any): IFile {
  return {
    id: schema.fileId,
    name: schema.fileName,
    size: schema.size,
    type: schema.contentType,
    path: schema.path,
    uploadedDate: schema.uploadedDate,
    uploadedBy: schema.uploadedByEmployeeName,
  };
}

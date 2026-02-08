import { cn } from "@/lib/utils";
import { CaseAttachment } from "@/types/deathCase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  Image,
  FileCheck,
  FileSearch,
  FileQuestion,
  Download,
  Eye,
  Trash2,
  Plus,
  Upload,
} from "lucide-react";

interface AttachmentGalleryProps {
  attachments: CaseAttachment[];
  section?: "event" | "vet" | "disposal" | "general";
  readOnly?: boolean;
  onUpload?: () => void;
  onView?: (attachment: CaseAttachment) => void;
  onDownload?: (attachment: CaseAttachment) => void;
  onDelete?: (attachmentId: string) => void;
  className?: string;
}

const typeIcons = {
  photo: Image,
  document: FileText,
  certificate: FileCheck,
  lab_report: FileSearch,
  necropsy: FileSearch,
  other: FileQuestion,
};

const typeLabels = {
  photo: "Photo",
  document: "Document",
  certificate: "Certificate",
  lab_report: "Lab Report",
  necropsy: "Necropsy Report",
  other: "Other",
};

const typeColors = {
  photo: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  document: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  certificate: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  lab_report: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  necropsy: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  other: "bg-muted text-muted-foreground border-border",
};

export function AttachmentGallery({
  attachments,
  section,
  readOnly = false,
  onUpload,
  onView,
  onDownload,
  onDelete,
  className,
}: AttachmentGalleryProps) {
  const filteredAttachments = section
    ? attachments.filter((a) => a.section === section)
    : attachments;

  if (filteredAttachments.length === 0 && readOnly) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No attachments</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload button */}
      {!readOnly && onUpload && (
        <Button
          variant="outline"
          onClick={onUpload}
          className="w-full border-dashed"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Attachment
        </Button>
      )}

      {/* Attachments grid */}
      <div className="grid gap-3">
        {filteredAttachments.map((attachment) => {
          const Icon = typeIcons[attachment.type];

          return (
            <div
              key={attachment.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  typeColors[attachment.type].split(" ").slice(0, 1).join(" ")
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    typeColors[attachment.type].split(" ").slice(1, 3).join(" ")
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] px-1.5 py-0 shrink-0", typeColors[attachment.type])}
                  >
                    {typeLabels[attachment.type]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Uploaded by {attachment.uploadedBy}{" "}
                  {formatDistanceToNow(new Date(attachment.uploadedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onView && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(attachment)}
                    className="h-8 w-8"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                {onDownload && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownload(attachment)}
                    className="h-8 w-8"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
                {!readOnly && onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(attachment.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state with upload prompt */}
      {filteredAttachments.length === 0 && !readOnly && (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          onClick={onUpload}
        >
          <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to add attachments
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Photos, documents, certificates
          </p>
        </div>
      )}
    </div>
  );
}

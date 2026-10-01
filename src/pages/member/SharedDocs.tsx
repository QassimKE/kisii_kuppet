import { useEffect, useState } from "react";
import MemberLayout from "@/components/member/MemberLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { memberService } from "@/services/member.service";
import type { SharedDocument } from "@/services/types";

const SharedDocs = () => {
  const [docs, setDocs]       = useState<SharedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memberService.getSharedDocs().then(setDocs).finally(() => setLoading(false));
  }, []);

  const handleDownload = async (doc: SharedDocument) => {
    try {
      await memberService.downloadSharedDoc(doc.filename);
    } catch {
      toast.error("Failed to download document.");
    }
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground">Files shared by the secretariat for your reference.</p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4 text-primary" /> Available Documents ({docs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</p>
            ) : docs.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No documents available.</p>
            ) : (
              <ul className="divide-y divide-border">
                {docs.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-medium text-foreground text-sm">{doc.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.createdAt} · {doc.uploadedBy}</p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => handleDownload(doc)}>
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
};

export default SharedDocs;

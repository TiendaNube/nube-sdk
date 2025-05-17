import { Button } from "@/components/ui/button";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { Loader2 } from "lucide-react";
import { TableRowItem } from "./table-row-item";

interface AppsListProps {
  apps: NubeSDKEvent[];
  selectedApp: NubeSDKEvent | null;
  onSelect: (app: NubeSDKEvent) => void;
  onReload: () => void;
  isLoading: boolean;
}

export function AppsList({
  apps,
  selectedApp,
  onSelect,
  onReload,
  isLoading,
}: AppsListProps) {
  const isDevMode = (script: string) => {
    return script.includes("localhost") || script.includes("127.0.0.1");
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-sm">No apps found</p>
        <Button
          variant="outline"
          size="sm"
          className="h-5 px-2 text-xs"
          onClick={onReload}
        >
          Reload page
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableBody>
        {apps.map((app) => (
          <TableRow key={app.id}>
            <TableRowItem
              isSelected={app.id === selectedApp?.id}
              title={app.data.id}
              badge1={isDevMode(app.data.script) ? "dev mode" : undefined}
              event={app}
              onSelect={onSelect}
            />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

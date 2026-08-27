import { Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SavedScript {
  id: string;
  title: string;
  content: string;
  niche: string | null;
  tone: string | null;
  duration: string | null;
  created_at: string;
}

interface Props {
  items: SavedScript[];
  selectedId: string | null;
  onSelect: (s: SavedScript) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export function HistoryList({ items, selectedId, onSelect, onDelete, loading }: Props) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card/40 p-4">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-foreground">
        <FileText className="h-4 w-4 text-primary" /> Histórico
      </h2>
      <ScrollArea className="flex-1 pr-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum roteiro salvo ainda.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className={`group rounded-lg border p-3 transition-all cursor-pointer ${
                  selectedId === item.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background/40 hover:border-primary/50"
                }`}
                onClick={() => onSelect(item)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.niche ?? "—"} · {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}

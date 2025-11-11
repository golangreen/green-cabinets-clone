import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Lock, Code, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

interface DocSection {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

const docSections: DocSection[] = [
  {
    title: "Getting Started",
    path: ROUTES.DOCS_GETTING_STARTED,
    icon: BookOpen,
    keywords: ["setup", "install", "environment", "database", "schema", "start", "begin"],
  },
  {
    title: "Authentication",
    path: ROUTES.DOCS_AUTH,
    icon: Lock,
    keywords: ["auth", "login", "signup", "user", "role", "security", "session", "jwt"],
  },
  {
    title: "API Reference",
    path: ROUTES.DOCS_API,
    icon: Code,
    keywords: ["api", "edge", "function", "endpoint", "webhook", "checkout", "security"],
  },
  {
    title: "Troubleshooting",
    path: ROUTES.DOCS_TROUBLESHOOTING,
    icon: AlertCircle,
    keywords: ["error", "issue", "problem", "fix", "help", "debug", "troubleshoot", "solution"],
  },
];

export function DocsSidebar() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = docSections.filter((section) => {
    const query = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(query) ||
      section.keywords.some((keyword) => keyword.includes(query))
    );
  });

  return (
    <aside className="w-64 border-r border-border bg-card p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Documentation</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      <nav className="space-y-1">
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <NavLink
                key={section.path}
                to={section.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{section.title}</span>
              </NavLink>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground px-3 py-2">No results found</p>
        )}
      </nav>

      {searchQuery && filteredSections.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground px-3">
            Found {filteredSections.length} {filteredSections.length === 1 ? "page" : "pages"}
          </p>
        </div>
      )}
    </aside>
  );
}

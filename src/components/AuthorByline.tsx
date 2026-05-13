import { Link } from "react-router-dom";
import { AUTHOR_IDS } from "@/data/authors";

const META: Record<keyof typeof AUTHOR_IDS, { name: string; role: string; anchor: string }> = {
  golan: {
    name: "Golan Achdary",
    role: "Founder & Master Cabinetmaker",
    anchor: "#golan-achdary",
  },
  andy: {
    name: "Andy Lopez",
    role: "Project Manager & Installation Lead",
    anchor: "#andy-lopez",
  },
  team: {
    name: "Green Cabinets NY Editorial Team",
    role: "Editorial",
    anchor: "#team",
  },
};

interface AuthorBylineProps {
  author?: keyof typeof AUTHOR_IDS;
  /** ISO date string for the article publish/update date. */
  date?: string;
  /** Override label, e.g. "Updated" instead of "Published". */
  label?: string;
  className?: string;
}

const AuthorByline = ({
  author = "golan",
  date,
  label = "By",
  className = "",
}: AuthorBylineProps) => {
  const meta = META[author];
  const initials = meta.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      className={`flex items-center gap-3 text-sm text-muted-foreground ${className}`}
      itemScope
      itemType="https://schema.org/Person"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
        {initials}
      </div>
      <div className="leading-tight">
        <div>
          <span className="text-muted-foreground">{label} </span>
          <Link
            to={`/about${meta.anchor}`}
            className="font-semibold text-foreground hover:text-primary underline-offset-2 hover:underline"
            itemProp="url"
          >
            <span itemProp="name">{meta.name}</span>
          </Link>
        </div>
        <div className="text-xs">
          <span itemProp="jobTitle">{meta.role}</span>
          {date && (
            <>
              {" · "}
              <time dateTime={date}>
                {new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorByline;

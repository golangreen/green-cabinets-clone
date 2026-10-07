import type { ReactNode } from "react";

/** Page-width section wrapper with the shared gutters and rhythm. */
const Shell = ({
  id,
  labelledBy,
  className = "",
  chapter,
  children,
}: {
  id?: string;
  labelledBy?: string;
  className?: string;
  /** Label for the chapter rail; sections with one become rail stops */
  chapter?: string;
  children: ReactNode;
}) => (
  <section
    id={id}
    aria-labelledby={labelledBy}
    data-chapter={chapter}
    className={`scroll-mt-20 py-24 md:py-36 ${className}`}
  >
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:pr-36">{children}</div>
  </section>
);

export default Shell;

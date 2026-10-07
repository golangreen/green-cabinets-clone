import type { ReactNode } from "react";

/** Page-width section wrapper with the shared gutters and rhythm. */
const Shell = ({
  id,
  labelledBy,
  className = "",
  children,
}: {
  id?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) => (
  <section id={id} aria-labelledby={labelledBy} className={`scroll-mt-20 py-24 md:py-36 ${className}`}>
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">{children}</div>
  </section>
);

export default Shell;

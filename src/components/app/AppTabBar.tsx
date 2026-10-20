import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Box, FileScan, Home, Ruler, ScanLine } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { isApp } from "@/lib/platform";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/ar", label: "AR", icon: Box },
  { to: "/measure", label: "Measure", icon: Ruler },
  { to: "/drawings", label: "Quote", icon: FileScan },
];

/**
 * The app's bottom tabs: the native tools one tap away, the way an iPhone app
 * works. Website only shows on the web; this never renders there.
 */
const AppTabBar = () => {
  const { pathname } = useLocation();

  // Leaves room at the bottom of every page for the bar
  useEffect(() => {
    document.documentElement.classList.add("in-app");
  }, []);

  // A new tab starts at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <nav
      aria-label="App"
      className="lux-material fixed inset-x-0 bottom-0 z-50 border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex max-w-xl">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              onClick={() => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})}
              className={({ isActive }) =>
                `flex min-h-[54px] flex-col items-center justify-center gap-1 font-display text-[0.68rem] tracking-wide transition-colors duration-150 select-none [-webkit-touch-callout:none] [touch-action:manipulation] ${
                  isActive ? "text-brass" : "text-ivory/65"
                }`
              }
            >
              <Icon className="h-[22px] w-[22px]" aria-hidden="true" strokeWidth={1.75} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const AppTabBarInApp = () => (isApp() ? <AppTabBar /> : null);

export default AppTabBarInApp;

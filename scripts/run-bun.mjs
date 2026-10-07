// Runs each TypeScript script with bun. Uses the installed bun when there is
// one (this Mac, Lovable) and the npm copy of bun otherwise (GitHub Actions).
import { execFileSync, spawnSync } from "node:child_process";

const hasBun = spawnSync("bun", ["--version"], { stdio: "ignore" }).status === 0;
const [cmd, pre] = hasBun ? ["bun", []] : ["npx", ["--yes", "bun"]];
for (const script of process.argv.slice(2)) execFileSync(cmd, [...pre, "run", script], { stdio: "inherit" });

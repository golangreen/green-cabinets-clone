import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { spawnSync } from "node:child_process";
import { componentTagger } from "lovable-tagger";

// Runs the LocalBusiness JSON-LD validator at build start. Fails the build on errors.
function validateJsonLdPlugin(): Plugin {
  return {
    name: "validate-localbusiness-jsonld",
    apply: "build",
    buildStart() {
      const result = spawnSync(
        process.execPath,
        [path.resolve(__dirname, "scripts/validate-localbusiness-jsonld.mjs")],
        { stdio: "inherit" }
      );
      if (result.status !== 0) {
        this.error("LocalBusiness JSON-LD validation failed — aborting build.");
      }
    },
  };
}

function earlyModuleLoadRecoveryPlugin(): Plugin {
  const recoveryScript = String.raw`
(function(){
  var FLAG="__gc_module_reload_count__";
  var TS="__gc_module_reload_ts__";
  var WINDOW_MS=30000;
  var MAX=2;
  var MODULE_RE=/Importing a module script failed|Failed to fetch dynamically imported module|ChunkLoadError|Loading chunk [\d]+ failed|Outdated Optimize Dep/i;
  var URL_RE=/\/node_modules\/\.vite\/deps\/|\/assets\/.*\.(?:js|css)(?:\?|$)/i;
  function n(k){try{return Number(sessionStorage.getItem(k)||"0")||0}catch(e){return 0}}
  function s(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
  function isModuleFailure(e){
    var t=e&&e.target;
    var targetUrl=t&&(t.src||t.href)||"";
    var msg=[e&&e.message,e&&e.filename,e&&e.error&&e.error.message,targetUrl,String(e&&e.reason&&e.reason.message||e&&e.reason||"")].filter(Boolean).join(" ");
    return MODULE_RE.test(msg)||URL_RE.test(msg);
  }
  function clearCaches(){
    var tasks=[];
    if("serviceWorker" in navigator)tasks.push(navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.allSettled(rs.map(function(r){return r.unregister()}))}));
    if("caches" in window)tasks.push(caches.keys().then(function(keys){return Promise.allSettled(keys.map(function(k){return caches.delete(k)}))}));
    return Promise.allSettled(tasks);
  }
  function recover(reason){
    var now=Date.now();
    var last=n(TS);
    var count=last&&now-last<WINDOW_MS?n(FLAG):0;
    if(count>=MAX)return;
    s(FLAG,String(count+1));s(TS,String(now));
    var u=new URL(location.href);u.searchParams.set("_r",now.toString(36));
    var done=false;function go(){if(done)return;done=true;location.replace(u.toString())}
    setTimeout(go,600);clearCaches().finally(go);
  }
  addEventListener("error",function(e){if(isModuleFailure(e))recover("module error")},true);
  addEventListener("unhandledrejection",function(e){if(isModuleFailure(e))recover("module rejection")});
  addEventListener("load",function(){setTimeout(function(){try{sessionStorage.removeItem(FLAG);sessionStorage.removeItem(TS)}catch(e){}},6000)});
})();`;

  return {
    name: "early-module-load-recovery",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          attrs: { type: "text/javascript" },
          children: recoveryScript,
          injectTo: "head-prepend",
        },
      ];
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  optimizeDeps: {
    include: [
      "@radix-ui/react-tooltip",
      "@supabase/supabase-js",
      "@tanstack/react-query",
      "lucide-react",
      "react",
      "react-dom/client",
      "react/jsx-dev-runtime",
      "react-router-dom",
    ],
  },
  plugins: [
    earlyModuleLoadRecoveryPlugin(),
    validateJsonLdPlugin(),
    react(), 
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor splitting for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['zustand', '@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));

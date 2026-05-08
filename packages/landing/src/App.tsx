import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Home } from "./pages/Home";
import { Docs } from "./pages/Docs";
import { Roadmap } from "./pages/Roadmap";
import "./index.css";

type DocsTarget = {
  id: string;
  label: string;
  kind: "channel" | "version";
  path: string;
  version?: string | null;
};

type DocsIndex = {
  defaultTarget?: string;
  targets?: DocsTarget[];
};

function normalizePathFragment(input: string): string {
  const noLeading = input.replace(/^\/+/, "");
  return noLeading.endsWith("/") ? noLeading : `${noLeading}/`;
}

function getSiteRoot(baseUrl: string): string {
  const normalized = normalizePathFragment(baseUrl);
  const match = `/${normalized}`.match(
    /^(.*\/)(?:channels|versions)\/[^/]+\/$/,
  );
  if (match?.[1]) {
    return match[1];
  }
  return `/${normalized}`;
}

function extractActiveTarget(baseUrl: string, pathname: string): string | null {
  const base = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;
  const withoutBase = pathname.startsWith(base)
    ? pathname.slice(base.length)
    : pathname;

  const candidate = withoutBase.startsWith("/")
    ? withoutBase.slice(1)
    : withoutBase;
  if (!candidate) {
    return null;
  }

  const parts = candidate.split("/").filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  if (parts[0] === "channels") {
    return `channel:${parts[1]}`;
  }

  if (parts[0] === "versions") {
    return `version:${parts[1]}`;
  }

  return null;
}

function DocsVersionSelector() {
  const [targets, setTargets] = useState<DocsTarget[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");
  const base = import.meta.env.BASE_URL;
  const siteRoot = getSiteRoot(base);

  useEffect(() => {
    let cancelled = false;
    const metadataUrl = `${siteRoot}versions.json`;

    fetch(metadataUrl, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unable to load version metadata");
        }
        return res.json() as Promise<DocsIndex>;
      })
      .then((payload) => {
        if (cancelled) {
          return;
        }

        const sortedTargets = Array.isArray(payload.targets)
          ? payload.targets
          : [];
        setTargets(sortedTargets);

        const detected = extractActiveTarget(
          siteRoot,
          window.location.pathname,
        );
        if (detected) {
          setActiveKey(detected);
          return;
        }

        if (payload.defaultTarget) {
          const fallback = sortedTargets.find(
            (item) =>
              normalizePathFragment(item.path) ===
              normalizePathFragment(payload.defaultTarget || ""),
          );
          if (fallback) {
            setActiveKey(`${fallback.kind}:${fallback.id}`);
            return;
          }
        }

        if (sortedTargets[0]) {
          setActiveKey(`${sortedTargets[0].kind}:${sortedTargets[0].id}`);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTargets([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [siteRoot]);

  const options = useMemo(() => {
    return targets.map((target) => {
      const key = `${target.kind}:${target.id}`;
      const suffix =
        target.kind === "channel" && target.version
          ? ` (${target.version})`
          : "";
      return {
        key,
        path: normalizePathFragment(target.path),
        label: `${target.label}${suffix}`,
      };
    });
  }, [targets]);

  if (options.length === 0) {
    return null;
  }

  return (
    <select
      value={activeKey}
      onChange={(event) => {
        const selected = options.find(
          (option) => option.key === event.target.value,
        );
        if (!selected) {
          return;
        }

        setActiveKey(event.target.value);
        window.location.assign(`${siteRoot}${selected.path}`);
      }}
      className="rounded-lg border border-white/20 bg-black/60 px-3 py-2 text-xs font-semibold tracking-wide text-gray-200"
      aria-label="Switch docs version"
    >
      {options.map((option) => (
        <option key={option.key} value={option.key}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-[#050505] text-white">
        <nav className="fixed top-0 left-0 right-0 z-1000 bg-black/60 backdrop-blur-2xl border-b border-white/5">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l9 4.9V17.1L12 22l-9-4.9V6.9L12 2z" />
                </svg>
              </div>
              OmniCAD
            </Link>

            <ul className="hidden md:flex items-center gap-8">
              <li>
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/docs"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  to="/roadmap"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Roadmap
                </Link>
              </li>
              <li>
                <DocsVersionSelector />
              </li>
              <li>
                <a
                  href="https://github.com/el-j/omni-cad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link
                  to="/docs"
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all"
                >
                  Install →
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/roadmap" element={<Roadmap />} />
          </Routes>
        </main>

        <footer className="py-20 border-t border-white/5 bg-black">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <span className="font-bold text-lg tracking-tight">OmniCAD</span>
              <div className="hidden md:block w-px h-4 bg-white/10" />
              <span className="text-sm text-gray-500 font-medium">
                MIT License · Built with ❤️ for the CAD community
              </span>
            </div>

            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to="/docs"
                className="text-sm text-blue-400 hover:text-white transition-colors font-semibold"
              >
                Docs
              </Link>
              <Link
                to="/roadmap"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Roadmap
              </Link>
              <a
                href="https://github.com/el-j/omni-cad"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

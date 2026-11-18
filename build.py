#!/usr/bin/env python3
"""Bundle the .js source modules + style.css into a single self-contained index.html.

Portable: derives the source directory from this file's location, so it runs anywhere.
Works in two modes:

  (1) If a dev template index.html sits next to this script (with <script src="x.js">
      and <link rel="stylesheet" href="style.css"> tags), it inlines those in order.
  (2) Otherwise it builds from the explicit SCRIPTS list below — the canonical load order
      the app depends on (later modules override earlier ones where intended).

Usage:
  python build.py                 # writes ./index.html (bundle)
  python build.py --out dist.html
  python build.py --deploy        # keep config.js as an external <script src> (for GitHub upload)
  python build.py --src-dir /path/to/sources --out index.html
"""
import re, os, sys

# Canonical module load order. crypto.js must load before share.js (which uses FC).
# config.js is intentionally last and is kept external in --deploy mode (the user fills it in).
SCRIPTS = [
    "iconpaths.js", "engine.js", "icon-folder.js", "bgimages.js", "intro.js",
    "org.js", "view.js", "dan.js", "dan2.js", "app.js", "tools.js", "dan3.js",
    "reading.js", "crypto.js", "share.js", "lang.js", "catform.js", "toolart.js",
    "pgbreak.js", "pgscroll.js",
]

HERE = os.path.dirname(os.path.abspath(__file__))

def parse_args(argv):
    src_dir = HERE
    out = os.path.join(HERE, "index.html")
    deploy = False
    i = 1
    while i < len(argv):
        a = argv[i]
        if a == "--deploy":
            deploy = True
        elif a == "--src-dir" and i + 1 < len(argv):
            src_dir = argv[i + 1]; i += 1
        elif a == "--out" and i + 1 < len(argv):
            out = argv[i + 1]; i += 1
        elif a in ("-h", "--help"):
            print(__doc__); sys.exit(0)
        else:
            print("Unknown argument:", a, file=sys.stderr); sys.exit(2)
        i += 1
    return src_dir, out, deploy

def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

def main():
    src_dir, out, deploy = parse_args(sys.argv)
    dev_template = os.path.join(src_dir, "index-dev.html")
    if os.path.exists(dev_template):
        # Mode 1: use the dev template's <script src>/<link href> order.
        h = read(dev_template)
        h = re.sub(r'<link rel="stylesheet" href="([^"]+)"[^>]*>',
                   lambda m: "<style>" + read(os.path.join(src_dir, m.group(1))) + "</style>", h)
        h = re.sub(r'<script src="([^"]+)"></script>',
                   lambda m: (m.group(0) if (m.group(1) == "config.js" and deploy)
                             else "<script>" + read(os.path.join(src_dir, m.group(1))).replace("</script", "<\\/script") + "</script>"), h)
    else:
        # Mode 2: build from the explicit SCRIPTS list. Requires a bare HTML shell
        # (head with style.css inlined + <div id="phone">…</div> body) to exist in index.html.
        # We reuse the already-bundled index.html as the shell template if present, by
        # stripping its inline <script> blocks and re-injecting from sources. If the shell
        # does not exist, we build a minimal one.
        shell_path = os.path.join(src_dir, "index.html")
        if os.path.exists(shell_path):
            shell = read(shell_path)
            # strip all inline <script>…</script> blocks (keep nothing between them)
            shell = re.sub(r'<script>.*?</script>', '', shell, flags=re.DOTALL)
            # also drop any leftover external config script tag (we re-add below)
            shell = re.sub(r'<script src="config\.js"></script>', '', shell)
        else:
            css = read(os.path.join(src_dir, "style.css"))
            shell = ("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">"
                     "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">"
                     "<title>All documents reader</title><style>" + css + "</style></head>"
                     "<body><div id=\"phone\"></div></body></html>")
        parts = []
        # config.js MUST load BEFORE the module scripts: share.js reads window.FWD_CONFIG
        # at parse time (var FWDC=window.FWD_CONFIG||{}). If config loads after, FWDC is
        # empty and contactEmail/feedbackEndpoint/siteUrl/privacyUrl/storeUrl all fall back
        # to placeholders. In --deploy mode it stays an external <script src> (user-editable
        # on GitHub); otherwise it is inlined.
        if deploy:
            parts.append('<script src="config.js"></script>')
        else:
            parts.append("<script>" + read(os.path.join(src_dir, "config.js")).replace("</script", "<\\/script") + "</script>")
        for fn in SCRIPTS:
            parts.append("<script>" + read(os.path.join(src_dir, fn)).replace("</script", "<\\/script") + "</script>")
        # IconFolder init (was inlined as the 20th block in the original bundle)
        parts.append("<script>if(window.IconFolder)IconFolder.observe(document.getElementById('phone'));"
                     "window.dispatchEvent(new Event('DOMContentLoaded'));</script>")
        # insert before </body>
        shell = shell.replace("</body>", "".join(parts) + "</body>")
        h = shell
    os.makedirs(os.path.dirname(os.path.abspath(out)) or ".", exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(h)
    print("Wrote", out, "(" + str(len(h)) + " bytes)")

if __name__ == "__main__":
    main()

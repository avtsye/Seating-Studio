from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
CSS = ROOT / "src" / "styles.css"
APP = ROOT / "src" / "app.js"
OUT = ROOT / "dist" / "Seating-Studio.html"

MODULES = [
    ("assignment_priority", ROOT / "src" / "assignment-priority.js"),
    ("seat_overlays", ROOT / "src" / "seat-overlays.js"),
    ("assignment_store", ROOT / "src" / "assignment-store.js"),
    ("workspace", ROOT / "src" / "workspace.js"),
    ("hall_layout", ROOT / "src" / "hall-layout.js"),
]

IMPORT_RE = re.compile(r"^import\s*\{([^}]+)\}\s*from\s*['\"]([^'\"]+)['\"];?\s*$", re.M)
EXPORT_NAME_RE = re.compile(r"export\s+(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)")

def wrap_module(name: str, path: Path) -> tuple[str, list[str]]:
    source = path.read_text(encoding="utf-8")
    exports = EXPORT_NAME_RE.findall(source)
    source = re.sub(r"\bexport\s+(?=(?:async\s+)?(?:function|const|let|var|class)\b)", "", source)
    body = "\n".join("  " + line for line in source.splitlines())
    returned = ", ".join(exports)
    return f"const __bundle_{name} = (() => {{\n{body}\n  return {{{returned}}};\n}})();", exports

def main():
    html = INDEX.read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")

    wrapped = []
    module_lookup = {}
    for name, path in MODULES:
        block, exports = wrap_module(name, path)
        wrapped.append(block)
        module_lookup["./" + path.name] = (name, exports)

    def replace_import(match):
        names = [x.strip() for x in match.group(1).split(",") if x.strip()]
        spec = match.group(2)
        if spec not in module_lookup:
            raise SystemExit(f"Unsupported import in single-file build: {spec}")
        module_name, exports = module_lookup[spec]
        missing = [n for n in names if n not in exports]
        if missing:
            raise SystemExit(f"Missing exports in {spec}: {missing}")
        return f"const {{{', '.join(names)}}} = __bundle_{module_name};"

    app = IMPORT_RE.sub(replace_import, app)
    if re.search(r"^import\s", app, re.M):
        raise SystemExit("Unresolved imports remain in app.js")

    bundle = "\n\n".join(wrapped) + "\n\n" + app
    html = re.sub(
        r'<link\s+rel="stylesheet"\s+href="src/styles\.css"\s*/?>',
        "<style>\n" + css + "\n</style>",
        html,
        count=1,
    )
    html = html.replace(
        '<script type="module" src="src/app.js"></script>',
        '<script type="module">\n' + bundle + '\n</script>',
    )

    if 'src/styles.css' in html or 'src/app.js' in html:
        raise SystemExit("External app assets remain in generated HTML")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"Built {OUT} ({OUT.stat().st_size:,} bytes)")

if __name__ == "__main__":
    main()

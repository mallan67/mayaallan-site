#!/usr/bin/env bash
set -euo pipefail

# target directories
dirs=(src/app app)

echo "Scanning for files that use desc(...) and ensuring drizzle-orm import includes desc..."

# find code files
files=$(find "${dirs[@]}" -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null || true)

for f in $files; do
  # skip non-existent
  [ -f "$f" ] || continue

  # does file use desc(...) ?
  if grep -q "desc\s*(" "$f"; then
    # does file already import desc from drizzle-orm?
    if grep -qP 'import\s+\{[^}]*\bdesc\b[^}]*\}\s+from\s+["'"'"']drizzle-orm["'"'"']' "$f"; then
      echo "OK: $f already imports desc"
      continue
    fi

    # file uses desc but may import other helpers from drizzle-orm
    if grep -qP 'from\s+["'"'"']drizzle-orm["'"'"']' "$f"; then
      echo "Patching existing drizzle-orm import in $f"
      # add desc into the braces of the drizzle-orm import safely
      perl -0777 -pi -e '
        s/import\s+\{([^}]*)\}\s+from\s+([\"\x27]drizzle-orm[\"\x27])/ do { 
          $s=$1; $s2=$s; $s2=~s/^\s+|\s+$//g; $items=join(", ", map { $_=~s/^\s+|\s+$//g; $_ } split(/,/, $s2)); 
          unless($items =~ /(^|,)\s*desc\s*(,|$)/) { $items .= ", desc"; } 
          "import { $items } from $2"; 
        } /ges' "$f"
      # sanity: if multiple imports lines exist, this will update first occurrence
    else
      # no drizzle-orm import at all — prepend import at top
      echo "Prepending import in $f"
      sed -i "1s;^;import { desc } from \"drizzle-orm\";\n;" "$f"
    fi
  fi
done

echo "Done scanning and patching files."

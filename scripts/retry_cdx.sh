#!/bin/bash
# Task 1 route C: Wayback CDX via Jina proxy + Google cache/Docs viewer attempts
cd /home/z/my-project/scripts/kom-resources-raw
for name in KomLexicon Kom_Grammar kom_shultz1993_1794_p kom_jones1997_2228_p 1.2_Kom_rev_shell.pub_1_; do
  echo "=== $name ==="
  curl -s -m 40 "https://web.archive.org/cdx/search/cdx?url=sil.org/system/files/reapdata/*&filter=original:.*${name}.*&limit=5&output=json" -o "cdx_${name}.json" 2>/dev/null
  s=$?
  echo "direct-curl exit=$s size=$(stat -c%s "cdx_${name}.json" 2>/dev/null || echo 0)"
done

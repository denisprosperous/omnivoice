#!/bin/bash
# OMNIVOICE v4.2 Task 1 — retry Cloudflare-gated SIL PDFs via alternate routes
cd /home/z/my-project/scripts/kom-resources-raw
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

declare -A PDFS=(
  [KomLexicon]="61/13/74/61137409511288881581803410609212027167/KomLexicon.pdf"
  [Kom_Grammar]="70/11/93/7011935867147439892802585576980500892/Kom_Grammar.pdf"
  [kom_phonology]="32/94/23/32942327881415475472444520483607967340/kom_shultz1993_1794_p.pdf"
  [kom_np_tone]="79/91/13/79911340577816881744323096848109557107/kom_jones1997_2228_p.pdf"
  [sweet_nectar_12]="81/25/24/8125246504201604420882648882628783545/1.2_Kom_rev_shell.pub_1_.pdf"
)

for name in "${!PDFS[@]}"; do
  path="${PDFS[$name]}"
  base="${path##*/}"
  # Route A: silcam.org mirror (hosts same archive records)
  code=$(curl -sL -A "$UA" -m 25 -o "try_${name}_silcam.bin" -w "%{http_code}" "https://www.silcam.org/system/files/reapdata/${path}" 2>/dev/null)
  echo "silcam  $name -> HTTP $code  $(file -b "try_${name}_silcam.bin" | cut -c1-40)"
  # Route B: sil.org direct with browser UA
  code=$(curl -sL -A "$UA" -m 25 -o "try_${name}_silorg.bin" -w "%{http_code}" "https://www.sil.org/system/files/reapdata/${path}" 2>/dev/null)
  echo "silorg  $name -> HTTP $code  $(file -b "try_${name}_silorg.bin" | cut -c1-40)"
done

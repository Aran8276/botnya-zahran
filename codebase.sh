OUTPUT_FILE="tree.txt"
> "$OUTPUT_FILE"

first_entry=true

find . -type d \( \
    -path "./node_modules" -o \
    -path "./.git" -o \
    -path "./.pnp" -o \
    -path "./coverage" -o \
    -path "./.next" -o \
    -path "./src/generated" -o \
    -path "./out" -o \
    -path "./build" -o \
    -path "./.vercel" -o \
    \( -path "./.yarn/*" ! -path "./.yarn/patches*" ! -path "./.yarn/plugins*" ! -path "./.yarn/releases*" ! -path "./.yarn/versions*" \) \
\) -prune -o -type f \
    ! -name ".pnp.*" \
    ! -name ".DS_Store" \
    ! -name "*.pem" \
    ! -name "npm-debug.log*" \
    ! -name "yarn-debug.log*" \
    ! -name "yarn-error.log*" \
    ! -name ".pnpm-debug.log*" \
    ! -name ".env" \
    ! -name "tree" \
    ! -name "*.tsbuildinfo" \
    ! -name "next-env.d.ts" \
    -print0 |
while IFS= read -r -d '' file; do
    if file -b --mime "$file" | grep -q 'charset=binary'; then
        continue
    fi

    if [ "$first_entry" = true ]; then
        first_entry=false
    else
        printf '```' >> "$OUTPUT_FILE"
    fi

    content=$(<"$file")
    content_oneline=$(echo "$content" | tr -d '\n' | tr -s ' ' ' ')
    
    printf '%s %s' "$file" "$content_oneline" >> "$OUTPUT_FILE"
done

echo "Success!"
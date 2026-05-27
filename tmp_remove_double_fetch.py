import re, glob

pages = glob.glob('src/pages/**/*.tsx', recursive=True)
fixed = 0

for path in pages:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Only process files with the double-fetch pattern
    if 'setQueryFields' not in content or 'createAPI' not in content:
        continue
    
    # Pattern 1: Remove the queryFields state + useEffect in the outer component
    # Match: const [queryFields, setQueryFields] = React.useState<string[] | undefined>(undefined)
    # + React.useEffect(() => { createAPI... } }, [])
    
    # Remove queryFields state declaration
    new_content = re.sub(
        r"  const \[queryFields, setQueryFields\] = React\.useState<string\[\] \| undefined>\(undefined\)\n",
        '',
        content
    )
    
    # Remove the createAPI useEffect block (various formats)
    # Pattern: React.useEffect(() => {\n    createAPI({ resource: `core/t/schema/${...}` }).fetch('')\n      .then...\n  }, [])
    new_content = re.sub(
        r"\n  React\.useEffect\(\(\) => \{\n    createAPI\(\{ resource: `core/t/schema/\$\{encodeURIComponent\(tableId\)\}`\} \)\.fetch\(''\)\n      \.then\(\(res: any\) => \{\n        const schema = res\?\.\w+\?\.schema \|\| res\?\.\w+ \|\| res\?\.schema \|\| res\n        if \(schema\?\.properties\) \{\n          setQueryFields\(Object\.keys\(schema\.properties\)\)\n        \}\n      \}\)\n  \}, \[\]\)\n",
        '',
        new_content
    )
    
    # Remove queryFields prop from ViewModel
    new_content = re.sub(
        r' queryFields=\{queryFields\}',
        '',
        new_content
    )
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        fixed += 1
        print(f"Fixed: {path}")

print(f"\nTotal fixed: {fixed} files")

import os

output_file = "all_code.txt"
extensions = ('.py', '.js', '.html', '.css', '.ts')  # adjust as needed

with open(output_file, 'w', encoding='utf-8') as out:
    for root, dirs, files in os.walk('.'):
        for fname in files:
            if fname.endswith(extensions):
                fpath = os.path.join(root, fname)
                out.write(f"\n{'='*50}\n{fpath}\n{'='*50}\n")
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                    out.write(f.read())
                out.write('\n')
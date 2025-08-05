import os

def print_tree(startpath, file):
    for root, dirs, files in os.walk(startpath):
        level = root.replace(startpath, '').count(os.sep)
        indent = '    ' * level
        file.write(f'{indent}📁 {os.path.basename(root)}\n')
        subindent = '    ' * (level + 1)
        for f in files:
            file.write(f'{subindent}📄 {f}\n')

with open('structure.txt', 'w', encoding='utf-8') as f:
    print_tree('.', f)

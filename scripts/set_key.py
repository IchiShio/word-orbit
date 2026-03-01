import getpass, pathlib, os
key = getpass.getpass("Paste API key: ")
p = pathlib.Path(__file__).parent.parent / ".env.local"
p.write_text(f"ANTHROPIC_API_KEY={key.strip()}\n")
os.chmod(p, 0o600)
print("done")

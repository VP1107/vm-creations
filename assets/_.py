from PIL import Image
import os

files = ["babybloom-screenshot.png", "manan-shah-screenshot.png"]

for f in files:
    if os.path.exists(f):
        try:
            img = Image.open(f)
            output_name = f.replace(".png", ".webp")
            img.save(output_name, "WEBP", quality=85)
            print(f"Converted {f} to {output_name}")
        except Exception as e:
            print(f"Failed to convert {f}: {e}")
    else:
        print(f"File not found: {f}")

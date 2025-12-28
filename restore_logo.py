
from PIL import Image
import os
import shutil

# Paths
input_image_path = r"C:/Users/Carol/.gemini/antigravity/brain/5515c4d0-0d54-4eeb-bb7a-5981dddc2e8f/uploaded_image_1766900553193.png"
output_path = r"public/logo_cryptofolio_defi.png"

def replace_logo():
    try:
        # Open the uploaded image to ensure it's valid and optionally resize if it's huge
        with Image.open(input_image_path) as img:
            # We'll save it as PNG. If it's massive, we could resize, but let's stick to original quality 
            # unless it's absurdly large (e.g. > 2000px width for a web logo).
            # Let's verify width.
            width, height = img.size
            print(f"Original size: {width}x{height}")
            
            if width > 1000:
                 # Resize to max width 1000 to keep file size reasonable for web, maintaining aspect ratio
                 ratio = 1000 / width
                 new_height = int(height * ratio)
                 img = img.resize((1000, new_height), Image.Resampling.LANCZOS)
                 print(f"Resized to: {1000}x{new_height}")

            img.save(output_path, "PNG")
            print(f"Successfully replaced {output_path}")

    except Exception as e:
        print(f"Error replacing logo: {e}")

if __name__ == "__main__":
    replace_logo()

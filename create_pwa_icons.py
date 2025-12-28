
from PIL import Image
import os

# Paths
input_image_path = r"C:/Users/Carol/.gemini/antigravity/brain/5515c4d0-0d54-4eeb-bb7a-5981dddc2e8f/uploaded_image_1766899869134.png"
output_dir = r"public"

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

def create_icon(size, filename):
    try:
        with Image.open(input_image_path) as img:
            # Resize image with LANCZOS resampling (high quality)
            img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
            output_path = os.path.join(output_dir, filename)
            img_resized.save(output_path, "PNG")
            print(f"Created {output_path} ({size}x{size})")
    except Exception as e:
        print(f"Error creating {filename}: {e}")

if __name__ == "__main__":
    create_icon(192, "pwa-icon-192.png")
    create_icon(512, "pwa-icon-512.png")

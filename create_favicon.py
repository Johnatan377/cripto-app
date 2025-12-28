
from PIL import Image
import os

# Paths
input_image_path = r"C:/Users/Carol/.gemini/antigravity/brain/5515c4d0-0d54-4eeb-bb7a-5981dddc2e8f/uploaded_image_1766899869134.png"
output_path = r"public/favicon.ico"

def create_favicon():
    try:
        with Image.open(input_image_path) as img:
            # Resize to standard favicon sizes
            img.save(output_path, format='ICO', sizes=[(32, 32), (16, 16), (48, 48), (64, 64)])
            print(f"Successfully replaced {output_path}")

    except Exception as e:
        print(f"Error creating favicon: {e}")

if __name__ == "__main__":
    create_favicon()

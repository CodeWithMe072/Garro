from PIL import Image
import os

def compile_to_pdf(folder, output_pdf):
    files = sorted([f for f in os.listdir(folder) if f.startswith("page_")])
    if not files:
        print("No files found to compile.")
        return
        
    images = []
    first_img = Image.open(os.path.join(folder, files[0])).convert("RGB")
    
    for file in files[1:]:
        img = Image.open(os.path.join(folder, file)).convert("RGB")
        images.append(img)
        
    first_img.save(output_pdf, save_all=True, append_images=images)
    print(f"\n[🎉] PDF successfully generated: {output_pdf}")

compile_to_pdf("captured_pages", "final_document.pdf")
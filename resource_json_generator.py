import os
import json
from datetime import datetime

def determine_thumbnail_and_type(filename, link):
    """Determine thumbnail and type based on filename or link."""
    if link.startswith(('http', 'https')):
        if "youtube" in link or "youtu.be" in link:
            return "fas fa-youtube", "Link"
        elif "github" in link or "gitlab" in link:
            return "fas fa-code", "Link"
        elif "colab" in link:
            return "fas fa-play-circle", "Link"
        else:
            return "fas fa-link", "Link"
    elif filename.endswith(".pdf"):
        if any(keyword in filename.lower() for keyword in ["book", "guide", "notes"]):
            return "fas fa-book", "PDF"
        else:
            return "fas fa-file-pdf", "PDF"
    elif filename.endswith((".png", ".jpg")):
        return "fas fa-file-image", "Image"
    return "fas fa-file", "Unknown"  # Default fallback

def generate_resources_json(resources_dir):
    resources = []
    current_date = datetime.now().isoformat()  # Current date and time (e.g., 2025-07-01T21:17:00Z)
    
    for filename in os.listdir(resources_dir):
        if filename.endswith((".pdf", ".png", ".jpg")) or filename == "links.txt":
            if filename == "links.txt":
                with open(os.path.join(resources_dir, filename), "r", encoding="utf-8") as f:
                    links = [line.strip().split("|") for line in f if "|" in line]
                    for title, url, desc in links:
                        thumbnail, resource_type = determine_thumbnail_and_type(filename, url)
                        resources.append({
                            "thumbnail": thumbnail,
                            "title": title.strip(),
                            "desc": desc.strip() if desc else f"{resource_type} resource: {title}",
                            "link": url.strip(),
                            "type": resource_type if resource_type != "Unknown" else None,
                            "date": current_date,  # Default to current date, manually adjustable
                            "tags": []  # Empty tags, manually editable
                        })
            else:
                # Generate title from filename (remove extension and format)
                title = filename.replace("-", " ").replace(".", " ").title().rsplit(" ", 1)[0]
                thumbnail, file_type = determine_thumbnail_and_type(filename, f"resources/{filename}")
                desc = f"{file_type} resource: {title}"
                resources.append({
                    "thumbnail": thumbnail,
                    "title": title,
                    "desc": desc,
                    "link": f"resources/{filename}",
                    "type": file_type if file_type != "Unknown" else None,
                    "date": current_date, 
                    "tags": []  
                })
    
    # Write to resources.json
    with open("data/resources.json", "w", encoding="utf-8") as f:
        json.dump(resources, f, indent=2)
    print(f"✅ resources.json generated at: data/resources.json")

if __name__ == "__main__":
    generate_resources_json("resources")
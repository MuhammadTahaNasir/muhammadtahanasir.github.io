import os
import json

def generate_resources_json(resources_dir):
  resources = []
  for filename in os.listdir(resources_dir):
    if filename.endswith((".pdf", ".png", ".jpg")):
      title = filename.replace("-", " ").replace(".", " ").title().rsplit(" ", 1)[0]
      file_type = "PDF" if filename.endswith(".pdf") else "Image"
      thumbnail = "fas fa-file-pdf" if file_type == "PDF" else "fas fa-file-image"
      resources.append({
        "title": title,
        "type": file_type,
        "thumbnail": thumbnail,
        "link": f"resources/{filename}",
        "desc": f"{file_type} resource: {title}",
        "tags": []
      })
  with open("data/resources.json", "w", encoding="utf-8") as f:
    json.dump(resources, f, indent=2)
  print(f"✅ resources.json generated at: data/resources.json")

if __name__ == "__main__":
  generate_resources_json("resources")
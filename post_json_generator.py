import os
import json
from bs4 import BeautifulSoup
from datetime import datetime
import shutil

def calculate_read_time(content):
    if content is None:
        return "0 min"
    text = ""
    for element in content.find_all(['p', 'li', 'h2'], recursive=True):
        text += element.get_text() + " "
    words = len(text.split())
    minutes = max(1, (words + 199) // 200)
    return f"{minutes} min"

def is_html_file_valid(path):
    return os.path.isfile(path) and path.endswith(".html") and not path.endswith("posts.html")

def get_all_html_files(posts_dir):
    all_files = []
    for root, _, files in os.walk(posts_dir):
        for f in files:
            full_path = os.path.join(root, f)
            if is_html_file_valid(full_path):
                all_files.append(full_path)
    return all_files

def generate_posts_json(posts_dir):
    post_entries = []
    current_time = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    all_html_files = get_all_html_files(posts_dir)

    for file_path in all_html_files:
        filename = os.path.basename(file_path)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            soup = BeautifulSoup(content, "html.parser")
            title = soup.title.string.strip() if soup.title and soup.title.string else filename.replace(".html", "").replace("-", " ").title()
            meta = soup.find("meta", attrs={"name": "description"})
            summary = meta["content"] if meta and "content" in meta.attrs else "No summary available."
            thumbnail = soup.find("meta", attrs={"name": "thumbnail"})
            thumbnail_url = thumbnail["content"] if thumbnail and "content" in thumbnail.attrs else ""
            tags_meta = soup.find("meta", attrs={"name": "tags"})
            tags = [tag.strip() for tag in tags_meta["content"].split(",")] if tags_meta and "content" in tags_meta.attrs else []
            author = "Muhammad Taha Nasir"

            body = soup.find("body")
            custom_date = body.get("post-date", current_time) if body else current_time
            try:
                post_date = datetime.strptime(custom_date, "%Y-%m-%dT%H:%M:%SZ")
            except ValueError:
                post_date = datetime.strptime(current_time, "%Y-%m-%dT%H:%M:%SZ")

            year = str(post_date.year)
            year_folder = os.path.join(posts_dir, year)
            os.makedirs(year_folder, exist_ok=True)

            new_path = os.path.join(year_folder, filename)

            if os.path.abspath(file_path) != os.path.abspath(new_path):
                # Copy file to year folder
                shutil.copy2(file_path, new_path)
                # Delete original file
                os.remove(file_path)
                print(f"📁 Moved '{filename}' to year folder: {year}/")

            main_content = soup.find("main") or body or soup
            post_entries.append({
                "title": title,
                "summary": summary,
                "url": f"posts/{year}/{filename}",
                "thumbnail": thumbnail_url,
                "tags": tags,
                "author": author,
                "time": calculate_read_time(main_content),
                "date": post_date.strftime("%Y-%m-%dT%H:%M:%SZ")
            })

        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")
            continue

    post_entries.sort(key=lambda x: x["date"], reverse=True)

    output_path = os.path.join(posts_dir, "posts.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(post_entries, f, indent=2, ensure_ascii=False)

    print(f"\n✅ posts.json successfully generated at: {output_path}")

if __name__ == "__main__":
    posts_folder = os.path.join(os.path.dirname(__file__), "posts")
    generate_posts_json(posts_folder)

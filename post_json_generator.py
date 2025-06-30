import os
import json
from bs4 import BeautifulSoup
from datetime import datetime

def calculate_read_time(content):
    """Calculate read time based on word count (200 words per minute) from full content."""
    if content is None:
        return "0 min"  # Return 0 min if no content is found
    # Extract text from paragraphs, lists, and headings
    text = ""
    for element in content.find_all(['p', 'li', 'h2'], recursive=True):
        text += element.get_text() + " "
    words = len(text.split())
    minutes = max(0, (words + 199) // 200)  # Ceiling division to avoid 0 for small content
    return f"{minutes} min"

def generate_posts_json(posts_dir):
    post_entries = []
    current_time = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")  # Current UTC time

    for filename in os.listdir(posts_dir):
        if filename.endswith(".html") and filename != "posts.html":
            file_path = os.path.join(posts_dir, filename)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    soup = BeautifulSoup(content, "html.parser")

                    # Extract title
                    title = soup.title.string.strip() if soup.title and soup.title.string else filename.replace(".html", "").replace("-", " ").title()
                    # Extract description
                    meta = soup.find("meta", attrs={"name": "description"})
                    summary = meta["content"] if meta and "content" in meta.attrs else "No summary available."
                    # Extract thumbnail
                    thumbnail = soup.find("meta", attrs={"name": "thumbnail"})
                    thumbnail_url = thumbnail["content"] if thumbnail and "content" in thumbnail.attrs else ""
                    # Extract tags
                    tags_meta = soup.find("meta", attrs={"name": "tags"})
                    tags = [tag.strip() for tag in tags_meta["content"].split(",")] if tags_meta and "content" in tags_meta.attrs else []
                    # Set author (fixed to Muhammad Taha Nasir)
                    author = "Muhammad Taha Nasir"

                    # Extract custom date from body tag, fallback to current time
                    body = soup.find("body")
                    custom_date = body.get("post-date", current_time) if body and body.get("post-date") else current_time
                    try:
                        datetime.strptime(custom_date, "%Y-%m-%dT%H:%M:%SZ")
                    except ValueError:
                        custom_date = current_time  # Fallback if format is invalid

                    # Use main tag if present, otherwise body, otherwise full soup as fallback
                    main_content = soup.find("main")
                    content_to_analyze = main_content if main_content else (body if body else soup)
                    post_entries.append({
                        "title": title,
                        "summary": summary,
                        "url": f"posts/{filename}",
                        "thumbnail": thumbnail_url,
                        "tags": tags,
                        "author": author,
                        "time": calculate_read_time(content_to_analyze),
                        "date": custom_date
                    })
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                continue
            
            
            

    # Sort by date, newest first
    post_entries.sort(key=lambda x: x["date"], reverse=True)

    output_path = os.path.join(posts_dir, "posts.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(post_entries, f, indent=2, ensure_ascii=False)

    print(f"✅ posts.json successfully generated at: {output_path}")

if __name__ == "__main__":
    posts_folder = os.path.join(os.path.dirname(__file__), "posts")
    generate_posts_json(posts_folder)
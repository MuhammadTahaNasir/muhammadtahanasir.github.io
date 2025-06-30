import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from post_json_generator import generate_posts_json

class PostsChangeHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        if event.src_path.endswith(".html"):
            print(f"🔁 Detected change: {event.src_path}")
            generate_posts_json(folder_to_watch)

if __name__ == "__main__":
    folder_to_watch = os.path.join(os.path.dirname(__file__), "posts")
    generate_posts_json(folder_to_watch)  # Initial generation

    event_handler = PostsChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, path=folder_to_watch, recursive=False)

    print("👀 Watching for file changes in 'posts/'...")
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping watcher.")
        observer.stop()
    observer.join()

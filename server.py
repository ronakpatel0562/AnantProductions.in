"""
ANANT PRODUCTIONS — LOCAL DEVELOPMENT SERVER WITH CLEAN URL ROUTING
Serves HTML files without requiring .html or index.html extensions in the URL.
Examples:
  http://localhost:3000/          -> index.html
  http://localhost:3000/quote     -> quote.html
  http://localhost:3000/about     -> about.html
  http://localhost:3000/contact   -> contact.html
"""

import http.server
import socketserver
import os
import sys

PORT = 3000

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Strip query and fragment
        raw_path = self.path.split('?')[0].split('#')[0]
        trimmed = raw_path.rstrip('/')

        # 1. Root
        if not trimmed:
            return super().do_GET()

        # 2. Check if clean URL matches a .html file
        candidate = trimmed.lstrip('/') + '.html'
        if not os.path.exists(trimmed.lstrip('/')) and os.path.isfile(candidate):
            query_and_hash = self.path[len(raw_path):]
            self.path = '/' + candidate + query_and_hash

        return super().do_GET()

def run():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), CleanURLHandler) as httpd:
        print(f"============================================================")
        print(f"Anant Productions Clean URL Dev Server active at:")
        print(f"  http://localhost:{port}/")
        print(f"============================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == '__main__':
    run()

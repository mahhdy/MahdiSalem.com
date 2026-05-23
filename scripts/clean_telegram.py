import os
import re
from html.parser import HTMLParser

class TelegramParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_text_div = 0
        self.current_message = []
        self.all_messages = []
        self.div_stack = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'div':
            cls = attrs_dict.get('class', '')
            if 'text' in cls.split():
                self.in_text_div += 1
            if self.in_text_div > 0:
                self.div_stack.append(True)
            else:
                self.div_stack.append(False)
        
        if tag == 'br' and self.in_text_div > 0:
            self.current_message.append('\n')

    def handle_endtag(self, tag):
        if tag == 'div':
            if self.div_stack:
                is_text_div = self.div_stack.pop()
                if is_text_div:
                    self.in_text_div -= 1
                    if self.in_text_div == 0:
                        msg = ''.join(self.current_message).strip()
                        if msg:
                            self.all_messages.append(msg)
                        self.current_message = []

    def handle_data(self, data):
        if self.in_text_div > 0:
            self.current_message.append(data)

def clean_html(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    parser = TelegramParser()
    parser.feed(html_content)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        for msg in parser.all_messages:
            # Normalize spaces but keep internal newlines
            # If the user wants "one paragraph per message", we separate by \n\n
            f.write(msg + '\n\n')

if __name__ == "__main__":
    input_file = r'c:\Users\mahhd\Downloads\Telegram Desktop\ChatExport_2026-04-17\messages.html'
    output_file = r'c:\Intel\MahdiSalem.com\cleaned_messages.txt'
    
    if os.path.exists(input_file):
        clean_html(input_file, output_file)
        print(f"Success! Cleaned file saved to {output_file}")
    else:
        print(f"Error: Input file not found at {input_file}")

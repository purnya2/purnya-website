#!/usr/bin/env python3
'''
This scrips is used to compress images found in my drawings.json, into smaller files that are to be used as thumbnails.

'''

# TODO : convertire le immagini in webp
# TODO : fare flags come -f per forzare a fare di nuovo tutto
# TODO : rendere la grandezza configurabile

import sys
import os
import json
import time
from PIL import Image
import requests
from io import BytesIO
import re


base_width = 1000

def main():
    if(len(sys.argv) <3):
        print("Usage : ./thumbgen <json src> <folder dst>")
        return

    json_path = sys.argv[1]
    dest_path = sys.argv[2]

    if json_path[-5:] != ".json":
        print(f"{json_path} is not a json file")

    if not os.path.isfile(json_path):
        print(f"{json_path} is not a valid file/path")

    if not os.path.isdir(dest_path):
        print(f"{dest_path} is not a valid path")


    with open(json_path) as file:
        data = json.load(file)

        for folder in data:
            print("visiting folder : '" + folder+"'")

            new_body = []
            for image in data[folder]["images"]:
                skip = False
                for file in os.listdir(dest_path) :
                    check_filename = image["title"].replace(" ", "_") 
                    if check_filename == re.sub(r'\.[^.]+$','',file):
                        skip = True
                        
                if skip :
                    print(f"already present : '{check_filename}', skipping...")
                    continue

                
                
                url = image["image_url"]
                print(f"Processing: {url}")
                
                try:
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                    response = requests.get(url, headers=headers, timeout=30)
                    response.raise_for_status()
                    
                    content_type = response.headers.get('content-type', '')
                    if 'jpeg' in content_type:
                        extension = '.jpg'
                    elif 'png' in content_type:
                        extension = '.png'
                    elif 'webp' in content_type:
                        extension = '.webp'
                    else:
                        extension = '.jpg'  
                    
                    img = Image.open(BytesIO(response.content))
                    ratio = (base_width / float(img.size[0]))
                    hsize = int((float(img.size[1]) * float(ratio)))
                    newimg = img.resize((base_width, hsize), Image.Resampling.LANCZOS)

                    new_filename = image["title"].replace(" ", "_") + ".webp"
                    new_file_path = dest_path+new_filename
                    newimg.save(new_file_path, 'webp', optimize = True, quality = 50)
                    
                    print(f"Saved thumbnail: {new_file_path}")
                    time.sleep(1) 
                        
                except Exception as e:
                    print(f"Error processing {url}: {e}")
                    continue

                image["image_thumb"]  = new_file_path

                new_body.append(image)

            data[folder]["images"] = new_body
        with open(json_path[:-5]+"thumb.json", "w") as newfile:
            json.dump(data,newfile,indent=4)  
if __name__ == "__main__":
    main()
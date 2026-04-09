import cv2
import easyocr
import numpy as np
from deepface import DeepFace
import os

# Initialize OCR
reader = easyocr.Reader(['en', 'hi'])

def redact_aadhaar(input_path, output_path):
    img = cv2.imread(input_path)
    results = reader.readtext(input_path)
    
    # Filter for results that look like Aadhaar blocks (4 digits)
    digit_blocks = []
    for (bbox, text, prob) in results:
        clean_text = text.replace(" ", "").replace("-", "")
        if clean_text.isdigit() and len(clean_text) == 4:
            digit_blocks.append({'bbox': bbox, 'text': clean_text, 'x': bbox[0][0][0]})

    # Sort blocks from left to right based on their X-coordinate
    digit_blocks.sort(key=lambda x: x['x'])

    # If we found at least 3 blocks (typical 12-digit format), 
    # mask all but the last one.
    if len(digit_blocks) >= 3:
        # Mask the first 8 digits (usually the first two 4-digit blocks)
        for i in range(len(digit_blocks) - 1):
            bbox = digit_blocks[i]['bbox']
            (tl, tr, br, bl) = bbox
            cv2.rectangle(img, tuple(map(int, tl)), tuple(map(int, br)), (0, 0, 0), -1)
    
    # FALLBACK: If the OCR sees the 12 digits as one long string
    else:
        for (bbox, text, prob) in results:
            clean_text = text.replace(" ", "").replace("-", "")
            if clean_text.isdigit() and len(clean_text) == 12:
                (tl, tr, br, bl) = bbox
                # Mask only the left 2/3rds of the box
                width = tr[0] - tl[0]
                mask_end = int(tl[0] + (width * 0.66))
                cv2.rectangle(img, tuple(map(int, tl)), (mask_end, int(br[1])), (0, 0, 0), -1)

    cv2.imwrite(output_path, img)

def verify_face(live_image_path, aadhaar_image_path):
    try:
        # DeepFace compares the live snapshot with the photo on the ID
        result = DeepFace.verify(
            img1_path = live_image_path, 
            img2_path = aadhaar_image_path,
            model_name = "VGG-Face",
            enforce_detection = False
        )
        return {
            "verified": bool(result["verified"]),
            "score": round(1 - result["distance"], 2)
        }
    except Exception as e:
        print(f"Biometric Error: {e}")
        return {"verified": False, "score": 0}
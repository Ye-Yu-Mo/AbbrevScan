import os
import re
from docx import Document
import textract
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil

app = FastAPI()

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
if not os.path.exists("uploads"):
    os.makedirs("uploads")

def get_file_type(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".docx":
        return "docx"
    elif ext == ".doc":
        return "doc"
    else:
        return None

def parse_docx(path):
    # Use textract for .docx files to avoid lxml buffer issues with large files
    text = textract.process(path).decode("utf-8")
    return text

def parse_doc(path):
    text = textract.process(path).decode("utf-8")
    return text

def extract_abbr(text):
    # Helper function to check if string contains any Unicode letter
    def contains_letter(s):
        # Returns True if the string contains any Unicode letter
        return re.search(r'[^\W\d_]', s) is not None

    # Find all content within parentheses
    paren_pattern = re.compile(r"\((.*?)\)")
    num_re = re.compile(r"^\d+$")
    results = set()
    
    # Find all parentheses content
    for paren_content in paren_pattern.findall(text):
        # Check if there is a comma in the content
        if ',' in paren_content:
            parts = paren_content.split(',', 1)  # split on first comma
            full_form = parts[0].strip()
            abbreviation = parts[1].strip()
            
            # Filter out pure numbers and empty strings
            if (num_re.match(full_form) or num_re.match(abbreviation) or 
                not full_form or not abbreviation):
                continue
                
            # Check if abbreviation contains at least one letter (including Unicode)
            if not contains_letter(abbreviation):
                continue
                
            results.add((abbreviation, full_form))
    
    return sorted(results)  # sort by abbreviation

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Check file type
    file_type = get_file_type(file_path)
    if file_type is None:
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
        return JSONResponse(content={"error": "Unsupported file type. Only .doc and .docx files are supported."}, status_code=400)
    
    try:
        # Parse document based on file type
        if file_type == "docx":
            text = parse_docx(file_path)
        elif file_type == "doc":
            text = parse_doc(file_path)
        
        # Extract abbreviations
        abbr_list = extract_abbr(text)
        
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Return results as JSON
        res = {"result": [{"key": k, "value": v} for k, v in abbr_list]}
        return res
    
    except Exception as e:
        # Clean up temporary file in case of error
        if os.path.exists(file_path):
            os.remove(file_path)
        # Log the full error for debugging
        import traceback
        error_details = traceback.format_exc()
        print(f"Error details: {error_details}")  # This will show in the backend terminal
        return JSONResponse(content={"error": f"Error processing file: {str(e)}", "details": error_details}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

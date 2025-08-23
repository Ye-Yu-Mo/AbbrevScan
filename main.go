package main

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"unicode"
)

// WordDocument represents the structure of a DOCX document
type WordDocument struct {
	XMLName xml.Name `xml:"document"`
	Body    struct {
		Paragraphs []struct {
			Runs []struct {
				Text string `xml:"t"`
			} `xml:"r"`
		} `xml:"p"`
	} `xml:"body"`
}

func main() {
	// Create uploads directory if it doesn't exist
	if err := os.MkdirAll("uploads", 0755); err != nil {
		log.Fatalf("Failed to create uploads directory: %v", err)
	}

	// Set up HTTP server with CORS support
	http.HandleFunc("/upload", corsMiddleware(uploadHandler))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"message": "AbbrevScan Go Backend is running"}`))
	})

	log.Println("Server starting on :8000")
	if err := http.ListenAndServe(":8000", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// CORS middleware to handle cross-origin requests
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != "POST" {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max memory
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to parse form: %v"}`, err), http.StatusBadRequest)
		return
	}

	// Get the file from the request
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, `{"error": "No file provided"}`, http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Check file type
	fileExt := strings.ToLower(filepath.Ext(header.Filename))
	if fileExt != ".docx" {
		http.Error(w, `{"error": "Unsupported file type. Only .docx files are supported in this version."}`, http.StatusBadRequest)
		return
	}

	// Save the uploaded file temporarily
	filePath := filepath.Join("uploads", header.Filename)
	out, err := os.Create(filePath)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to save file: %v"}`, err), http.StatusInternalServerError)
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to save file: %v"}`, err), http.StatusInternalServerError)
		return
	}

	// Parse the document
	text, err := parseDocx(filePath)
	if err != nil {
		os.Remove(filePath)
		http.Error(w, fmt.Sprintf(`{"error": "Failed to parse document: %v"}`, err), http.StatusInternalServerError)
		return
	}

	// Extract abbreviations
	abbrList := extractAbbr(text)

	// Clean up temporary file
	os.Remove(filePath)

	// Return results as JSON
	result := map[string]interface{}{
		"result": abbrList,
	}

	jsonResult, err := json.Marshal(result)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to marshal JSON: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Write(jsonResult)
}

func parseDocx(path string) (string, error) {
	// Open the DOCX file (which is a ZIP archive)
	reader, err := zip.OpenReader(path)
	if err != nil {
		return "", fmt.Errorf("failed to open DOCX file: %v", err)
	}
	defer reader.Close()

	// Find the main document XML file
	var documentFile *zip.File
	for _, file := range reader.File {
		if file.Name == "word/document.xml" {
			documentFile = file
			break
		}
	}

	if documentFile == nil {
		return "", fmt.Errorf("document.xml not found in DOCX file")
	}

	// Open and read the document XML
	rc, err := documentFile.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open document.xml: %v", err)
	}
	defer rc.Close()

	// Read the XML content
	var buf bytes.Buffer
	_, err = io.Copy(&buf, rc)
	if err != nil {
		return "", fmt.Errorf("failed to read document.xml: %v", err)
	}

	// Parse the XML to extract text
	var text strings.Builder
	decoder := xml.NewDecoder(&buf)

	for {
		token, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", fmt.Errorf("XML parsing error: %v", err)
		}

		switch se := token.(type) {
		case xml.StartElement:
			// Look for text elements
			if se.Name.Local == "t" {
				// Read the text content
				var content struct {
					Text string `xml:",chardata"`
				}
				if err := decoder.DecodeElement(&content, &se); err != nil {
					continue
				}
				text.WriteString(content.Text)
			}
		}
	}

	return text.String(), nil
}

// Helper function to check if a string contains any Unicode letter
func containsLetter(s string) bool {
	for _, r := range s {
		if unicode.IsLetter(r) {
			return true
		}
	}
	return false
}

func extractAbbr(text string) []map[string]string {
	// Find all content within parentheses
	parenPattern := regexp.MustCompile(`\((.*?)\)`)
	numRe := regexp.MustCompile(`^\d+$`)
	
	resultsMap := make(map[string]string)
	matches := parenPattern.FindAllStringSubmatch(text, -1)

	for _, match := range matches {
		if len(match) < 2 {
			continue
		}
		
		parenContent := match[1]
		
		// Check if there is a comma in the content
		if strings.Contains(parenContent, ",") {
			parts := strings.SplitN(parenContent, ",", 2)
			fullForm := strings.TrimSpace(parts[0])
			abbreviation := strings.TrimSpace(parts[1])
			
			// Filter out pure numbers and empty strings
			if numRe.MatchString(fullForm) || numRe.MatchString(abbreviation) || 
				fullForm == "" || abbreviation == "" {
				continue
			}
			
			// Check if abbreviation contains at least one letter
			if !containsLetter(abbreviation) {
				continue
			}
			
			// Use abbreviation as key to avoid duplicates
			resultsMap[abbreviation] = fullForm
		}
	}
	
	// Convert to sorted list
	var results []map[string]string
	keys := make([]string, 0, len(resultsMap))
	for k := range resultsMap {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	
	for _, key := range keys {
		results = append(results, map[string]string{
			"key":   key,
			"value": resultsMap[key],
		})
	}
	
	return results
}

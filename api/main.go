package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	// Create a new ServeMux, which is a request router.
	mux := http.NewServeMux()

	// Handle API requests under the "/api/" prefix.
	mux.HandleFunc("/api/scores", ScoreHandler)

	// Serve the static game files from the parent directory.
	mux.Handle("/", http.FileServer(http.Dir("..")))

	fmt.Println("Server starting on http://localhost:8080")

	// Start the server with our custom router.
	log.Fatal(http.ListenAndServe(":8080", mux))
}

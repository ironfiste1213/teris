package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	// create a new ServeMux, which is a request router
	mux := http.NewServeMux()

	// handle API requests
	mux.HandleFunc("/api/score", ScoreHandler)
	mux.HandleFunc("/api/playerdata", PlayerDataHandler)

	// serve the static game files from the parent directory
	mux.Handle("/", http.FileServer(http.Dir("..")))

	fmt.Println("Server starting on http://localhost:8080")

	// start the server with our custom router
	log.Fatal(http.ListenAndServe(":8080", mux))
}

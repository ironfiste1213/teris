package main

import (
	"encoding/json"
	"net/http"
)

func ScoreHandler(w http.ResponseWriter, r *http.Request) {
	// Allow requests from any origin (e.g., your Live Server)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Browsers send a "preflight" OPTIONS request to check CORS policy
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case http.MethodGet:
		scores, err := LoadScores("scores.json")
		if err != nil {
			http.Error(w, "Failed to load scores", http.StatusInternalServerError)
			return
		}
		SortScores(scores)
		rankedScores := RankScores(scores)
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(rankedScores)
		if err != nil {
			http.Error(w, "Failed to encode ranked scores", http.StatusInternalServerError)
		}

	case http.MethodPost:
		var newScore Score
		err := json.NewDecoder(r.Body).Decode(&newScore)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// You could add validation for the newScore fields here

		err = InsertScore("scores.json", newScore)
		if err != nil {
			http.Error(w, "Failed to save score", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

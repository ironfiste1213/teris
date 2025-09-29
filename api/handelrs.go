package main

import (
	"encoding/json"
	"net/http"
	"regexp"
)

func ScoreHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		scores, err := LoadScores("scores.json")
		if err != nil {
			http.Error(w, "Failed to load scores", http.StatusInternalServerError)
			return
		}
		SortScores(scores)                 // Sort first
		rankedScores := RankScores(scores) // Then assign ranks
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(rankedScores) // Encode the ranked scores
		if err != nil {
			http.Error(w, "Failed to encode scores", http.StatusInternalServerError)
		}

	case http.MethodPost:
		var newScore Score
		err := json.NewDecoder(r.Body).Decode(&newScore)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Perform all validation on the new score *before* processing it.
		// Basic server-side validation
		if newScore.Name == "" {
			http.Error(w, "Player name cannot be empty", http.StatusBadRequest)
			return
		}
		if len(newScore.Name) > 15 {
			http.Error(w, "Player name is too long", http.StatusBadRequest)
			return
		}
		if newScore.Score < 0 {
			http.Error(w, "Score cannot be negative", http.StatusBadRequest)
			return
		}
		if match, _ := regexp.MatchString(`^\d{2}:\d{2}$`, newScore.Time); !match {
			http.Error(w, "Time format must be MM:SS", http.StatusBadRequest)
			return
		}

		// Load existing scores to calculate rank
		scores, err := LoadScores("scores.json")
		if err != nil {
			// This is a server error, not a user error.
			http.Error(w, "Failed to load scores for ranking", http.StatusInternalServerError)
			return
		}

		scores = append(scores, newScore)
		SortScores(scores) // Sort to find the rank and prepare for saving

		// Find the rank of the new score
		
		// Save the updated list of scores
		if err := SaveScores("scores.json", scores); err != nil {
			http.Error(w, "Failed to save new score", http.StatusInternalServerError)
			return
		}

		// Respond with the rank and total scores
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		
		if err != nil {
			// Log the error server-side, the header is already sent.
			// We can't send an http.Error here, but we can log it.
		}

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

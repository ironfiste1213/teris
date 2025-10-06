package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"regexp"
)

func ScoreHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		scores, err := LoadScores("scores.json")
		fmt.Println("GET /api/score")
		if err != nil {
			http.Error(w, "Failed to load scores", http.StatusInternalServerError)
			return
		}
		// ensure we always return an empty array instead of null for an empty score list
		if scores == nil {
			scores = []Score{}
		}

		SortScores(scores)                 // sort first
		rankedScores := RankScores(scores) // then assign ranks
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(rankedScores) // encode the ranked scores
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

		// perform all validation on the new score *before* processing it
		// basic server-side validation
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

		// load existing scores to calculate rank
		scores, err := LoadScores("scores.json")
		if err != nil {
			// this is a server error, not a user error
			http.Error(w, "Failed to load scores for ranking", http.StatusInternalServerError)
			return
		}

		scores = append(scores, newScore)
		SortScores(scores) // sort to find the rank and prepare for saving

		// find the rank of the new score

		// save the updated list of scores
		if err := SaveScores("scores.json", scores); err != nil {
			http.Error(w, "Failed to save new score", http.StatusInternalServerError)
			return
		}

		// respond with the rank and total scores
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		rankedScores := RankScores(scores) // then assign ranks

		err = json.NewEncoder(w).Encode(rankedScores)
		if err != nil {
			http.Error(w, "Failed to encode scores", http.StatusInternalServerError)
		}

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func PlayerDataHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		var data struct {
			Score int    `json:"score"`
			Time  string `json:"time"`
		}

		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if data.Score < 0 {
			http.Error(w, "Score cannot be negative", http.StatusBadRequest)
			return
		}
		if match, _ := regexp.MatchString(`^\d{2}:\d{2}$`, data.Time); !match {
			http.Error(w, "Time format must be MM:SS", http.StatusBadRequest)
			return
		}

		// write to playerdata.json
		err = WritePlayerData("playerdata.json", PlayerData{Score: data.Score, Time: data.Time})
		if err != nil {
			http.Error(w, "Failed to write player data", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"status":"ok"}`))
	case http.MethodGet:
		playerData, err := ReadPlayerData("playerdata.json")
		if err != nil {
			if os.IsNotExist(err) {
				http.Error(w, "Player data not found", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to read player data", http.StatusInternalServerError)
			return
		}
		// delete the file after reading to ensure it can only be fetched once
		os.Remove("playerdata.json")

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(playerData)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

package main

import (
	"encoding/json"
	"errors"
	"io"
	"os"
	"sort"
)

type PlayerData struct {
	Score int    `json:"score"`
	Time  string `json:"time"`
}

// LoadScores reads a slice of Score from a JSON file.
// If the file does not exist or is empty, it returns an empty slice and no error.
func LoadScores(filename string) ([]Score, error) {
	var scores []Score
	file, err := os.Open(filename)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return []Score{}, nil
		}
		return nil, err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	err = decoder.Decode(&scores)
	// An empty file will result in an EOF error, which we can safely ignore.
	if err != nil && !errors.Is(err, io.EOF) {
		return nil, err
	}

	return scores, nil
}

// SaveScores marshals a slice of Score into JSON and writes it to a file.
func SaveScores(filename string, scores []Score) error {
	data, err := json.MarshalIndent(scores, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filename, data, 0o644)
}

func SortScores(scores []Score) {
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})
}

// RankScores iterates over a sorted slice of scores and assigns a rank to each.
// It modifies the slice in place and returns it.
func RankScores(scores []Score) []Score {
	for i := range scores {
		scores[i].Rank = i + 1
	}
	return scores
}

func WritePlayerData(filename string, playerdata PlayerData) error {
	data, err := json.MarshalIndent(playerdata, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filename, data, 0o644)
}

func ReadPlayerData(filename string) (PlayerData, error) {
	var playerData PlayerData
	file, err := os.Open(filename)
	if err != nil {
		return PlayerData{}, err
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		return PlayerData{}, err
	}

	return playerData, json.Unmarshal(data, &playerData)
}

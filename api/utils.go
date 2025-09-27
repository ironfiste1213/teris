package main

import (
	"encoding/json"
	"errors"
	"io"
	"os"
	"sort"
)

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
	return os.WriteFile(filename, data, 0644)
}

func InsertScore(filename string, score Score) error {
	scores, err := LoadScores(filename)
	if err != nil {
		return err
	}
	scores = append(scores, score)
	return SaveScores(filename, scores)
}

func SortScores(scores []Score) {
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})
}

func RankScores(scores []Score) []RankedScore {
	rankedScores := make([]RankedScore, len(scores))
	for i, score := range scores {
		rankedScores[i] = RankedScore{
			Rank:  i + 1,
			Name:  score.Name,
			Score: score.Score,
			Time:  score.Time,
		}
	}
	return rankedScores
}

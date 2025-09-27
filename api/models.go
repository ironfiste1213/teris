package main



type Score struct {
    Name  string `json:"name"`
    Score int    `json:"score"`
    Time  string `json:"time"` // "MM:SS"
}



 
type RankedScore struct {
    Rank  int    `json:"rank"`
    Name  string `json:"name"`
    Score int    `json:"score"`
    Time  string `json:"time"`
}

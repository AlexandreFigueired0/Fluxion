package types

type DebugResult struct {
	RootCause   string `json:"root_cause"`
	Fix         string `json:"fix"`
	Explanation string `json:"explanation"`
}

package internal

import (
	"fmt"
	"os"
	"strings"
	"sync"
	"time"
)

// Spinner is a simple terminal spinner that can be started and stopped.
// It's safe to call Stop even if Start decided not to run (e.g., non-TTY).
type Spinner struct {
	message  string
	frames   []string
	interval time.Duration

	mu      sync.Mutex
	started bool
	done    chan struct{}
	once    sync.Once
	lastLen int
}

// NewSpinner constructs a Spinner with a message. The spinner uses a small
// braille-like frameset and a 100ms interval by default.
func NewSpinner(message string) *Spinner {
	return &Spinner{
		message:  message,
		frames:   []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"},
		interval: 100 * time.Millisecond,
	}
}

// isTerminal reports whether Stdout is a character device (tty).
func isTerminal() bool {
	if fi, err := os.Stdout.Stat(); err == nil {
		return (fi.Mode() & os.ModeCharDevice) != 0
	}
	return false
}

// Start begins the spinner goroutine if running in a terminal. It's a no-op
// otherwise. Start is safe to call multiple times.
func (s *Spinner) Start() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.started {
		return
	}
	if !isTerminal() {
		// don't start spinner when not a TTY
		s.started = false
		return
	}

	s.done = make(chan struct{})
	s.started = true

	go func() {
		i := 0
		for {
			select {
			case <-s.done:
				// clear the previously printed line fully, then return
				if s.lastLen > 0 {
					fmt.Print("\r" + strings.Repeat(" ", s.lastLen) + "\r")
				} else {
					fmt.Print("\r")
				}
				return
			default:
				text := fmt.Sprintf("%s %s", s.frames[i%len(s.frames)], s.message)
				fmt.Print("\r" + text)
				s.lastLen = len(text)
				time.Sleep(s.interval)
				i++
			}
		}
	}()
}

// Stop signals the spinner to stop and clears the line. Stop is idempotent.
func (s *Spinner) Stop() {
	s.once.Do(func() {
		s.mu.Lock()
		defer s.mu.Unlock()
		if s.started && s.done != nil {
			close(s.done)
		} else if s.lastLen > 0 {
			// If spinner wasn't started (non-tty) but some text was printed earlier
			// by other means, attempt to clear, otherwise do nothing.
			fmt.Print("\r" + strings.Repeat(" ", s.lastLen) + "\r")
		}
	})
}

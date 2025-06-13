package producer

import (
	"errors"
	"time"
)

// Producer represents a producer entity.
type Producer struct {
	ID        string    `json:"id"`
	Document  string    `json:"document"` // Added Document field
	Name      string    `json:"name"`
	Country   string    `json:"country"`
	Farms     []Farm    `json:"farms"` // Placeholder for farms
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Farm is a placeholder struct.
type Farm struct {
	ID   string
	Name string
}

// NewProducer creates a new Producer instance.
// For now, it only validates name and document presence.
// Country can be set separately if needed.
func NewProducer(document, name string) (*Producer, error) {
	if name == "" {
		return nil, errors.New("producer name cannot be empty")
	}
	if document == "" {
		return nil, errors.New("producer document cannot be empty")
	}
	return &Producer{
		Document: document,
		Name:     name,
		Farms:    make([]Farm, 0),
		// ID, CreatedAt, UpdatedAt would typically be set by the repository upon creation.
	}, nil
}

// AddFarm adds a farm to the producer.
// This is a simplified implementation.
func (p *Producer) AddFarm(farm Farm) {
	p.Farms = append(p.Farms, farm)
	p.UpdatedAt = time.Now() // Adding a farm updates the producer
}

package producer

// ProducerRepository defines the interface for interacting with producer data.
type ProducerRepository interface {
	// FindAll retrieves all producers.
	FindAll() ([]*Producer, error)
	// FindByDocument retrieves a producer by its document number.
	// Assuming "document" refers to a unique identifier other than ID, like a tax ID or national ID.
	// If "document" means the producer's ID, then this method should be FindByID(id string).
	// For now, I'll assume it's a separate field. If not, this can be adjusted.
	FindByDocument(document string) (*Producer, error)
	// Create adds a new producer.
	Create(p *Producer) (*Producer, error)
	// Update modifies an existing producer.
	Update(p *Producer) (*Producer, error)
	// Delete removes a producer by its ID.
	Delete(id string) error
}

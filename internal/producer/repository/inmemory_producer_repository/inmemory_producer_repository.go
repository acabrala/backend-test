package inmemoryproducerrepository

import (
	"errors"
	"sync"
	"time"

	"go-producer-api/pkg/producer" // Ensure this path is correct

	"github.com/google/uuid"
)

var (
	ErrProducerNotFound     = errors.New("producer not found")
	ErrProducerExists       = errors.New("producer with this document already exists") // For Create
)

// InMemoryProducerRepository is an in-memory implementation of the ProducerRepository interface.
type InMemoryProducerRepository struct {
	mu        sync.RWMutex
	producers map[string]*producer.Producer // Keyed by ID
	byDocument map[string]string // document -> ID
}

// NewInMemoryProducerRepository creates a new InMemoryProducerRepository.
func NewInMemoryProducerRepository() *InMemoryProducerRepository {
	return &InMemoryProducerRepository{
		producers: make(map[string]*producer.Producer),
		byDocument: make(map[string]string),
	}
}

// Create adds a new producer.
// It checks if a producer with the same document already exists.
func (r *InMemoryProducerRepository) Create(p *producer.Producer) (*producer.Producer, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Check if producer with this document already exists
	for _, existingProducer := range r.producers {
		if existingProducer.Document == p.Document && p.Document != "" { // Ensure document is not empty
			return nil, ErrProducerExists
		}
	}

	p.ID = uuid.New().String()
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()

	r.producers[p.ID] = p
	if p.Document != "" { // Only add to byDocument if document is not empty
		r.byDocument[p.Document] = p.ID
	}
	return p, nil
}

// FindByDocument retrieves a producer by its document number.
func (r *InMemoryProducerRepository) FindByDocument(document string) (*producer.Producer, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if document == "" {
		return nil, errors.New("document cannot be empty")
	}

	id, ok := r.byDocument[document]
	if !ok {
		return nil, ErrProducerNotFound
	}
	// Now get the producer by ID
	p, ok := r.producers[id]
	if !ok {
		// This would indicate an inconsistency in our maps
		return nil, errors.New("internal inconsistency: producer ID found in document index but not in main store")
	}
	return p, nil
}

// FindAll retrieves all producers. (Formerly ListProducers)
func (r *InMemoryProducerRepository) FindAll() ([]*producer.Producer, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	prods := make([]*producer.Producer, 0, len(r.producers))
	for _, p := range r.producers {
		prods = append(prods, p)
	}
	return prods, nil
}

// GetProducerByID retrieves a producer by its ID. (Helper, not directly in interface but useful)
func (r *InMemoryProducerRepository) GetProducerByID(id string) (*producer.Producer, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	p, ok := r.producers[id]
	if !ok {
		return nil, ErrProducerNotFound
	}
	return p, nil
}

// Update modifies an existing producer.
// Assumes p.ID is the identifier for the producer to update.
func (r *InMemoryProducerRepository) Update(p *producer.Producer) (*producer.Producer, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if p.ID == "" {
		return nil, errors.New("producer ID cannot be empty for update")
	}

	existingP, ok := r.producers[p.ID]
	if !ok {
		return nil, ErrProducerNotFound
	}

	// Store the original document from the version currently in the map.
	originalDoc := existingP.Document

	// Check for document conflict if the document in 'p' (the input) is different from originalDoc,
	// and the new document is not empty.
	if p.Document != originalDoc && p.Document != "" {
		// Check if the new document (p.Document) already exists for a *different* producer ID.
		if conflictingID, idInIndex := r.byDocument[p.Document]; idInIndex && conflictingID != p.ID {
			return nil, ErrProducerExists // Conflict found
		}
	}

	// Create a new struct for storing the updated producer data.
	// This ensures that we're not just modifying the input 'p' if it's a shared pointer from elsewhere,
	// and correctly handles the separation of existing data vs new data.
	updatedProducer := *existingP // Start with a copy of the existing data

	// Apply updates from 'p' to 'updatedProducer'.
	updatedProducer.Name = p.Name
	updatedProducer.Country = p.Country // Assuming Country might be updated
	updatedProducer.Document = p.Document
	// Copy any other fields that are allowed to be updated from 'p'.
	// Farms update would be more complex, e.g., p.Farms could replace updatedProducer.Farms.
	updatedProducer.Farms = p.Farms

	updatedProducer.UpdatedAt = time.Now() // Set new UpdatedAt; CreatedAt remains from existingP.

	// Update the byDocument index if the document has changed.
	if updatedProducer.Document != originalDoc {
		if originalDoc != "" {
			delete(r.byDocument, originalDoc)
		}
		if updatedProducer.Document != "" {
			r.byDocument[updatedProducer.Document] = updatedProducer.ID // Use ID from updatedProducer (which is p.ID)
		}
	}

	r.producers[p.ID] = &updatedProducer // Store the pointer to the fully updated struct.
	return &updatedProducer, nil
}

// Delete removes a producer by its ID. (Formerly DeleteProducer)
func (r *InMemoryProducerRepository) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	p, ok := r.producers[id]
	if !ok {
		return ErrProducerNotFound
	}

	if p.Document != "" {
		delete(r.byDocument, p.Document)
	}
	delete(r.producers, id)
	return nil
}

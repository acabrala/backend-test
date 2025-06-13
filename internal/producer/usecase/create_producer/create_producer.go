package createproducerusecase

import (
	"errors"
	"go-producer-api/pkg/producer"
	// We need to import the repository errors if we want to use errors.Is with them
	// For now, we're checking the error message string.
	// inmemoryproducerrepository "go-producer-api/internal/producer/repository/inmemory_producer_repository"
)

var (
	ErrInvalidDocument     = errors.New("invalid document")
	ErrInvalidName         = errors.New("invalid name for producer")
	ErrProducerExists      = errors.New("producer with this document already exists") // Use case specific error
)

// ProducerRepository defines the interface for producer data storage
// that this use case depends on.
type ProducerRepository interface {
	Create(p *producer.Producer) (*producer.Producer, error)
}

// CpfCnpjValidator defines the interface for CPF/CNPJ validation.
type CpfCnpjValidator interface {
	Validate(document string) error
}

// CreateProducerUseCase is the use case for creating a producer.
type CreateProducerUseCase struct {
	repository        ProducerRepository
	documentValidator CpfCnpjValidator
}

// NewCreateProducerUseCase creates a new CreateProducerUseCase.
func NewCreateProducerUseCase(repository ProducerRepository, documentValidator CpfCnpjValidator) *CreateProducerUseCase {
	return &CreateProducerUseCase{
		repository:        repository,
		documentValidator: documentValidator,
	}
}

// Execute creates a new producer.
func (uc *CreateProducerUseCase) Execute(dto CreateProducerDTO) (*producer.Producer, error) {
	if dto.Name == "" {
		return nil, ErrInvalidName
	}
	if dto.Document == "" {
		return nil, ErrInvalidDocument
	}

	if err := uc.documentValidator.Validate(dto.Document); err != nil {
		// Assuming validator returns a compatible error or we map it.
		// For now, returning ErrInvalidDocument directly if Validate fails.
		return nil, ErrInvalidDocument
	}

	p := &producer.Producer{
		Document: dto.Document,
		Name:     dto.Name,
		// Country will be empty, can be updated later.
		// ID, CreatedAt, UpdatedAt are set by the repository.
	}

	createdProducer, err := uc.repository.Create(p)
	if err != nil {
		// Check if the error is due to producer already existing.
		// The InMemoryProducerRepository returns an error with message "producer with this document already exists"
		if err.Error() == "producer with this document already exists" { // TODO: Replace with errors.Is(err, inmemoryproducerrepository.ErrProducerExists)
			return nil, ErrProducerExists // Return the use case's specific error
		}
		// For other errors, return them directly or wrap them.
		return nil, err
	}

	return createdProducer, nil
}

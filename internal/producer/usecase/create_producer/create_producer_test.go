package createproducerusecase

import (
	"errors"
	"testing"
	"time"

	"go-producer-api/pkg/producer"
)

// MockProducerRepository is a mock implementation of ProducerRepository.
type MockProducerRepository struct {
	CreateFunc         func(p *producer.Producer) (*producer.Producer, error)
	FindByDocumentFunc func(document string) (*producer.Producer, error) // Though not used by current use case directly
}

func (m *MockProducerRepository) Create(p *producer.Producer) (*producer.Producer, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(p)
	}
	// Default behavior
	p.ID = "mock-id"
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
	return p, nil
}

func (m *MockProducerRepository) FindByDocument(document string) (*producer.Producer, error) {
	if m.FindByDocumentFunc != nil {
		return m.FindByDocumentFunc(document)
	}
	return nil, nil // Default: not found
}

// MockCpfCnpjValidator is a mock implementation of CpfCnpjValidator.
type MockCpfCnpjValidator struct {
	ValidateFunc func(document string) error
}

func (m *MockCpfCnpjValidator) Validate(document string) error {
	if m.ValidateFunc != nil {
		return m.ValidateFunc(document)
	}
	return nil // Default: valid
}

func TestCreateProducerUseCase_Execute(t *testing.T) {
	mockRepo := &MockProducerRepository{}
	mockValidator := &MockCpfCnpjValidator{}
	useCase := NewCreateProducerUseCase(mockRepo, mockValidator)

	dto := CreateProducerDTO{
		Document: "12345678901", // Valid CPF/CNPJ for mock
		Name:     "Test Producer",
	}

	t.Run("successful producer creation", func(t *testing.T) {
		mockRepo.CreateFunc = func(p *producer.Producer) (*producer.Producer, error) {
			p.ID = "generated-id"
			p.CreatedAt = time.Now()
			p.UpdatedAt = time.Now()
			// Ensure correct data is passed to repository
			if p.Document != dto.Document {
				t.Errorf("Repo Create: Document = %s, want %s", p.Document, dto.Document)
			}
			if p.Name != dto.Name {
				t.Errorf("Repo Create: Name = %s, want %s", p.Name, dto.Name)
			}
			return p, nil
		}
		mockValidator.ValidateFunc = func(document string) error {
			if document != dto.Document {
				t.Errorf("Validator Validate: Document = %s, want %s", document, dto.Document)
			}
			return nil // Valid
		}

		createdProducer, err := useCase.Execute(dto)
		if err != nil {
			t.Fatalf("Execute() error = %v, wantErr nil", err)
		}
		if createdProducer == nil {
			t.Fatal("Execute() createdProducer = nil, want not nil")
		}
		if createdProducer.ID != "generated-id" {
			t.Errorf("Execute() ID = %s, want generated-id", createdProducer.ID)
		}
		if createdProducer.Name != dto.Name {
			t.Errorf("Execute() Name = %s, want %s", createdProducer.Name, dto.Name)
		}
		if createdProducer.Document != dto.Document {
			t.Errorf("Execute() Document = %s, want %s", createdProducer.Document, dto.Document)
		}
	})

	t.Run("invalid DTO - missing name", func(t *testing.T) {
		invalidDto := CreateProducerDTO{Document: "12345678901", Name: ""}
		_, err := useCase.Execute(invalidDto)
		if err == nil {
			t.Fatal("Execute() with missing name, error = nil, want error")
		}
		if !errors.Is(err, ErrInvalidName) {
			t.Errorf("Execute() with missing name, error = %v, want %v", err, ErrInvalidName)
		}
	})

	t.Run("invalid DTO - missing document", func(t *testing.T) {
		invalidDto := CreateProducerDTO{Document: "", Name: "Test Name"}
		_, err := useCase.Execute(invalidDto)
		if err == nil {
			t.Fatal("Execute() with missing document, error = nil, want error")
		}
		if !errors.Is(err, ErrInvalidDocument) {
			t.Errorf("Execute() with missing document, error = %v, want %v", err, ErrInvalidDocument)
		}
	})

	t.Run("invalid CPF/CNPJ - validator returns error", func(t *testing.T) {
		mockValidator.ValidateFunc = func(document string) error {
			return errors.New("mock validation error") // Specific error from validator
		}
		_, err := useCase.Execute(dto) // Use valid DTO, but validator fails
		if err == nil {
			t.Fatal("Execute() with invalid document (validator fails), error = nil, want error")
		}
		// The use case currently wraps validator errors into ErrInvalidDocument
		if !errors.Is(err, ErrInvalidDocument) {
			t.Errorf("Execute() with invalid document (validator fails), error = %v, want %v", err, ErrInvalidDocument)
		}
		// Reset mock for subsequent tests
		mockValidator.ValidateFunc = nil
	})

	t.Run("producer already exists - repository Create returns error", func(t *testing.T) {
		// This maps to the use case's ErrProducerExists
		mockRepo.CreateFunc = func(p *producer.Producer) (*producer.Producer, error) {
			return nil, errors.New("producer with this document already exists") // Simulate error from repo
		}
		_, err := useCase.Execute(dto)
		if err == nil {
			t.Fatal("Execute() when producer exists, error = nil, want error")
		}
		if !errors.Is(err, ErrProducerExists) { // Use case's own error
			t.Errorf("Execute() when producer exists, error = %v, want %v", err, ErrProducerExists)
		}
		// Reset mock
		mockRepo.CreateFunc = nil
	})

	t.Run("repository Create method fails for other reasons", func(t *testing.T) {
		customRepoError := errors.New("random repository failure")
		mockRepo.CreateFunc = func(p *producer.Producer) (*producer.Producer, error) {
			return nil, customRepoError
		}
		_, err := useCase.Execute(dto)
		if err == nil {
			t.Fatal("Execute() with other repo failure, error = nil, want error")
		}
		if !errors.Is(err, customRepoError) {
			t.Errorf("Execute() with other repo failure, error = %v, want %v", err, customRepoError)
		}
		// Reset mock
		mockRepo.CreateFunc = nil
	})
}

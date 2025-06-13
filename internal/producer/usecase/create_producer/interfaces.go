package createproducerusecase

import "go-producer-api/pkg/producer"

// Creator is the interface for the create producer use case.
// This will be implemented by CreateProducerUseCase and its mocks.
type Creator interface {
	Execute(dto CreateProducerDTO) (*producer.Producer, error)
}

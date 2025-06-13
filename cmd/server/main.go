package main

import (
	"log"

	"github.com/gin-gonic/gin"
	// Duplicated imports removed
	inmemoryproducerrepository "go-producer-api/internal/producer/repository/inmemory_producer_repository"
	createproducerusecase "go-producer-api/internal/producer/usecase/create_producer"
	"go-producer-api/internal/producer/validator" // Import the new validator package
)

func main() {
	// Initialize Gin router
	router := gin.Default()

	// Initialize Dependencies
	// 1. Repository
	// producerRepoAdapter := NewInMemoryProducerRepositoryAdapter(inmemoryproducerrepository.NewInMemoryProducerRepository()) // Adapter no longer needed
	producerRepo := inmemoryproducerrepository.NewInMemoryProducerRepository() // Use the real repository


	// 2. Validator (Real)
	docValidator := validator.NewCpfCnpjValidator() // Use the real CpfCnpjValidator

	// 3. Use Case
	// The CreateProducerUseCase expects a ProducerRepository interface.
	// The inmemoryproducerrepository.InMemoryProducerRepository now implements pkg/producer.ProducerRepository.
	// The CreateProducerUseCase's internal ProducerRepository interface is a subset of this, so it's compatible.
	createUseCase := createproducerusecase.NewCreateProducerUseCase(producerRepo, docValidator)


	// 4. Handler
	producerHandler := NewProducerHandler(createUseCase)

	// Register Routes
	apiGroup := router.Group("/api") // Using a group for API versioning or common path
	producerHandler.RegisterRoutes(apiGroup)

	// Start server
	log.Println("Server starting on port 8080 with Gin...")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Error starting Gin server: %s\n", err)
	}
}

package main

import (
	"errors" // Added for errors.Is
	"net/http"

	"github.com/gin-gonic/gin"
	createproducerusecase "go-producer-api/internal/producer/usecase/create_producer"
)

// ProducerHandler handles HTTP requests for producers.
type ProducerHandler struct {
	createUseCase createproducerusecase.Creator // Use the interface
}

// NewProducerHandler creates a new ProducerHandler.
func NewProducerHandler(createUseCase createproducerusecase.Creator) *ProducerHandler { // Use the interface
	return &ProducerHandler{
		createUseCase: createUseCase,
	}
}

// RegisterRoutes registers producer routes with the Gin router group.
func (h *ProducerHandler) RegisterRoutes(routerGroup *gin.RouterGroup) {
	routerGroup.POST("/producers", h.createProducer)
}

// createProducer handles the creation of a new producer.
func (h *ProducerHandler) createProducer(c *gin.Context) {
	var dto createproducerusecase.CreateProducerDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	producer, err := h.createUseCase.Execute(dto)
	if err != nil {
		// Basic error handling, can be improved to return specific status codes
		// based on the error type from the use case.
		if errors.Is(err, createproducerusecase.ErrInvalidDocument) || errors.Is(err, createproducerusecase.ErrInvalidName) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else if errors.Is(err, createproducerusecase.ErrProducerExists) { // Changed to use errors.Is
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating producer: " + err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, producer)
}

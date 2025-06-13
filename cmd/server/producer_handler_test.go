package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	createproducerusecase "go-producer-api/internal/producer/usecase/create_producer"
	"go-producer-api/pkg/producer"
)

// MockCreateProducerUseCase is a mock for CreateProducerUseCase.
type MockCreateProducerUseCase struct {
	ExecuteFunc func(dto createproducerusecase.CreateProducerDTO) (*producer.Producer, error)
}

func (m *MockCreateProducerUseCase) Execute(dto createproducerusecase.CreateProducerDTO) (*producer.Producer, error) {
	if m.ExecuteFunc != nil {
		return m.ExecuteFunc(dto)
	}
	// Default success behavior
	return &producer.Producer{
		ID:       "mock-prod-id",
		Document: dto.Document,
		Name:     dto.Name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil
}

func setupRouterForHandlerTest(useCase *MockCreateProducerUseCase) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New() // Use gin.New() instead of gin.Default() for a clean router in tests

	handler := NewProducerHandler(useCase) // Assuming NewProducerHandler is in the 'main' package

	// If RegisterRoutes expects a group:
	// apiGroup := router.Group("/api")
	// handler.RegisterRoutes(apiGroup)
	// For this test, let's assume /producers is directly on the router or a group is not strictly needed for the unit test path
	router.POST("/producers", handler.createProducer) // Directly registering the method for simplicity

	return router
}

func TestProducerHandler_createProducer(t *testing.T) {
	mockUseCase := &MockCreateProducerUseCase{}
	router := setupRouterForHandlerTest(mockUseCase)

	t.Run("successful request returns 201", func(t *testing.T) {
		dto := createproducerusecase.CreateProducerDTO{Document: "valid-doc", Name: "Valid Name"}
		expectedProducer := &producer.Producer{
			ID: "test-id", Document: dto.Document, Name: dto.Name, CreatedAt: time.Now(), UpdatedAt: time.Now(),
		}
		mockUseCase.ExecuteFunc = func(calledDto createproducerusecase.CreateProducerDTO) (*producer.Producer, error) {
			if calledDto.Document != dto.Document || calledDto.Name != dto.Name {
				t.Errorf("UseCase Execute called with DTO %+v, want %+v", calledDto, dto)
			}
			return expectedProducer, nil
		}

		body, _ := json.Marshal(dto)
		req, _ := http.NewRequest(http.MethodPost, "/producers", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusCreated {
			t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusCreated)
			t.Errorf("response body: %s", rr.Body.String())
		}

		var returnedProducer producer.Producer
		if err := json.Unmarshal(rr.Body.Bytes(), &returnedProducer); err != nil {
			t.Fatalf("Could not unmarshal response body: %v", err)
		}
		if returnedProducer.ID != expectedProducer.ID { // Check a few fields
			t.Errorf("handler returned unexpected body: got %+v want something like %+v", returnedProducer, expectedProducer)
		}
	})

	t.Run("invalid JSON payload returns 400", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodPost, "/producers", bytes.NewBufferString("{invalid json"))
		req.Header.Set("Content-Type", "application/json")

		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusBadRequest {
			t.Errorf("handler returned wrong status code for invalid JSON: got %v want %v", status, http.StatusBadRequest)
			t.Logf("Body: %s", rr.Body.String())
		}
	})

	t.Run("use case returns validation error (e.g. ErrInvalidDocument) returns 400", func(t *testing.T) {
		mockUseCase.ExecuteFunc = func(dto createproducerusecase.CreateProducerDTO) (*producer.Producer, error) {
			return nil, createproducerusecase.ErrInvalidDocument // Use case's specific error
		}

		dto := createproducerusecase.CreateProducerDTO{Document: "invalid-doc", Name: "Test"}
		body, _ := json.Marshal(dto)
		req, _ := http.NewRequest(http.MethodPost, "/producers", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusBadRequest {
			t.Errorf("handler returned wrong status code for use case validation error: got %v want %v", status, http.StatusBadRequest)
		}
		if !bytes.Contains(rr.Body.Bytes(), []byte(createproducerusecase.ErrInvalidDocument.Error())) {
			t.Errorf("handler response body %s did not contain expected error %s", rr.Body.String(), createproducerusecase.ErrInvalidDocument.Error())
		}
	})

	t.Run("use case returns ErrProducerExists returns 409", func(t *testing.T) {
		// In create_producer_handler.go, we check error strings from use case.
		// The use case (create_producer.go) returns errors.New("producer with this document already exists")
		// which is then wrapped by its own ErrProducerExists.
		// Let's use the use case's ErrProducerExists.
		useCaseSpecificErrProducerExists := createproducerusecase.ErrProducerExists

		mockUseCase.ExecuteFunc = func(dto createproducerusecase.CreateProducerDTO) (*producer.Producer, error) {
			return nil, useCaseSpecificErrProducerExists
		}

		dto := createproducerusecase.CreateProducerDTO{Document: "existing-doc", Name: "Test"}
		body, _ := json.Marshal(dto)
		req, _ := http.NewRequest(http.MethodPost, "/producers", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusConflict {
			t.Errorf("handler returned wrong status code for ErrProducerExists: got %v want %v", status, http.StatusConflict)
			t.Logf("Body: %s", rr.Body.String())
		}
		// The handler's current logic for ErrProducerExists:
		// else if err.Error() == "producer with this document already exists"
		// Let's make sure the mock error matches what the handler checks or change handler to check errors.Is
		// For this test, we ensure the mock returns an error whose .Error() matches.
		// The use case's ErrProducerExists.Error() is "producer with this document already exists"
		if !bytes.Contains(rr.Body.Bytes(), []byte(useCaseSpecificErrProducerExists.Error())) {
			 t.Errorf("handler response body %s did not contain expected error %s", rr.Body.String(), useCaseSpecificErrProducerExists.Error())
		}
	})

	t.Run("use case returns other internal error returns 500", func(t *testing.T) {
		mockUseCase.ExecuteFunc = func(dto createproducerusecase.CreateProducerDTO) (*producer.Producer, error) {
			return nil, errors.New("some internal server error")
		}

		dto := createproducerusecase.CreateProducerDTO{Document: "doc", Name: "Test"}
		body, _ := json.Marshal(dto)
		req, _ := http.NewRequest(http.MethodPost, "/producers", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusInternalServerError {
			t.Errorf("handler returned wrong status code for internal error: got %v want %v", status, http.StatusInternalServerError)
		}
	})

	// Reset ExecuteFunc to default for subsequent tests if any
	mockUseCase.ExecuteFunc = nil
}

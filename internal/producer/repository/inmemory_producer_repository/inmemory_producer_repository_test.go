package inmemoryproducerrepository

import (
	"errors"
	"reflect"
	"sort"
	"testing"
	"time"

	"go-producer-api/pkg/producer"
)

func TestInMemoryProducerRepository_Create(t *testing.T) {
	repo := NewInMemoryProducerRepository()
	prod1 := &producer.Producer{Document: "11122233301", Name: "Producer One"}

	t.Run("successful creation", func(t *testing.T) {
		createdProd, err := repo.Create(prod1)
		if err != nil {
			t.Fatalf("Create() error = %v, wantErr nil", err)
		}
		if createdProd == nil {
			t.Fatal("Create() createdProd = nil, want not nil")
		}
		if createdProd.ID == "" {
			t.Error("Create() ID not set")
		}
		if createdProd.CreatedAt.IsZero() {
			t.Error("Create() CreatedAt not set")
		}
		if createdProd.UpdatedAt.IsZero() {
			t.Error("Create() UpdatedAt not set")
		}
		if createdProd.Document != prod1.Document || createdProd.Name != prod1.Name {
			t.Errorf("Create() got %v, want %v", createdProd, prod1)
		}

		// Verify it's in the map
		pInMap, exists := repo.producers[createdProd.ID]
		if !exists {
			t.Errorf("Producer not found in internal map after creation")
		}
		if !reflect.DeepEqual(pInMap, createdProd) {
			t.Errorf("Producer in map differs from created producer")
		}
	})

	t.Run("attempting to create a producer with an existing document", func(t *testing.T) {
		prod2 := &producer.Producer{Document: "11122233301", Name: "Producer Two Same Doc"} // Same document as prod1
		_, err := repo.Create(prod2)
		if err == nil {
			t.Fatalf("Create() error = nil, wantErr %v", ErrProducerExists)
		}
		if !errors.Is(err, ErrProducerExists) {
			t.Errorf("Create() error = %v, want %v", err, ErrProducerExists)
		}
	})

	t.Run("create producer with empty document", func(t *testing.T) {
		// The repository's Create method itself checks for document uniqueness if document is not empty.
		// An empty document producer should be creatable, as per current Create logic,
		// though it might be blocked by use case or entity validation earlier.
		prodEmptyDoc := &producer.Producer{Document: "", Name: "Producer Empty Doc"}
		createdProd, err := repo.Create(prodEmptyDoc)
		if err != nil {
			t.Fatalf("Create() with empty doc error = %v, wantErr nil", err)
		}
		if createdProd.Document != "" {
			t.Errorf("Create() with empty doc, document field = %s, want empty", createdProd.Document)
		}
	})
}

func TestInMemoryProducerRepository_FindByDocument(t *testing.T) {
	repo := NewInMemoryProducerRepository()
	prod1 := &producer.Producer{Document: "unique123", Name: "Unique Producer"}
	_, _ = repo.Create(prod1) // Assume Create works and sets ID etc.

	t.Run("finding an existing producer", func(t *testing.T) {
		foundProd, err := repo.FindByDocument("unique123")
		if err != nil {
			t.Fatalf("FindByDocument() error = %v, wantErr nil", err)
		}
		if foundProd == nil {
			t.Fatal("FindByDocument() foundProd = nil, want not nil")
		}
		if foundProd.Document != "unique123" {
			t.Errorf("FindByDocument() got document %v, want %v", foundProd.Document, "unique123")
		}
	})

	t.Run("attempting to find a non-existent producer", func(t *testing.T) {
		_, err := repo.FindByDocument("nonexistent456")
		if err == nil {
			t.Fatalf("FindByDocument() error = nil, wantErr %v", ErrProducerNotFound)
		}
		if !errors.Is(err, ErrProducerNotFound) {
			t.Errorf("FindByDocument() error = %v, want %v", err, ErrProducerNotFound)
		}
	})

	t.Run("find by empty document string", func(t *testing.T) {
		_, err := repo.FindByDocument("")
        if err == nil {
            t.Fatalf("FindByDocument() with empty string error = nil, want error")
        }
        // Expected error: "document cannot be empty"
        if err.Error() != "document cannot be empty" {
            t.Errorf("FindByDocument() with empty string, error = %v, want 'document cannot be empty'", err)
        }
	})
}

func TestInMemoryProducerRepository_FindAll(t *testing.T) {
	repo := NewInMemoryProducerRepository()

	t.Run("when no producers exist", func(t *testing.T) {
		prods, err := repo.FindAll()
		if err != nil {
			t.Fatalf("FindAll() error = %v, wantErr nil", err)
		}
		if len(prods) != 0 {
			t.Errorf("FindAll() got %d producers, want 0", len(prods))
		}
	})

	t.Run("when multiple producers exist", func(t *testing.T) {
		prod1 := &producer.Producer{Document: "doc1", Name: "Producer Alpha"}
		prod2 := &producer.Producer{Document: "doc2", Name: "Producer Beta"}
		_, _ = repo.Create(prod1)
		_, _ = repo.Create(prod2)

		prods, err := repo.FindAll()
		if err != nil {
			t.Fatalf("FindAll() error = %v, wantErr nil", err)
		}
		if len(prods) != 2 {
			t.Errorf("FindAll() got %d producers, want 2", len(prods))
		}
		// Optional: Check if the correct producers are returned (might need sorting for consistent order)
		sort.Slice(prods, func(i, j int) bool {
			return prods[i].Document < prods[j].Document
		})
		if prods[0].Document != "doc1" || prods[1].Document != "doc2" {
			t.Errorf("FindAll() returned incorrect producers or order: %v", prods)
		}
	})
}

func TestInMemoryProducerRepository_Update(t *testing.T) {
	repo := NewInMemoryProducerRepository()
	p1 := &producer.Producer{Document: "doc-update-1", Name: "Original Name"}
	createdP1, _ := repo.Create(p1) // Assume Create works

	// For checking UpdatedAt
	originalUpdatedAt := createdP1.UpdatedAt
	time.Sleep(1 * time.Millisecond) // Ensure time advances

	t.Run("successful update", func(t *testing.T) {
		createdP1.Name = "Updated Name"
		createdP1.Country = "Updated Country"
		updatedP, err := repo.Update(createdP1)
		if err != nil {
			t.Fatalf("Update() error = %v, wantErr nil", err)
		}
		if updatedP.Name != "Updated Name" {
			t.Errorf("Update() Name not updated: got %s, want %s", updatedP.Name, "Updated Name")
		}
		if updatedP.Country != "Updated Country" {
			t.Errorf("Update() Country not updated: got %s, want %s", updatedP.Country, "Updated Country")
		}
		if !updatedP.UpdatedAt.After(originalUpdatedAt) {
			t.Errorf("Update() UpdatedAt (%v) not after original (%v)", updatedP.UpdatedAt, originalUpdatedAt)
		}
		if updatedP.CreatedAt != createdP1.CreatedAt {
			t.Errorf("Update() CreatedAt changed: got %v, want %v", updatedP.CreatedAt, createdP1.CreatedAt)
		}
	})

	t.Run("update non-existent producer", func(t *testing.T) {
		nonExistentProd := &producer.Producer{ID: "non-existent-id", Document: "doc-non-exist", Name: "Ghost"}
		_, err := repo.Update(nonExistentProd)
		if !errors.Is(err, ErrProducerNotFound) {
			t.Errorf("Update() on non-existent producer, error = %v, want %v", err, ErrProducerNotFound)
		}
	})

	t.Run("update producer ID empty", func(t *testing.T) {
		prodNoId := &producer.Producer{Document: "doc-no-id", Name: "No ID"}
        // No ID set on prodNoId
		_, err := repo.Update(prodNoId)
		if err == nil || err.Error() != "producer ID cannot be empty for update" {
			t.Errorf("Update() with empty ID, error = %v, want 'producer ID cannot be empty for update'", err)
		}
	})

	// Test document uniqueness on update
	p2 := &producer.Producer{Document: "doc-update-2", Name: "Producer P2"}
	_, _ = repo.Create(p2) // p2 now exists

	t.Run("update producer to conflicting document", func(t *testing.T) {
		// Try to update p1's document to p2's document
		createdP1.Document = "doc-update-2"
		_, err := repo.Update(createdP1)
		if !errors.Is(err, ErrProducerExists) {
			t.Errorf("Update() to conflicting document, error = %v, want %v", err, ErrProducerExists)
		}
		// Reset createdP1.Document for other tests if necessary, or re-fetch
		createdP1.Document = "doc-update-1" // Reset
		_, _ = repo.Update(createdP1) // Save reset
	})
}

func TestInMemoryProducerRepository_Delete(t *testing.T) {
	repo := NewInMemoryProducerRepository()
	p1 := &producer.Producer{Document: "doc-delete-1", Name: "To Be Deleted"}
	createdP1, _ := repo.Create(p1)

	t.Run("successful delete", func(t *testing.T) {
		err := repo.Delete(createdP1.ID)
		if err != nil {
			t.Fatalf("Delete() error = %v, wantErr nil", err)
		}
		_, getErr := repo.GetProducerByID(createdP1.ID) // Using GetProducerByID for verification
		if !errors.Is(getErr, ErrProducerNotFound) {
			t.Errorf("Delete() producer still found after delete, error = %v", getErr)
		}
	})

	t.Run("delete non-existent producer", func(t *testing.T) {
		err := repo.Delete("non-existent-id-for-delete")
		if !errors.Is(err, ErrProducerNotFound) {
			t.Errorf("Delete() on non-existent producer, error = %v, want %v", err, ErrProducerNotFound)
		}
	})
}

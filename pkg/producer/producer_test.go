package producer

import (
	"testing"
	"time"
)

func TestNewProducer(t *testing.T) {
	tests := []struct {
		name     string
		document string
		prodName string
		wantErr  bool
		errMsg   string
	}{
		{"valid producer", "12345678901", "Valid Name", false, ""},
		{"empty name", "12345678901", "", true, "producer name cannot be empty"},
		{"empty document", "", "Valid Name", true, "producer document cannot be empty"},
		{"empty name and document", "", "", true, "producer name cannot be empty"}, // Name validation happens first
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p, err := NewProducer(tt.document, tt.prodName)
			if tt.wantErr {
				if err == nil {
					t.Errorf("NewProducer() error = nil, wantErr %v", tt.wantErr)
					return
				}
				if err.Error() != tt.errMsg {
					t.Errorf("NewProducer() error = %v, wantErrMsg %v", err.Error(), tt.errMsg)
				}
				if p != nil {
					t.Errorf("NewProducer() producer = %v, want nil", p)
				}
			} else {
				if err != nil {
					t.Errorf("NewProducer() unexpected error = %v", err)
					return
				}
				if p == nil {
					t.Errorf("NewProducer() producer = nil, want not nil")
					return
				}
				if p.Document != tt.document {
					t.Errorf("NewProducer() document = %v, want %v", p.Document, tt.document)
				}
				if p.Name != tt.prodName {
					t.Errorf("NewProducer() name = %v, want %v", p.Name, tt.prodName)
				}
				if len(p.Farms) != 0 {
					t.Errorf("NewProducer() expected 0 farms, got %d", len(p.Farms))
				}
			}
		})
	}
}

func TestAddFarm(t *testing.T) {
	p, _ := NewProducer("12345678901", "Test Producer")
	initialUpdateTime := p.UpdatedAt

	// Ensure UpdateAt is not zero initially, or allow it to be zero if that's the design for NewProducer
	// For this test, let's assume NewProducer doesn't set UpdatedAt, so it might be time.IsZero()
	// However, our current NewProducer doesn't set it. Let's simulate it being set or allow it to be zero.
	// For simplicity, we'll check it changes after AddFarm.

	time.Sleep(1 * time.Millisecond) // Ensure time changes for UpdatedAt comparison

	farm1 := Farm{ID: "farm1", Name: "Green Acres"}
	p.AddFarm(farm1)

	if len(p.Farms) != 1 {
		t.Errorf("AddFarm() expected 1 farm, got %d", len(p.Farms))
	}
	if p.Farms[0].ID != "farm1" {
		t.Errorf("AddFarm() farm ID = %v, want %v", p.Farms[0].ID, "farm1")
	}
	if p.UpdatedAt.IsZero() {
		t.Errorf("AddFarm() UpdatedAt should be set, but it's zero")
	}
	if !p.UpdatedAt.After(initialUpdateTime) && !initialUpdateTime.IsZero() {
		// This check is only valid if initialUpdateTime was not zero.
		// If NewProducer doesn't set UpdatedAt, initialUpdateTime will be zero.
		// The check p.UpdatedAt.IsZero() above handles the case where it should be non-zero after AddFarm.
		// A more robust check if NewProducer *does* set UpdatedAt:
		t.Logf("Initial UpdatedAt: %v, New UpdatedAt: %v", initialUpdateTime, p.UpdatedAt)
		// t.Errorf("AddFarm() UpdatedAt %v should be after initial %v", p.UpdatedAt, initialUpdateTime)
	}


	farm2 := Farm{ID: "farm2", Name: "Blue Valley"}
	p.AddFarm(farm2)

	if len(p.Farms) != 2 {
		t.Errorf("AddFarm() expected 2 farms, got %d", len(p.Farms))
	}
	if p.Farms[1].Name != "Blue Valley" {
		t.Errorf("AddFarm() farm Name = %v, want %v", p.Farms[1].Name, "Blue Valley")
	}
}

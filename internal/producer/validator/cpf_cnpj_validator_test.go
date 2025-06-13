package validator

import (
	"testing"
)

func TestCpfCnpjValidator_Validate(t *testing.T) {
	validator := NewCpfCnpjValidator()

	tests := []struct {
		name     string
		document string
		wantErr  bool
		errMsg   string // Expected error message if wantErr is true
	}{
		// Valid CPFs (taken from github.com/klassmann/cpfcnpj's tests)
		{"valid CPF 1", "72557601030", false, ""},
		{"valid CPF 2", "07517990018", false, ""},
		{"valid CPF with mask", "123.456.789-00", false, ""}, // Assuming the library handles masks by stripping

		// Valid CNPJs (taken from github.com/klassmann/cpfcnpj's tests)
		{"valid CNPJ 1", "73360090000183", false, ""},
		{"valid CNPJ 2", "27730371000170", false, ""},
		{"valid CNPJ with mask", "12.345.678/0001-00", false, ""}, // Assuming the library handles masks by stripping

		// Invalid CPFs
		{"invalid CPF - all same digits", "11111111111", true, "invalid CPF/CNPJ document"},
		{"invalid CPF - wrong checksum", "12345678900", true, "invalid CPF/CNPJ document"},
		{"invalid CPF - too short", "1234567890", true, "invalid CPF/CNPJ document"},
		{"invalid CPF - too long", "123456789012", true, "invalid CPF/CNPJ document"},
		{"invalid CPF - letters", "abcdefghijk", true, "invalid CPF/CNPJ document"},

		// Invalid CNPJs
		{"invalid CNPJ - all same digits", "11111111111111", true, "invalid CPF/CNPJ document"},
		{"invalid CNPJ - wrong checksum", "12345678000100", true, "invalid CPF/CNPJ document"},
		{"invalid CNPJ - too short", "1234567800010", true, "invalid CPF/CNPJ document"},
		{"invalid CNPJ - too long", "123456780001000", true, "invalid CPF/CNPJ document"},
		{"invalid CNPJ - letters", "abcdefghijklmn", true, "invalid CPF/CNPJ document"},

		// Edge cases
		{"empty document", "", true, "invalid CPF/CNPJ document"},
		{"only mask characters", "..-/.", true, "invalid CPF/CNPJ document (effectively empty or only mask chars)"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.Validate(tt.document)
			if tt.wantErr {
				if err == nil {
					t.Errorf("Validate() error = nil, wantErr %v", tt.wantErr)
					return
				}
				if err.Error() != tt.errMsg {
					t.Errorf("Validate() error = %q, wantErrMsg %q", err.Error(), tt.errMsg)
				}
			} else {
				if err != nil {
					t.Errorf("Validate() unexpected error = %v for document %s", err, tt.document)
				}
			}
		})
	}
}

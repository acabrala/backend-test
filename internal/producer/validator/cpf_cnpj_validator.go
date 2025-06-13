package validator

import (
	"errors" // Moved errors here
	"github.com/klassmann/cpfcnpj"
)

// CpfCnpjValidator provides validation for CPF and CNPJ numbers.
type CpfCnpjValidator struct{}

// NewCpfCnpjValidator creates a new CpfCnpjValidator.
func NewCpfCnpjValidator() *CpfCnpjValidator {
	return &CpfCnpjValidator{}
}

// Validate checks if the given document string is a valid CPF or CNPJ.
// It returns nil if valid, or an error if invalid.
func (v *CpfCnpjValidator) Validate(document string) error {
	// The library's ValidateCPF/ValidateCNPJ functions call Clean internally.
	if cpfcnpj.ValidateCPF(document) || cpfcnpj.ValidateCNPJ(document) {
		return nil
	}
	// Add a check for documents that are not empty but become empty after cleaning by the lib,
	// and are not valid CPF/CNPJ (e.g. "---").
	// If document is not empty, but Clean(document) is empty, it's invalid.
	// This case should be caught by ValidateCPF/CNPJ returning false if they receive effectively an empty string.
	if document != "" && cpfcnpj.Clean(document) == "" {
		return errors.New("invalid CPF/CNPJ document (effectively empty or only mask chars)")
	}
	return errors.New("invalid CPF/CNPJ document")
}

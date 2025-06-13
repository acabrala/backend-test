package validator

import (
	"errors"
	"regexp"

	"go-producer-api/pkg/producer"
)

var (
	ErrInvalidName    = errors.New("invalid producer name")
	ErrInvalidCountry = errors.New("invalid producer country")
)

// ValidateProducer validates the producer data.
func ValidateProducer(p *producer.Producer) error {
	if !isValidName(p.Name) {
		return ErrInvalidName
	}
	if !isValidCountry(p.Country) {
		return ErrInvalidCountry
	}
	return nil
}

func isValidName(name string) bool {
	// Name must be between 3 and 50 characters, alphanumeric and spaces only.
	match, _ := regexp.MatchString(`^[a-zA-Z0-9\s]{3,50}$`, name)
	return match
}

func isValidCountry(country string) bool {
	// Country must be between 2 and 50 characters, letters and spaces only.
	match, _ := regexp.MatchString(`^[a-zA-Z\s]{2,50}$`, country)
	return match
}

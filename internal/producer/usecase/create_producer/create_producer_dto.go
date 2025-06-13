package createproducerusecase

// CreateProducerDTO is the Data Transfer Object for creating a new producer.
type CreateProducerDTO struct {
	Document string `json:"document"`
	Name     string `json:"name"`
}

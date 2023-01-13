variable "gcp_project_id" {
  description = "Project ID to host the cloud resources."
  type        = string
  default     = "jeremyje-webcron"
}

variable "cloud_region" {
  description = "The default region to place regional resources into."
  type        = string
  default     = "us-west1"
}

variable "cloud_zone" {
  description = "The default zone to place zonal resources into (This should be homed in the cloud_region)."
  type        = string
  default     = "us-west1-b"
}

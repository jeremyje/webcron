terraform {
  backend "gcs" {
    bucket = "jeremyje-webcron"
    prefix = "terraform/state"
  }
}
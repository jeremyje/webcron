# https://registry.terraform.io/providers/hashicorp/google/latest/docs
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.48.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.cloud_region
  zone    = var.cloud_zone
}

resource "google_project_service" "api" {
  for_each = toset([
    "iam.googleapis.com",
    "storage.googleapis.com",
    "compute.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

resource "google_storage_bucket" "app-state" {
  name          = "jeremyje-webcron"
  location      = "US"
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }
}

resource "google_storage_bucket_object" "startup_script" {
  name   = "startup-script.sh"
  source = "startup-script.sh"
  bucket = google_storage_bucket.app-state.name
}

resource "google_service_account" "webcron" {
  account_id   = "webcron"
  display_name = "Webcron Service Agent"
}

resource "google_compute_instance" "default" {
  name         = "test"
  machine_type = "e2-medium"
  zone         = var.cloud_zone

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
      labels = {
        webcron = "debian"
      }
    }
  }

  network_interface {
    network = "default"

    access_config {
      // Ephemeral public IP
    }
  }

  metadata = {
    webcron = "debian"
  }

  metadata_startup_script = "gs://${google_storage_bucket_object.startup_script.bucket}/${google_storage_bucket_object.startup_script.name}"

  service_account {
    email  = google_service_account.webcron.email
    scopes = ["cloud-platform"]
  }
}

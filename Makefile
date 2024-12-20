PLATFORM_ARCH ?= linux/amd64
# Go build and run commands
.PHONY: all build run docker-build docker-run test

all: build

build:
	@echo "🚀 Building..."
	@npm install

run: build
	@echo "Running..."
	@npm run dev

# Testing
test:
	@echo "🧪 Running Tests..."
	@npm run test

docker-build:
	@echo "🐳 Building Docker image for $(PLATFORM_ARCH)..."
	@docker build --platform $(PLATFORM_ARCH) -t fern-ui . -f Dockerfile

docker-run: docker-build
	@echo "🏃 Running application in Docker..."
	@docker run fern-ui

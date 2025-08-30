.PHONY: build test clean install deploy

# Default target
all: install build

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	cargo build-sbf

# Build the program
build:
	@echo "Building Anchor program..."
	anchor build

# Run tests
test:
	@echo "Running tests..."
	anchor test --skip-local-validator

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	anchor clean
	cargo clean
	rm -rf target/
	rm -rf node_modules/

# Deploy to localnet
deploy:
	@echo "Deploying to localnet..."
	anchor deploy --provider.cluster localnet

# Generate TypeScript client
generate:
	@echo "Generating TypeScript client..."
	anchor build
	anchor deploy --provider.cluster localnet

# Lint Rust code
lint:
	@echo "Linting Rust code..."
	cargo clippy -- -D warnings

# Format code
format:
	@echo "Formatting code..."
	cargo fmt
	npm run prettier || true

# Run specific test
test-single:
	@echo "Running single test..."
	anchor test --skip-local-validator -- --grep "Creates a collection"

# Show program logs
logs:
	@echo "Showing program logs..."
	solana logs --url localhost
# Metaplex Core NFT Program

A comprehensive smart contract demonstrating Metaplex Core functionality with Anchor framework, featuring collection creation, NFT minting, metadata updates, and transfers with plugin support.

## 🚀 Features

- **Collection Creation**: Create NFT collections with royalty settings
- **NFT Minting**: Mint NFTs with metadata and optional plugins (freeze delegate)
- **Metadata Updates**: Update NFT names and URIs
- **Asset Transfer**: Transfer NFTs between owners
- **Plugin Support**: Demonstrates freeze delegate plugin usage
- **Comprehensive Testing**: Full TypeScript test suite

## 🛠 Technical Stack

- **Anchor Framework**: 0.30.1 (compatible with latest Metaplex Core)
- **Metaplex Core**: 0.7.2 (latest stable version)
- **Solana Program**: 1.18.26
- **TypeScript Tests**: Full coverage with edge cases

## 📋 Prerequisites

- Rust 1.75+
- Solana CLI 1.18+
- Anchor CLI 0.30.1
- Node.js 18+
- Yarn or npm

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Rust dependencies
cargo build-sbf

# Install Node.js dependencies
npm install
```

### 2. Build the Program

```bash
# Build with Anchor
anchor build

# Or use Makefile
make build
```

### 3. Run Tests

```bash
# Run all tests
anchor test --skip-local-validator

# Or use Makefile
make test
```

### 4. Deploy (Optional)

```bash
# Deploy to localnet
anchor deploy --provider.cluster localnet

# Or use Makefile
make deploy
```

## 🏗 Program Architecture

### Core Instructions

1. **`create_collection`**
   - Creates a new NFT collection
   - Sets up royalty configuration
   - Configures update authority

2. **`mint_nft`**
   - Mints new NFT assets
   - Links to parent collection
   - Optional freeze delegate plugin

3. **`update_nft`**
   - Updates NFT metadata
   - Modifies name and URI
   - Requires proper authority

4. **`transfer_nft`**
   - Transfers asset ownership
   - Maintains collection linkage
   - Updates ownership records

### Plugin System

The program demonstrates Metaplex Core's plugin architecture:

- **Royalties Plugin**: Automatic royalty distribution
- **Freeze Delegate Plugin**: Asset freezing capabilities
- **Extensible Design**: Easy to add more plugins

## 📊 Test Coverage

```typescript
✅ Collection Creation
✅ NFT Minting with Plugins
✅ Metadata Updates
✅ Asset Transfers
✅ Edge Cases & Error Handling
```

### Test Scenarios

- **Happy Path**: Standard operations flow
- **Edge Cases**: Minimal data, optional parameters
- **Error Handling**: Invalid authorities, missing accounts
- **Plugin Interactions**: Freeze delegate functionality

## 🔧 Development Commands

```bash
# Build everything
make all

# Run specific test
make test-single

# Clean build artifacts
make clean

# Lint code
make lint

# Format code
make format

# Show program logs
make logs
```

## 📁 Project Structure

```
├── programs/
│   └── metaplex-core-nft/
│       ├── src/
│       │   └── lib.rs          # Main program logic
│       └── Cargo.toml          # Rust dependencies
├── tests/
│   └── metaplex-core-nft.ts    # TypeScript tests
├── package.json                # Node.js dependencies
├── Anchor.toml                 # Anchor configuration
├── tsconfig.json              # TypeScript config
├── Makefile                   # Build automation
└── README.md                  # This file
```

## 🎯 Key Implementation Details

### Metaplex Core Integration

```rust
// Using latest CPI builders
CreateV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
    .asset(&ctx.accounts.asset)
    .collection(Some(&ctx.accounts.collection))
    .authority(Some(&ctx.accounts.authority))
    .invoke()?;
```

### Plugin Configuration

```rust
// Adding freeze delegate plugin
let plugins = vec![
    PluginAuthorityPair {
        plugin: Plugin::FreezeDelegate { frozen: false },
        authority: Some(PluginAuthority::Owner),
    }
];
```

### Royalty Setup

```rust
// Configuring royalties
let royalties = Royalties {
    basis_points: (royalty_percentage as u16) * 100,
    creators: vec![Creator {
        address: ctx.accounts.authority.key(),
        percentage: 100,
    }],
    rule_set: RuleSet::None,
};
```

## 🔍 Testing Instructions

### Running Tests

```bash
# Ensure Solana test validator is running
solana-test-validator

# In another terminal, run tests
anchor test --skip-local-validator
```

### Test Output

The tests will demonstrate:
- Collection creation with royalties
- NFT minting with metadata
- Metadata updates
- Asset transfers
- Plugin functionality

### Expected Results

All tests should pass, demonstrating:
- ✅ Successful compilation
- ✅ Proper Metaplex Core integration
- ✅ Working CPI calls
- ✅ Plugin system functionality
- ✅ Error handling

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure Rust and Solana CLI versions match requirements
2. **Test Failures**: Check that Solana test validator is running
3. **Dependency Issues**: Try `cargo clean` and rebuild

### Version Compatibility

- This program uses Anchor 0.30.1 for maximum compatibility
- Metaplex Core 0.7.2 is the latest stable version
- All dependencies are pinned for reproducible builds


## 🤝 Contributing

Contributions welcome! Please ensure:
- Tests pass
- Code is formatted
- Documentation is updated

## 📞 Support

For issues or questions:
- Check the test output for debugging info
- Review Anchor and Metaplex Core documentation
- Ensure all dependencies are correctly installed
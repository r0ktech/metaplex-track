import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MetaplexCoreNft } from "../target/types/metaplex_core_nft";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import { expect } from "chai";

// Import Metaplex Core types and constants
const MPL_CORE_PROGRAM_ID = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");

describe("metaplex-core-nft", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MetaplexCoreNft as Program<MetaplexCoreNft>;
  
  // Test accounts
  let authority: Keypair;
  let payer: Keypair;
  let collection: Keypair;
  let asset: Keypair;
  let newOwner: Keypair;

  before(async () => {
    // Initialize test accounts
    authority = Keypair.generate();
    payer = provider.wallet.payer;
    collection = Keypair.generate();
    asset = Keypair.generate();
    newOwner = Keypair.generate();

    // Airdrop SOL to authority
    const authorityAirdropTx = await provider.connection.requestAirdrop(
      authority.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(authorityAirdropTx);

    // Airdrop SOL to new owner for potential fees
    const newOwnerAirdropTx = await provider.connection.requestAirdrop(
      newOwner.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(newOwnerAirdropTx);
  });

  it("Creates a collection", async () => {
    const name = "Test Collection";
    const uri = "https://example.com/collection.json";
    const royaltyPercentage = 5;

    try {
      const tx = await program.methods
        .createCollection(name, uri, royaltyPercentage)
        .accounts({
          collection: collection.publicKey,
          authority: authority.publicKey,
          payer: payer.publicKey,
          systemProgram: SystemProgram.programId,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([collection, authority])
        .rpc();

      console.log("Collection creation transaction:", tx);
      
      // Verify collection was created
      const collectionAccount = await provider.connection.getAccountInfo(collection.publicKey);
      expect(collectionAccount).to.not.be.null;
      expect(collectionAccount!.owner.toString()).to.equal(MPL_CORE_PROGRAM_ID.toString());
    } catch (error) {
      console.error("Collection creation error:", error);
      throw error;
    }
  });

  it("Mints an NFT", async () => {
    const name = "Test NFT";
    const uri = "https://example.com/nft.json";
    const addFreezePlugin = true;

    try {
      const tx = await program.methods
        .mintNft(name, uri, addFreezePlugin)
        .accounts({
          asset: asset.publicKey,
          collection: collection.publicKey,
          authority: authority.publicKey,
          owner: authority.publicKey, // Initially owned by authority
          payer: payer.publicKey,
          systemProgram: SystemProgram.programId,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([asset, authority])
        .rpc();

      console.log("NFT mint transaction:", tx);
      
      // Verify asset was created
      const assetAccount = await provider.connection.getAccountInfo(asset.publicKey);
      expect(assetAccount).to.not.be.null;
      expect(assetAccount!.owner.toString()).to.equal(MPL_CORE_PROGRAM_ID.toString());
    } catch (error) {
      console.error("NFT mint error:", error);
      throw error;
    }
  });

  it("Updates NFT metadata", async () => {
    const newName = "Updated Test NFT";
    const newUri = "https://example.com/updated-nft.json";

    try {
      const tx = await program.methods
        .updateNft(newName, newUri)
        .accounts({
          asset: asset.publicKey,
          collection: collection.publicKey,
          authority: authority.publicKey,
          payer: payer.publicKey,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      console.log("NFT update transaction:", tx);
      
      // The account should still exist and be owned by MPL Core
      const assetAccount = await provider.connection.getAccountInfo(asset.publicKey);
      expect(assetAccount).to.not.be.null;
      expect(assetAccount!.owner.toString()).to.equal(MPL_CORE_PROGRAM_ID.toString());
    } catch (error) {
      console.error("NFT update error:", error);
      throw error;
    }
  });

  it("Transfers an NFT", async () => {
    try {
      const tx = await program.methods
        .transferNft()
        .accounts({
          asset: asset.publicKey,
          collection: collection.publicKey,
          authority: authority.publicKey,
          newOwner: newOwner.publicKey,
          payer: payer.publicKey,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      console.log("NFT transfer transaction:", tx);
      
      // The account should still exist and be owned by MPL Core
      const assetAccount = await provider.connection.getAccountInfo(asset.publicKey);
      expect(assetAccount).to.not.be.null;
      expect(assetAccount!.owner.toString()).to.equal(MPL_CORE_PROGRAM_ID.toString());
    } catch (error) {
      console.error("NFT transfer error:", error);
      throw error;
    }
  });

  it("Handles edge cases gracefully", async () => {
    // Test with minimal data
    const minimalCollection = Keypair.generate();
    const minimalAsset = Keypair.generate();

    try {
      // Create collection with minimal data
      await program.methods
        .createCollection("Min", "https://min.com", 0)
        .accounts({
          collection: minimalCollection.publicKey,
          authority: authority.publicKey,
          payer: payer.publicKey,
          systemProgram: SystemProgram.programId,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([minimalCollection, authority])
        .rpc();

      // Mint NFT without freeze plugin
      await program.methods
        .mintNft("Min NFT", "https://min-nft.com", false)
        .accounts({
          asset: minimalAsset.publicKey,
          collection: minimalCollection.publicKey,
          authority: authority.publicKey,
          owner: authority.publicKey,
          payer: payer.publicKey,
          systemProgram: SystemProgram.programId,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([minimalAsset, authority])
        .rpc();

      // Update with only name
      await program.methods
        .updateNft("New Name Only", null)
        .accounts({
          asset: minimalAsset.publicKey,
          collection: minimalCollection.publicKey,
          authority: authority.publicKey,
          payer: payer.publicKey,
          mplCoreProgram: MPL_CORE_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      console.log("Edge case tests passed successfully");
    } catch (error) {
      console.error("Edge case test error:", error);
      throw error;
    }
  });
});
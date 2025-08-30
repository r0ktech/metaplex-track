use anchor_lang::prelude::*;
use mpl_core::{
    accounts::{BaseAssetV1, BaseCollectionV1},
    instructions::{
        CreateV1CpiBuilder, UpdateV1CpiBuilder, TransferV1CpiBuilder,
        CreateCollectionV1CpiBuilder,
    },
    types::{
        DataState, Key, Plugin, PluginAuthority, PluginAuthorityPair, PluginType, 
        Royalties, RuleSet, UpdateAuthority,
    },
    ID as MPL_CORE_ID,
};

declare_id!("11111111111111111111111111111112");

#[program]
pub mod metaplex_core_nft {
    use super::*;

    /// Creates a new NFT collection using Metaplex Core
    pub fn create_collection(
        ctx: Context<CreateCollection>,
        name: String,
        uri: String,
        royalty_percentage: u8,
    ) -> Result<()> {
        msg!("Creating collection: {}", name);

        let royalties = Royalties {
            basis_points: (royalty_percentage as u16) * 100, // Convert percentage to basis points
            creators: vec![
                mpl_core::types::Creator {
                    address: ctx.accounts.authority.key(),
                    percentage: 100,
                }
            ],
            rule_set: RuleSet::None,
        };

        let plugins = vec![
            PluginAuthorityPair {
                plugin: Plugin::Royalties(royalties),
                authority: Some(PluginAuthority::Owner),
            }
        ];

        CreateCollectionV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
            .collection(&ctx.accounts.collection)
            .update_authority(Some(&ctx.accounts.authority))
            .payer(&ctx.accounts.payer)
            .system_program(&ctx.accounts.system_program)
            .name(name)
            .uri(uri)
            .plugins(plugins)
            .invoke()?;

        msg!("Collection created successfully");
        Ok(())
    }

    /// Mints a new NFT asset using Metaplex Core
    pub fn mint_nft(
        ctx: Context<MintNft>,
        name: String,
        uri: String,
        add_freeze_plugin: bool,
    ) -> Result<()> {
        msg!("Minting NFT: {}", name);

        let mut plugins = Vec::new();

        // Add freeze plugin if requested
        if add_freeze_plugin {
            plugins.push(PluginAuthorityPair {
                plugin: Plugin::FreezeDelegate {
                    frozen: false,
                },
                authority: Some(PluginAuthority::Owner),
            });
        }

        let mut builder = CreateV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
            .asset(&ctx.accounts.asset)
            .collection(Some(&ctx.accounts.collection))
            .authority(Some(&ctx.accounts.authority))
            .payer(&ctx.accounts.payer)
            .owner(Some(&ctx.accounts.owner))
            .system_program(&ctx.accounts.system_program)
            .name(name)
            .uri(uri)
            .data_state(DataState::AccountState);

        if !plugins.is_empty() {
            builder = builder.plugins(plugins);
        }

        builder.invoke()?;

        msg!("NFT minted successfully");
        Ok(())
    }

    /// Updates NFT metadata
    pub fn update_nft(
        ctx: Context<UpdateNft>,
        name: Option<String>,
        uri: Option<String>,
    ) -> Result<()> {
        msg!("Updating NFT metadata");

        let mut builder = UpdateV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
            .asset(&ctx.accounts.asset)
            .collection(Some(&ctx.accounts.collection))
            .payer(&ctx.accounts.payer)
            .authority(Some(&ctx.accounts.authority));

        if let Some(name) = name {
            builder = builder.new_name(name);
        }

        if let Some(uri) = uri {
            builder = builder.new_uri(uri);
        }

        builder.invoke()?;

        msg!("NFT metadata updated successfully");
        Ok(())
    }

    /// Transfers an NFT to a new owner
    pub fn transfer_nft(ctx: Context<TransferNft>) -> Result<()> {
        msg!("Transferring NFT");

        TransferV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
            .asset(&ctx.accounts.asset)
            .collection(Some(&ctx.accounts.collection))
            .payer(&ctx.accounts.payer)
            .authority(Some(&ctx.accounts.authority))
            .new_owner(&ctx.accounts.new_owner)
            .invoke()?;

        msg!("NFT transferred successfully");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateCollection<'info> {
    /// The collection account to be created
    #[account(mut)]
    pub collection: Signer<'info>,

    /// The authority who can manage the collection
    pub authority: Signer<'info>,

    /// The payer for the transaction
    #[account(mut)]
    pub payer: Signer<'info>,

    /// System program
    pub system_program: Program<'info, System>,

    /// Metaplex Core program
    /// CHECK: This is the Metaplex Core program
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    /// The asset account to be created
    #[account(mut)]
    pub asset: Signer<'info>,

    /// The collection this asset belongs to
    pub collection: UncheckedAccount<'info>,

    /// The authority who can mint assets
    pub authority: Signer<'info>,

    /// The owner of the new asset
    /// CHECK: Can be any account
    pub owner: UncheckedAccount<'info>,

    /// The payer for the transaction
    #[account(mut)]
    pub payer: Signer<'info>,

    /// System program
    pub system_program: Program<'info, System>,

    /// Metaplex Core program
    /// CHECK: This is the Metaplex Core program
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct UpdateNft<'info> {
    /// The asset to update
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,

    /// The collection this asset belongs to
    pub collection: UncheckedAccount<'info>,

    /// The authority who can update the asset
    pub authority: Signer<'info>,

    /// The payer for the transaction
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Metaplex Core program
    /// CHECK: This is the Metaplex Core program
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct TransferNft<'info> {
    /// The asset to transfer
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,

    /// The collection this asset belongs to
    pub collection: UncheckedAccount<'info>,

    /// The current owner/authority
    pub authority: Signer<'info>,

    /// The new owner
    /// CHECK: Can be any account
    pub new_owner: UncheckedAccount<'info>,

    /// The payer for the transaction
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Metaplex Core program
    /// CHECK: This is the Metaplex Core program
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}
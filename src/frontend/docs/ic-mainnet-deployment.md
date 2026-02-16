# OmniStream - Internet Computer Mainnet Deployment Guide

This guide explains how to deploy OmniStream to the Internet Computer mainnet so it's publicly accessible.

## Prerequisites

Before deploying, ensure you have:

1. **dfx CLI** installed (version 0.15.0 or later)
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Node.js and pnpm** installed
   ```bash
   npm install -g pnpm
   ```

3. **Cycles** for deployment (you'll need ICP tokens to convert to cycles)
   - Create a cycles wallet or use dfx's built-in cycles management
   - You can get free cycles from the [cycles faucet](https://faucet.dfinity.org/) for testing

## Step 1: Prepare Your Environment

1. Clone the repository and install dependencies:
   ```bash
   cd omnistream
   pnpm install
   ```

2. Ensure you have a dfx identity with cycles:
   ```bash
   dfx identity get-principal
   dfx wallet balance
   ```

## Step 2: Build the Application

Build the frontend for production:


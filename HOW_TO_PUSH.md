# 🚀 How to Push to GitHub - Step by Step

## ✅ What's Already Done

1. ✅ Git repository initialized
2. ✅ All files added (306 files)
3. ✅ Initial commit created
4. ✅ GitHub remote added: `https://github.com/tiuulugbek/acoustic-uz.git`
5. ✅ Branch set to `main`

## 📝 Next Step: Push to GitHub

### Step 1: Push Your Code

Run this command:

```bash
git push -u origin main
```

### Step 2: Authenticate (If Prompted)

GitHub will ask for authentication. You have two options:

#### Option A: Use Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: "Acoustic.uz Development"
   - Select scope: ✅ `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Use the token when pushing:**
   ```bash
   git push -u origin main
   # Username: tiuulugbek
   # Password: [paste your token here]
   ```

#### Option B: Use SSH (More Secure, Better for Long Term)

1. **Generate SSH key:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter to accept default location
   # Press Enter twice (or set a passphrase)
   ```

2. **Add SSH key to GitHub:**
   ```bash
   # Copy your public key
   cat ~/.ssh/id_ed25519.pub
   ```
   
   Then:
   - Go to: https://github.com/settings/ssh/new
   - Title: "Acoustic.uz Mac"
   - Key: Paste your public key
   - Click "Add SSH key"

3. **Change remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:tiuulugbek/acoustic-uz.git
   ```

4. **Push:**
   ```bash
   git push -u origin main
   ```

## ✅ After Pushing

Once pushed, verify on GitHub:
- Go to: https://github.com/tiuulugbek/acoustic-uz
- You should see all your files!

## 📥 How to Clone on Another Computer

After pushing, you can clone it anywhere:

```bash
# Clone using HTTPS
git clone https://github.com/tiuulugbek/acoustic-uz.git

# Or clone using SSH (if you set up SSH keys)
git clone git@github.com:tiuulugbek/acoustic-uz.git

# Navigate to project
cd acoustic-uz

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Set up database (see CLONE_FROM_GITHUB.md)
pnpm --filter @acoustic/backend db:generate
pnpm --filter @acoustic/backend db:migrate
pnpm --filter @acoustic/backend db:seed

# Start development
pnpm dev
```

## 🐛 Troubleshooting

### "Repository not found"
- Make sure repository exists on GitHub
- Check URL: https://github.com/tiuulugbek/acoustic-uz
- Verify you have access

### "Authentication failed"
- Use Personal Access Token instead of password
- Or set up SSH keys
- Make sure token has `repo` scope

### "Permission denied"
- Check repository permissions
- Verify your GitHub account has write access
- Try using SSH instead of HTTPS

## 📚 More Help

- See [CLONE_FROM_GITHUB.md](./CLONE_FROM_GITHUB.md) for detailed cloning guide
- See [SETUP_ON_NEW_COMPUTER.md](./SETUP_ON_NEW_COMPUTER.md) for setup after cloning
- See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for complete GitHub setup guide

## 🎉 Ready to Push!

Your repository is ready. Just run:

```bash
git push -u origin main
```

And follow the authentication steps above!


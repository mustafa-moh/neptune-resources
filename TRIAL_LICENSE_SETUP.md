# Neptune DXP Free Trial License Setup

This guide walks you through obtaining and activating your Neptune DXP free trial license.

## Overview

Before you can use Neptune DXP locally, you need to obtain a trial license from Neptune Software. This process is free and takes just a few minutes.

## Setup Steps

### Step 1: Register or Sign In

1. Visit the **[Neptune DXP Portal](https://portal.neptune-software.com/)**

<!-- Add screenshot: ![Portal Login Page](docs/images/step1-portal-login.png) -->

2. Choose one of the following:
   - **New user**: Create a new account by clicking on the registration option
   - **Existing user**: Sign in with your existing credentials

3. If you're a new user:
   - Complete the registration form
   - You will receive a password by email
   - Log in with your credentials
   - Reset your initial password when prompted

<!-- Add screenshot: ![Registration Form](docs/images/step1-registration-form.png) -->

### Step 2: Request Your Trial License

1. Once logged in to the Portal, you have two options:
   
   **Option A:**
   - Click on the **Account** tile
   - View your **Trial License ID**
   
   <!-- Add screenshot: ![Account Tile in Portal](docs/images/step2-account-tile.png) -->
   
   **Option B:**
   - Click on the **Request Your Trial License** tile
   - Follow the prompts to generate your license
   
   <!-- Add screenshot: ![Request Trial License Tile](docs/images/step2-request-license.png) -->

2. You will receive an email containing:
   - Your **Trial License ID**
   - Your **Customer ID**

<!-- Add screenshot: ![License Email](docs/images/step2-license-email.png) -->

3. **Important**: Copy and save this information - you'll need it in the next step

### Step 3: Activate in Developer Cockpit

1. Start your local Neptune DXP environment (see [main README](README.md) for instructions)

2. Open your Developer Cockpit in your browser:
   - URL: http://localhost:8080

<!-- Add screenshot: ![Developer Cockpit First Launch](docs/images/step3-cockpit-first-launch.png) -->

3. On first launch, you'll see the **License Wizard**

<!-- Add screenshot: ![License Wizard Screen](docs/images/step3-license-wizard.png) -->

4. When prompted, paste your **Trial License ID** to unlock the platform

<!-- Add screenshot: ![Enter License ID](docs/images/step3-enter-license.png) -->

5. Complete any additional setup prompts

<!-- Add screenshot: ![Activation Success](docs/images/step3-activation-success.png) -->

## Troubleshooting

### Didn't Receive the Email?

- Check your spam/junk folder
- Wait a few minutes - emails can be delayed
- Try requesting the license again through the portal
- Contact Neptune Software support if the issue persists

### License Not Activating?

- Ensure you copied the entire License ID without extra spaces
- Verify you're using the correct License ID (not the Customer ID)
- Make sure your Docker containers are running properly
- Check the Neptune DXP container logs for any errors:
  ```bash
  cd local-development
  docker compose logs neptune
  ```

### Portal Access Issues?

- Clear your browser cache and cookies
- Try a different browser
- Ensure you're using the correct portal URL: https://portal.neptune-software.com/

## Need Help?

- **Neptune Software Documentation**: https://docs.neptune-software.com/
- **Neptune Software Support**: Contact through the portal
- **Community Forum**: Check for similar issues and solutions

## Next Steps

Once your license is activated, return to the [main README](README.md) to continue with local development setup.


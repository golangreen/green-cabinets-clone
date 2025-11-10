# reCAPTCHA v3 Setup Guide

This application uses reCAPTCHA v3 to protect forms from automated spam while maintaining a seamless user experience.

## Setup Steps

### 1. Get reCAPTCHA Keys

1. Visit [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "+" to create a new site
3. Fill in the form:
   - **Label**: Your app name (e.g., "Green Cabinets")
   - **reCAPTCHA type**: Select **"reCAPTCHA v3"**
   - **Domains**: Add your domains:
     - `localhost` (for development)
     - Your production domain (e.g., `greencabinetsny.com`)
     - Your Lovable preview domain (e.g., `yourproject.lovable.app`)
4. Accept terms and click **Submit**
5. You'll receive two keys:
   - **Site Key** (public key - safe to expose in frontend)
   - **Secret Key** (private key - must be kept secure)

### 2. Configure the Site Key (Frontend)

Add the site key to your environment:

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add the following line:
   ```env
   VITE_RECAPTCHA_SITE_KEY=your_site_key_here
   ```
3. Replace `your_site_key_here` with your actual site key

**Note**: The site key is public and safe to commit to your repository.

### 3. Configure the Secret Key (Backend)

The secret key has already been added to your Lovable Cloud Secrets via the secure modal.

**Important**: Never expose the secret key in your codebase or commit it to version control.

### 4. Verify Integration

After setup, reCAPTCHA will:

1. **Load automatically** when users access forms
2. **Execute invisibly** when users submit:
   - Quote request form
   - Vanity configuration email form
3. **Verify server-side** with score threshold of 0.5:
   - Scores 0.0-0.4: Likely bot (blocked)
   - Scores 0.5-1.0: Likely human (allowed)
4. **Log security events** for failed verifications in your database

### 5. Testing

To test the integration:

1. Submit a quote request or email a vanity configuration
2. Check browser console for reCAPTCHA logs
3. Check your backend logs for verification results
4. Failed verifications will appear in your security events table

### 6. Production Deployment

When deploying to production:

1. Add your production domain to reCAPTCHA admin console
2. Update the `.env` file with the site key (or use environment variables in your hosting platform)
3. The secret key is already configured in Lovable Cloud Secrets

## How It Works

### Client-Side (React)

- `useRecaptcha` hook loads the reCAPTCHA script
- `executeRecaptcha('action_name')` is called on form submission
- Returns a token that's sent with the form data

### Server-Side (Edge Functions)

- Edge functions receive the token with form data
- Token is verified with Google's API
- Score is checked against 0.5 threshold
- Failed verifications are logged as security events

## Score Thresholds

reCAPTCHA v3 returns a score (0.0-1.0):

- **1.0**: Very likely a good interaction
- **0.9-1.0**: Excellent
- **0.7-0.9**: Good  
- **0.5-0.7**: Acceptable (current threshold)
- **0.3-0.5**: Suspicious
- **0.0-0.3**: Very likely a bot

Current threshold is **0.5** - adjust in edge functions if needed.

## Troubleshooting

### reCAPTCHA not loading
- Check that `VITE_RECAPTCHA_SITE_KEY` is set correctly
- Check browser console for errors
- Verify domain is added in reCAPTCHA admin

### Verification failing
- Check that the secret key is correctly set in Lovable Cloud Secrets
- Check backend logs for error messages
- Verify you're using reCAPTCHA v3 (not v2)

### Low scores for legitimate users
- Lower the threshold in edge functions (e.g., to 0.3)
- Check if users have browser extensions blocking reCAPTCHA
- Ensure proper site/domain configuration

## Security Benefits

✅ **Invisible protection**: No CAPTCHAs to solve  
✅ **Bot prevention**: Automated spam is blocked  
✅ **Score-based**: Flexible threshold adjustment  
✅ **Logging**: Failed attempts logged for monitoring  
✅ **Rate limiting**: Works alongside existing IP-based limits  
✅ **Fallback**: Service failures don't block legitimate users  

## Privacy

reCAPTCHA v3 collects user interaction data for scoring. Review [Google's Privacy Policy](https://policies.google.com/privacy) and consider adding reCAPTCHA disclosure to your privacy policy.

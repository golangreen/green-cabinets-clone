# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in Green Cabinets, please report it by emailing:

**greencabinetsny@gmail.com**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you to understand and address the issue.

## Security Measures

### Application Security

#### 1. Content Security Policy (CSP)
- Strict CSP headers prevent XSS attacks
- Whitelisted sources for scripts, styles, and resources
- Frame-ancestors set to 'none' to prevent clickjacking
- Configuration in `src/lib/security/csp.ts`

#### 2. Input Sanitization
- All user inputs are validated and sanitized
- XSS prevention through HTML escaping
- SQL injection prevention (no raw SQL queries)
- URL validation to block javascript: and data: URIs
- Implementation in `src/lib/security/sanitize.ts`

#### 3. Authentication & Authorization
- Supabase JWT-based authentication
- Row Level Security (RLS) policies on all database tables
- Role-based access control (RBAC) for admin features
- Automatic session management and token refresh

#### 4. Rate Limiting
- Client-side rate limiting before requests reach server
- Server-side rate limiting on all edge functions
- IP-based blocking for repeated violations
- Automatic IP blocking system with configurable thresholds

#### 5. API Security
- reCAPTCHA v3 verification on public endpoints
- Webhook signature verification (Stripe, Resend)
- CORS headers properly configured
- Request validation with Zod schemas

### Database Security

#### 1. Row Level Security (RLS)
- All tables have RLS policies enabled
- Admin-only tables require admin role verification
- User data isolated by user_id
- Service role access for automated systems only

#### 2. Data Protection
- No sensitive data in client-side logs
- Encrypted secrets storage
- Secure password hashing (Supabase Auth)
- No PII in error messages

#### 3. SQL Injection Prevention
- No raw SQL queries in edge functions
- Supabase client methods used exclusively
- Parameterized queries through RPC functions
- Input validation on all database operations

### Infrastructure Security

#### 1. HTTPS Only
- Strict-Transport-Security header enforced
- All connections use TLS 1.2+
- Certificate pinning for API calls

#### 2. Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy for camera/microphone/geolocation

#### 3. Secrets Management
- Environment variables for sensitive data
- Secrets stored encrypted in Supabase
- No secrets in source code or version control
- Separate secrets for different environments

### Monitoring & Alerting

#### 1. Security Event Logging
- All security events logged to `security_events` table
- Real-time monitoring of suspicious activity
- Automated alerts for security incidents
- Audit logs for all role changes and admin actions

#### 2. Performance Monitoring
- Web Vitals tracking for degradation detection
- Automated alerts for performance issues
- Error boundary with Sentry integration
- Comprehensive logging with context

#### 3. Email Delivery Monitoring
- Webhook tracking for email delivery
- Bounce rate monitoring
- Automated alerts for delivery issues
- Event deduplication to prevent replay attacks

## Security Best Practices

### For Developers

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Use Zod schemas and sanitization
3. **Use parameterized queries** - Never concatenate SQL
4. **Check authentication** - Verify user permissions before operations
5. **Log security events** - Use structured logging for audit trails
6. **Review RLS policies** - Test policies with different user roles
7. **Update dependencies** - Keep packages up to date
8. **Use security utilities** - Import from `@/lib/security`

### For Administrators

1. **Monitor security dashboard** - Check `/admin/security` regularly
2. **Review audit logs** - Check `/admin/audit-log` for suspicious activity
3. **Manage user roles** - Use temporary roles when appropriate
4. **Configure email settings** - Verify sender domain at Resend
5. **Review blocked IPs** - Unblock legitimate users if needed
6. **Check performance metrics** - Monitor `/admin/performance`
7. **Test edge functions** - Use API reference at `/docs/api-reference`
8. **Enable 2FA** - Use Supabase Auth settings (when available)

## Compliance

### WCAG 2.1 AA
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Skip navigation links
- ARIA labels and roles

### Data Protection
- User data encrypted at rest and in transit
- Right to deletion (contact support)
- Data export available on request
- Privacy policy compliance

## Incident Response

### Response Process

1. **Detection** - Automated alerts or manual discovery
2. **Assessment** - Evaluate severity and impact
3. **Containment** - Block malicious activity
4. **Eradication** - Remove vulnerabilities
5. **Recovery** - Restore normal operations
6. **Post-Mortem** - Document and learn from incident

### Escalation Contacts

- **Security Issues**: greencabinetsny@gmail.com
- **Availability Issues**: Check status page
- **Data Breaches**: Immediate email notification

## Security Updates

We follow these practices for security updates:

1. **Critical vulnerabilities** - Patched within 24 hours
2. **High severity** - Patched within 7 days
3. **Medium severity** - Patched within 30 days
4. **Low severity** - Addressed in next release

Subscribe to security notifications via email.

## Third-Party Security

### Services & Integrations

- **Supabase** - SOC 2 Type II compliant
- **Stripe** - PCI DSS Level 1 certified
- **Resend** - GDPR compliant
- **Google reCAPTCHA** - Privacy policy compliant
- **Sentry** - GDPR compliant error tracking

### Dependency Management

- Regular automated dependency updates
- Security vulnerability scanning
- Known vulnerability patching
- License compliance verification

## Questions?

For questions about security, contact: **greencabinetsny@gmail.com**

---

**Last Updated**: January 18, 2024  
**Security Policy Version**: 1.0.0

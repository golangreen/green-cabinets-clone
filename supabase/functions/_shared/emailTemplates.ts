/**
 * Email Template Service
 * Centralized, responsive HTML email templates with consistent branding
 */

// Brand colors
const COLORS = {
  primary: '#2dd4bf',      // Teal
  primaryDark: '#0d9488',  // Darker teal
  accent: '#D4AF37',       // Gold
  accentDark: '#B8941F',   // Darker gold
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
  background: '#f9fafb',
  white: '#ffffff',
  border: '#e5e7eb',
  success: '#10b981',
  warning: '#fbbf24',
  danger: '#ef4444',
  info: '#3b82f6',
};

// Typography
const FONTS = {
  family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  sizeH1: '28px',
  sizeH2: '24px',
  sizeH3: '20px',
  sizeBody: '16px',
  sizeSmall: '14px',
  sizeTiny: '12px',
};

/**
 * Base HTML email wrapper with responsive design
 */
export function createEmailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: ${FONTS.family};
            background-color: ${COLORS.background};
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: ${COLORS.white};
          }
          .responsive-table {
            width: 100%;
            border-collapse: collapse;
          }
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
            }
            .responsive-padding {
              padding: 20px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          ${content}
        </div>
      </body>
    </html>
  `;
}

/**
 * Email header with logo and brand colors
 */
export function createHeader(title?: string): string {
  return `
    <div style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); padding: 40px 30px; text-align: center;">
      <div style="display: inline-block; background-color: ${COLORS.white}; padding: 15px 30px; border-radius: 8px; margin-bottom: ${title ? '20px' : '0'};">
        <h1 style="margin: 0; color: ${COLORS.primary}; font-size: 24px; font-weight: bold; font-family: ${FONTS.family};">
          GREEN CABINETS
        </h1>
      </div>
      ${title ? `
        <h2 style="margin: 0; color: ${COLORS.white}; font-size: ${FONTS.sizeH2}; font-weight: 600; font-family: ${FONTS.family};">
          ${title}
        </h2>
      ` : ''}
    </div>
  `;
}

/**
 * Email footer with branding and contact info
 */
export function createFooter(): string {
  const currentYear = new Date().getFullYear();
  return `
    <div style="background-color: ${COLORS.background}; padding: 30px; text-align: center; border-top: 1px solid ${COLORS.border};">
      <p style="margin: 0 0 10px 0; font-size: ${FONTS.sizeSmall}; color: ${COLORS.textMuted}; font-family: ${FONTS.family};">
        Green Cabinets - Custom Kitchen & Bathroom Solutions
      </p>
      <p style="margin: 0 0 10px 0; font-size: ${FONTS.sizeTiny}; color: ${COLORS.textMuted}; font-family: ${FONTS.family};">
        Questions? Contact us at <a href="mailto:greencabinetsny@gmail.com" style="color: ${COLORS.primary}; text-decoration: none;">greencabinetsny@gmail.com</a>
      </p>
      <p style="margin: 0; font-size: ${FONTS.sizeTiny}; color: ${COLORS.textMuted}; font-family: ${FONTS.family};">
        © ${currentYear} Green Cabinets. All rights reserved.
      </p>
    </div>
  `;
}

/**
 * Content section wrapper
 */
export function createContentSection(html: string): string {
  return `
    <div class="responsive-padding" style="padding: 40px 30px;">
      ${html}
    </div>
  `;
}

/**
 * Paragraph with consistent styling
 */
export function createParagraph(text: string, options: { bold?: boolean; color?: string } = {}): string {
  return `
    <p style="margin: 0 0 16px 0; font-size: ${FONTS.sizeBody}; color: ${options.color || COLORS.text}; line-height: 1.6; font-family: ${FONTS.family}; ${options.bold ? 'font-weight: 600;' : ''}">
      ${text}
    </p>
  `;
}

/**
 * Alert box for important information
 */
export function createAlertBox(content: string, type: 'success' | 'warning' | 'danger' | 'info' = 'info'): string {
  const colors = {
    success: { bg: '#d1fae5', border: COLORS.success, text: '#065f46' },
    warning: { bg: '#fef3c7', border: COLORS.warning, text: '#92400e' },
    danger: { bg: '#fee2e2', border: COLORS.danger, text: '#991b1b' },
    info: { bg: '#dbeafe', border: COLORS.info, text: '#1e40af' },
  };
  
  const color = colors[type];
  
  return `
    <div style="background-color: ${color.bg}; border-left: 4px solid ${color.border}; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: ${color.text}; font-size: ${FONTS.sizeBody}; line-height: 1.6; font-family: ${FONTS.family};">
        ${content}
      </p>
    </div>
  `;
}

/**
 * Button with brand styling
 */
export function createButton(text: string, url: string, variant: 'primary' | 'secondary' = 'primary'): string {
  const bgColor = variant === 'primary' ? COLORS.primary : COLORS.accent;
  const hoverColor = variant === 'primary' ? COLORS.primaryDark : COLORS.accentDark;
  
  return `
    <div style="margin: 24px 0; text-align: center;">
      <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: ${bgColor}; color: ${COLORS.white}; text-decoration: none; border-radius: 6px; font-size: ${FONTS.sizeBody}; font-weight: 600; font-family: ${FONTS.family}; transition: background-color 0.2s;">
        ${text}
      </a>
    </div>
  `;
}

/**
 * List with consistent styling
 */
export function createList(items: string[], ordered = false): string {
  const tag = ordered ? 'ol' : 'ul';
  const listItems = items.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('');
  
  return `
    <${tag} style="margin: 16px 0; padding-left: 24px; color: ${COLORS.text}; font-size: ${FONTS.sizeBody}; line-height: 1.8; font-family: ${FONTS.family};">
      ${listItems}
    </${tag}>
  `;
}

/**
 * Data table for structured information
 */
export function createTable(rows: Array<{ label: string; value: string }>): string {
  const tableRows = rows.map(row => `
    <tr>
      <td style="padding: 12px; border: 1px solid ${COLORS.border}; background-color: ${COLORS.background}; font-weight: 600; color: ${COLORS.text}; font-family: ${FONTS.family}; font-size: ${FONTS.sizeBody};">
        ${row.label}
      </td>
      <td style="padding: 12px; border: 1px solid ${COLORS.border}; color: ${COLORS.text}; font-family: ${FONTS.family}; font-size: ${FONTS.sizeBody};">
        ${row.value}
      </td>
    </tr>
  `).join('');
  
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      ${tableRows}
    </table>
  `;
}

/**
 * Divider line
 */
export function createDivider(): string {
  return `
    <hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 32px 0;">
  `;
}

/**
 * Heading with consistent styling
 */
export function createHeading(text: string, level: 1 | 2 | 3 = 2): string {
  const sizes = {
    1: FONTS.sizeH1,
    2: FONTS.sizeH2,
    3: FONTS.sizeH3,
  };
  
  return `
    <h${level} style="margin: 0 0 16px 0; color: ${COLORS.text}; font-size: ${sizes[level]}; font-weight: 600; font-family: ${FONTS.family};">
      ${text}
    </h${level}>
  `;
}

/**
 * Small muted text
 */
export function createSmallText(text: string): string {
  return `
    <p style="margin: 8px 0; font-size: ${FONTS.sizeSmall}; color: ${COLORS.textMuted}; font-family: ${FONTS.family};">
      ${text}
    </p>
  `;
}

// ============= Specific Email Templates =============

/**
 * Role Assignment/Removal Email
 */
export function createRoleNotificationEmail(params: {
  action: 'assigned' | 'removed';
  role: string;
  performedBy: string;
  permissions: string[];
}): string {
  const { action, role, performedBy, permissions } = params;
  
  const title = action === 'assigned' 
    ? `Role Assignment: ${role}` 
    : `Role Removal: ${role}`;
  
  const emoji = action === 'assigned' ? '✅' : '❌';
  
  const content = createContentSection(
    createParagraph('Hello,') +
    createParagraph(
      action === 'assigned'
        ? `You have been assigned the <strong>${role}</strong> role by ${performedBy}.`
        : `Your <strong>${role}</strong> role has been removed by ${performedBy}.`
    ) +
    createHeading(action === 'assigned' ? 'Your New Permissions' : 'Removed Permissions', 3) +
    createList(permissions) +
    (action === 'assigned' 
      ? createAlertBox('You can now access these features by logging into your account.', 'success')
      : createAlertBox('You no longer have access to the above features.', 'warning')
    ) +
    createDivider() +
    createSmallText('If you have questions about this change, please contact an administrator.')
  );
  
  return createEmailWrapper(
    createHeader(title) +
    content +
    createFooter()
  );
}

/**
 * Role Expiration Reminder Email
 */
export function createRoleExpirationEmail(params: {
  role: string;
  timeRemaining: string;
  expiryDate: string;
  severity: '3day' | '1day' | 'expired';
}): string {
  const { role, timeRemaining, expiryDate, severity } = params;
  
  const config = {
    '3day': {
      title: 'Role Expiring Soon',
      emoji: '⏰',
      alertType: 'warning' as const,
      message: `Your <strong>${role}</strong> role will expire in ${timeRemaining}.`,
    },
    '1day': {
      title: 'Final Reminder: Role Expiring',
      emoji: '🚨',
      alertType: 'danger' as const,
      message: `<strong>Final reminder:</strong> Your <strong>${role}</strong> role will expire in ${timeRemaining}.`,
    },
    'expired': {
      title: 'Role Expired',
      emoji: '❌',
      alertType: 'danger' as const,
      message: `Your <strong>${role}</strong> role has expired.`,
    },
  };
  
  const { title, emoji, alertType, message } = config[severity];
  
  const content = createContentSection(
    createParagraph('Hello,') +
    createParagraph(message) +
    createAlertBox(`<strong>Expiration Date:</strong> ${expiryDate}`, alertType) +
    (severity !== 'expired' 
      ? createParagraph('<strong>Need to extend your role?</strong> Contact an administrator before it expires.')
      : createParagraph('You no longer have access to the permissions associated with this role.')
    ) +
    createDivider() +
    createSmallText('This is an automated reminder from the system.')
  );
  
  return createEmailWrapper(
    createHeader(`${emoji} ${title}`) +
    content +
    createFooter()
  );
}

/**
 * Security Alert Email
 */
export function createSecurityAlertEmail(params: {
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  details: Array<{ label: string; value: string }>;
  recommendations?: string[];
}): string {
  const { alertType, severity, summary, details, recommendations } = params;
  
  const severityConfig = {
    low: { color: 'info', emoji: 'ℹ️' },
    medium: { color: 'warning', emoji: '⚠️' },
    high: { color: 'danger', emoji: '🔴' },
    critical: { color: 'danger', emoji: '🚨' },
  };
  
  const { color, emoji } = severityConfig[severity];
  
  const content = createContentSection(
    createParagraph(summary) +
    createHeading('Alert Details', 3) +
    createTable(details) +
    (recommendations && recommendations.length > 0
      ? createHeading('Recommended Actions', 3) + createList(recommendations)
      : ''
    ) +
    createDivider() +
    createSmallText('This is an automated security alert. Please review and take action if necessary.')
  );
  
  return createEmailWrapper(
    createHeader(`${emoji} Security Alert: ${alertType}`) +
    content +
    createFooter()
  );
}

/**
 * Vanity Configuration Email
 */
export function createVanityConfigEmail(params: {
  recipientName: string;
  configDetails: Array<{ label: string; value: string }>;
  pricingDetails: Array<{ label: string; value: string }>;
  notes?: string;
}): string {
  const { recipientName, configDetails, pricingDetails, notes } = params;
  
  const content = createContentSection(
    createParagraph(`Hi ${recipientName},`) +
    createParagraph('Thank you for using our Custom Bathroom Vanity Designer! Here\'s a summary of your configuration:') +
    createHeading('Configuration Details', 3) +
    createTable(configDetails) +
    createDivider() +
    createHeading('Pricing Estimate', 3) +
    createTable(pricingDetails) +
    createAlertBox('Note: This is an estimate. Final pricing will be confirmed by our team.', 'info') +
    (notes ? createParagraph(notes) : '') +
    createDivider() +
    createSmallText('Questions about your configuration? Contact us and we\'ll be happy to help!')
  );
  
  return createEmailWrapper(
    createHeader('Your Custom Vanity Configuration') +
    content +
    createFooter()
  );
}

/**
 * Order Confirmation Email
 */
export function createOrderConfirmationEmail(params: {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  total: string;
  shippingAddress?: string;
}): string {
  const { customerName, orderNumber, orderDate, items, total, shippingAddress } = params;
  
  const itemsList = items.map(item => 
    `<li><strong>${item.name}</strong> - Qty: ${item.quantity} - ${item.price}</li>`
  ).join('');
  
  const content = createContentSection(
    createParagraph(`Hi ${customerName},`) +
    createParagraph('Thank you for your order! We\'ve received your payment and are processing your custom vanity order.') +
    createAlertBox(`<strong>Order #:</strong> ${orderNumber}<br><strong>Date:</strong> ${orderDate}`, 'success') +
    createHeading('Order Details', 3) +
    `<ul style="margin: 16px 0; padding-left: 24px; color: ${COLORS.text}; font-size: ${FONTS.sizeBody}; line-height: 1.8; font-family: ${FONTS.family};">${itemsList}</ul>` +
    createTable([{ label: 'Total Amount', value: total }]) +
    (shippingAddress 
      ? createHeading('Shipping Address', 3) + createParagraph(shippingAddress.replace(/\n/g, '<br>'))
      : ''
    ) +
    createDivider() +
    createParagraph('Our team will contact you shortly to confirm the details and schedule delivery.') +
    createSmallText('Thank you for choosing Green Cabinets!')
  );
  
  return createEmailWrapper(
    createHeader('Order Confirmation') +
    content +
    createFooter()
  );
}

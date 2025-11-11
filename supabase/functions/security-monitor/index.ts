import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { handleCorsPreFlight, createCorsResponse, createCorsErrorResponse } from "../_shared/cors.ts";
import { createServiceRoleClient } from "../_shared/supabase.ts";
import { createLogger, generateRequestId } from "../_shared/logger.ts";
import { withErrorHandling, AppError } from "../_shared/errors.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const resend = new Resend(resendApiKey);

const ALERT_EMAIL = "info@greencabinets.com"; // Configure your alert email
const TIME_WINDOW_MINUTES = 60;
const RATE_LIMIT_THRESHOLD = 10; // Alert if same IP exceeds rate limit 10+ times
const SUSPICIOUS_IP_THRESHOLD = 5; // Alert if IP has 5+ violations

interface SecuritySummary {
  event_type: string;
  event_count: number;
  unique_ips: number;
  severity: string;
}

interface SuspiciousIP {
  client_ip: string;
  violation_count: number;
  functions_affected: string[];
  first_violation: string;
  last_violation: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  const requestId = generateRequestId();
  const logger = createLogger({ functionName: 'security-monitor', requestId });
  const supabase = createServiceRoleClient();

  try {
    logger.info("Running security monitor check");

    // Check if we've already sent an alert in the last hour to avoid spam
    const { data: recentAlerts } = await supabase
      .from("alert_history")
      .select("sent_at")
      .gte("sent_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order("sent_at", { ascending: false })
      .limit(1);

    if (recentAlerts && recentAlerts.length > 0) {
      const minutesSinceLastAlert = (Date.now() - new Date(recentAlerts[0].sent_at).getTime()) / 60000;
      if (minutesSinceLastAlert < 60) {
        logger.info("Skipping alert - cooldown active", { minutesSinceLastAlert: Math.round(minutesSinceLastAlert) });
        return createCorsResponse({
          message: "Alert cooldown active",
          minutesSinceLastAlert
        }, 200);
      }
    }

    // Get security summary
    const { data: summary, error: summaryError } = await supabase
      .rpc("get_security_summary", { time_window_minutes: TIME_WINDOW_MINUTES });

    if (summaryError) {
      logger.error("Error fetching security summary", summaryError);
      throw new AppError("Failed to fetch security summary", 500);
    }

    // Get suspicious IPs
    const { data: suspiciousIPs, error: ipError } = await supabase
      .rpc("get_suspicious_ips", { 
        time_window_minutes: TIME_WINDOW_MINUTES,
        threshold: SUSPICIOUS_IP_THRESHOLD 
      });

    if (ipError) {
      logger.error("Error fetching suspicious IPs", ipError);
      throw new AppError("Failed to fetch suspicious IPs", 500);
    }

    logger.info("Security summary retrieved", { eventCount: summary?.length || 0, suspiciousIPCount: suspiciousIPs?.length || 0 });

    // Check suspicious IPs for auto-blocking
    const suspiciousIPsData = suspiciousIPs as SuspiciousIP[] || [];
    
    // Auto-block IPs with excessive violations
    const AUTOBLOCK_THRESHOLD = 8; // Block after 8 violations
    const AUTOBLOCK_DURATION_HOURS = 24; // Block for 24 hours
    
    for (const suspiciousIP of suspiciousIPsData) {
      if (suspiciousIP.violation_count >= AUTOBLOCK_THRESHOLD) {
        logger.info("Auto-blocking IP", { 
          ip: suspiciousIP.client_ip, 
          violations: suspiciousIP.violation_count 
        });
        
        const { data: blockResult, error: blockError } = await supabase.rpc("auto_block_ip", {
          target_ip: suspiciousIP.client_ip,
          violation_threshold: AUTOBLOCK_THRESHOLD,
          block_duration_hours: AUTOBLOCK_DURATION_HOURS,
        });
        
        if (blockError) {
          logger.error("Error auto-blocking IP", blockError, { ip: suspiciousIP.client_ip });
        } else {
          logger.info("IP auto-blocked successfully", { ip: suspiciousIP.client_ip, result: blockResult });
        }
      }
    }

    // Check if we need to send an alert
    const summaryData = summary as SecuritySummary[] || [];
    
    const criticalEvents = summaryData.filter(s => s.severity === "critical");
    const highEvents = summaryData.filter(s => s.severity === "high");
    const rateLimitEvents = summaryData.find(s => s.event_type === "rate_limit_exceeded");

    const shouldAlert = 
      criticalEvents.length > 0 ||
      highEvents.length > 0 ||
      (rateLimitEvents && rateLimitEvents.event_count >= RATE_LIMIT_THRESHOLD) ||
      suspiciousIPsData.length > 0;

    if (shouldAlert) {
      logger.info("Security alert triggered - sending notification email", {
        criticalCount: criticalEvents.length,
        highCount: highEvents.length,
        suspiciousIPCount: suspiciousIPsData.length
      });

      // Build alert email
      const alertHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 700px; margin: 0 auto; padding: 20px; }
              .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px; }
              .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px; }
              .success-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0; border-radius: 4px; }
              .section { margin-bottom: 25px; }
              .section-title { font-size: 18px; font-weight: bold; color: #dc2626; margin-bottom: 10px; border-bottom: 2px solid #dc2626; padding-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th { background: #f3f4f6; padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; }
              td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
              .ip { font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 3px; }
              .count { font-weight: bold; color: #dc2626; }
              .blocked-badge { background: #dc2626; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Security Alert</h1>
                <p>Suspicious activity detected in the last ${TIME_WINDOW_MINUTES} minutes</p>
              </div>
              
              <div class="content">
                <div class="alert-box">
                  <strong>Action Required:</strong> Review and investigate the security events below. IPs with excessive violations have been automatically blocked.
                </div>

                ${suspiciousIPsData.filter(ip => ip.violation_count >= AUTOBLOCK_THRESHOLD).length > 0 ? `
                  <div class="success-box">
                    <strong>🛡️ Auto-Blocking Activated:</strong> ${suspiciousIPsData.filter(ip => ip.violation_count >= AUTOBLOCK_THRESHOLD).length} IP(s) have been automatically blocked for ${AUTOBLOCK_DURATION_HOURS} hours due to excessive violations.
                  </div>
                ` : ''}

                ${summaryData.length > 0 ? `
                  <div class="section">
                    <div class="section-title">Security Events Summary</div>
                    <table>
                      <thead>
                        <tr>
                          <th>Event Type</th>
                          <th>Count</th>
                          <th>Unique IPs</th>
                          <th>Severity</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${summaryData.map(s => `
                          <tr>
                            <td>${s.event_type.replace(/_/g, ' ').toUpperCase()}</td>
                            <td class="count">${s.event_count}</td>
                            <td>${s.unique_ips}</td>
                            <td><span style="color: ${s.severity === 'critical' ? '#dc2626' : s.severity === 'high' ? '#f59e0b' : '#6b7280'}">${s.severity.toUpperCase()}</span></td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                ` : ''}

                ${suspiciousIPsData.length > 0 ? `
                  <div class="section">
                    <div class="section-title">Suspicious IP Addresses</div>
                    <table>
                      <thead>
                        <tr>
                          <th>IP Address</th>
                          <th>Violations</th>
                          <th>Functions Affected</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${suspiciousIPsData.map(ip => `
                          <tr>
                            <td><span class="ip">${ip.client_ip}</span></td>
                            <td class="count">${ip.violation_count}</td>
                            <td>${ip.functions_affected.join(', ')}</td>
                            <td>${ip.violation_count >= AUTOBLOCK_THRESHOLD ? '<span class="blocked-badge">BLOCKED</span>' : '<span style="color: #f59e0b">⚠️ WARNING</span>'}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                ` : ''}

                <div class="warning-box">
                  <strong>Recommended Actions:</strong>
                  <ul style="margin: 10px 0;">
                    <li>Review the blocked_ips and security_events tables for detailed information</li>
                    <li>Manually review IPs with high violation counts but below auto-block threshold</li>
                    <li>Monitor edge function logs for additional context</li>
                    <li>Consider adjusting auto-block thresholds if needed (currently ${AUTOBLOCK_THRESHOLD} violations)</li>
                    <li>Blocked IPs will be automatically unblocked after ${AUTOBLOCK_DURATION_HOURS} hours</li>
                  </ul>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                  This alert was generated automatically by the security monitoring system. 
                  Alerts are limited to once per hour to prevent spam.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Send alert email
      await resend.emails.send({
        from: "Security Alerts <onboarding@resend.dev>",
        to: [ALERT_EMAIL],
        subject: `🚨 Security Alert: Suspicious Activity Detected`,
        html: alertHtml,
      });

      // Log alert to history
      await supabase
        .from("alert_history")
        .insert({
          alert_type: "security_violation",
          details: {
            summary: summaryData,
            suspicious_ips: suspiciousIPsData,
            time_window_minutes: TIME_WINDOW_MINUTES,
          },
        });

      logger.info("Security alert email sent successfully");

      return createCorsResponse({
        alert_sent: true,
        summary: summaryData,
        suspicious_ips: suspiciousIPsData,
      }, 200);
    }

    logger.info("No security issues detected - no alert needed");
    return createCorsResponse({
      alert_sent: false,
      message: "No suspicious activity detected",
      summary: summaryData,
    }, 200);

  } catch (error: any) {
    logger.error("Error in security-monitor function", error);
    return createCorsErrorResponse(error.message, 500);
  }
};

serve(withErrorHandling(handler, (message, error) => {
  const logger = createLogger({ functionName: 'security-monitor' });
  logger.error(message, error);
}));

/*
WHAT THIS FILE DOES:
Utility functions for formatting numbers, dates, and currency values
used across the results dashboard.

WHY IT EXISTS:
Formatting logic lives here once. SummaryCards, DiscrepancyTable, and
ExportButton all need consistent number and date formatting. Changing
a format means changing one function, not hunting across components.

HOW IT WORKS:
Pure functions — no side effects, no imports from React.
Each function accepts a raw value and returns a display string.
*/

// 1_234_567 → "1,234,567"
export function formatNumber( n: number | undefined ): string {
  if (n === undefined) return "0";
  return n.toLocaleString("en-US");
}

// 0.94 → "94%" | 0.0612 → "6.1%"
export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

// "2024-01-15T10:30:00Z" → "Jan 15, 2024 10:30"
export function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso; // return raw value if parsing fails
  }
}

// "100.00" + "USD" → "$100.00" | falls back to "100.00 USD"
export function formatAmount(amount: string, currency?: string): string {
  try {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    if (!currency) return num.toFixed(2);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(num);
  } catch {
    return currency ? `${amount} ${currency}` : amount;
  }
}

// Capitalise first letter: "SUCCESS" → "Success"
export function formatStatus(status: string): string {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
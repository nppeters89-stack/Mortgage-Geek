export default async function handler(req, res) {
  // Cache for 30 minutes to avoid hammering MND
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const response = await fetch('https://www.mortgagenewsdaily.com/mortgage-rates', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MortgageGeek/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`MND returned ${response.status}`);
    }

    const html = await response.text();

    // Parse rate data from the HTML
    // MND uses a consistent structure for rate display
    const rates = [];

    const rateTypes = [
      { key: '30 Yr. Fixed', label: '30-Year Fixed', icon: '🏠' },
      { key: '15 Yr. Fixed', label: '15-Year Fixed', icon: '⚡' },
      { key: '30 Yr. FHA', label: '30-Year FHA', icon: '🏛' },
      { key: '30 Yr. VA', label: '30-Year VA', icon: '🎖' },
      { key: '30 Yr. Jumbo', label: '30-Year Jumbo', icon: '💎' },
      { key: '7/6 SOFR ARM', label: '7/6 SOFR ARM', icon: '📊' },
    ];

    for (const rt of rateTypes) {
      // Look for the rate value near the rate type label
      // MND HTML pattern: rate-type-name followed by rate value in nearby elements
      const escapedKey = rt.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Try multiple regex patterns to find the rate
      // Pattern 1: Look for the rate in the main content area (class="rate" or similar)
      let rateMatch = null;

      // The page has patterns like: >30 Yr. Fixed< ... >6.41%< or >6.41<
      // Search for the key followed within ~500 chars by a percentage
      const keyIndex = html.indexOf(rt.key);
      if (keyIndex !== -1) {
        // Get a chunk of HTML after the key
        const chunk = html.substring(keyIndex, keyIndex + 800);
        // Find the first percentage that looks like a rate (4-8%)
        const rateRegex = /(\d\.\d{2})%/g;
        const matches = [...chunk.matchAll(rateRegex)];
        if (matches.length > 0) {
          const rateVal = parseFloat(matches[0][1]);
          // Sanity check: mortgage rates should be between 2% and 12%
          if (rateVal >= 2 && rateVal <= 12) {
            // Try to find the change value
            let change = null;
            const changeRegex = /([+-]\d\.\d{2})/g;
            const changeMatches = [...chunk.matchAll(changeRegex)];
            if (changeMatches.length > 0) {
              change = parseFloat(changeMatches[0][1]);
            }

            rates.push({
              label: rt.label,
              rate: rateVal.toFixed(2),
              change: change !== null ? change.toFixed(2) : null,
              icon: rt.icon,
            });
          }
        }
      }
    }

    if (rates.length === 0) {
      throw new Error('Could not parse any rates from page');
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York',
    });

    res.status(200).json({
      success: true,
      date: dateStr,
      source: 'Mortgage News Daily',
      rates,
    });
  } catch (error) {
    console.error('Rate fetch error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch current rates. Please try again later.',
    });
  }
}

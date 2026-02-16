import {ConfigInterface} from '../base-types';
import {logger} from '../logger';

/**
 * Applies configured domain transformations to a shop URL.
 * Returns transformed domain or original if no transformation matches.
 *
 * @param shopUrl - The shop URL to transform
 * @param config - Configuration object containing domain transformations
 * @returns Transformed shop URL or original if no transformation matches
 *
 * @example
 * const config = {
 *   domainTransformations: [{
 *     match: /^([a-zA-Z0-9-_]+)\.my\.shop\.dev$/,
 *     transform: '$1.dev-api.shop.dev'
 *   }]
 * };
 * applyDomainTransformations('shop1.my.shop.dev', config);
 * // Returns: 'shop1.dev-api.shop.dev'
 */
export function applyDomainTransformations(
  shopUrl: string,
  config: ConfigInterface,
): string | null {
  if (
    !config.domainTransformations ||
    config.domainTransformations.length === 0
  ) {
    return shopUrl;
  }

  for (const transformation of config.domainTransformations) {
    const regex =
      typeof transformation.match === 'string'
        ? new RegExp(transformation.match)
        : transformation.match;

    const matches = shopUrl.match(regex);

    if (!matches) {
      continue;
    }

    if (typeof transformation.transform === 'function') {
      return transformation.transform(matches);
    }

    let result = transformation.transform;
    matches.forEach((match, index) => {
      result = result.replace(new RegExp(`\\$${index}`, 'g'), match || '');
    });

    return result;
  }

  return shopUrl;
}

/**
 * Extracts all domains (source and target) from transformations for validation.
 * Uses heuristics to extract domain patterns from regex source.
 *
 * **Supported regex patterns:**
 * - Simple literal domains with escaped dots: `\.example\.com`
 * - Patterns with anchors: `^([a-zA-Z0-9-_]+)\.example\.com$`
 * - Character classes in subdomains: `^[a-z0-9-]+\.example\.com$`
 *
 * **Unsupported regex patterns:**
 * - Optional groups: `(\.staging)?\.example\.com$` - May not extract correctly
 * - Character classes in domain part: `\.api[0-9]\.example\.com$` - May not extract correctly
 * - Complex alternations: `\.(dev|staging)\.example\.com$` - May not extract correctly
 * - Nested groups in domain part - May not extract correctly
 *
 * When using unsupported patterns, domain extraction will fail and be logged at debug level.
 *
 * @param config - Configuration object containing domain transformations
 * @returns Array of domain regex patterns
 *
 * @example
 * const config = {
 *   domainTransformations: [{
 *     match: /^([a-zA-Z0-9-_]+)\.my\.shop\.dev$/,
 *     transform: '$1.dev-api.shop.dev'
 *   }]
 * };
 * getTransformationDomains(config);
 * // Returns: ['my\\.shop\\.dev', 'dev-api\\.shop\\.dev']
 */
export function getTransformationDomains(config: ConfigInterface): string[] {
  const domains: string[] = [];
  const log = logger(config);

  if (!config.domainTransformations) {
    return domains;
  }

  const transformations = config.domainTransformations;

  for (const transformation of transformations) {
    const regex =
      typeof transformation.match === 'string'
        ? new RegExp(transformation.match)
        : transformation.match;

    const domainPattern = regex.source.match(/\\\.([\\.\w-]+)\$?$/);

    if (domainPattern) {
      domains.push(domainPattern[1]);
    } else {
      log.debug(
        `Failed to extract domain pattern from regex: ${regex.source}. This may indicate an unsupported regex pattern (e.g., optional groups, character classes in domain part, complex alternations).`,
      );
    }

    if (typeof transformation.transform !== 'string') {
      continue;
    }

    const templateDomainMatch =
      transformation.transform.match(/\$\d+\.([.\w-]+)$/);

    if (templateDomainMatch) {
      const escapedDomain = templateDomainMatch[1].replace(/\./g, '\\.');
      domains.push(escapedDomain);
    }
  }

  return domains;
}

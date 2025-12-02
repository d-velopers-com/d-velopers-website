/**
 * Script to validate localizations
 * - Checks that all keys exist in both locale files (en.ts and es.ts)
 * - Reports missing translations
 * 
 * Run with: npx tsx scripts/check-localization.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Recursively extracts all keys from an object with dot notation
 */
function extractKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Dynamically imports a locale file and extracts its keys
 */
async function getLocaleKeys(localePath: string): Promise<{ keys: string[], data: Record<string, any> }> {
  const absolutePath = path.resolve(process.cwd(), localePath);
  
  // Read the file content
  const content = fs.readFileSync(absolutePath, 'utf-8');
  
  // Extract the export name (en or es)
  const exportMatch = content.match(/export\s+const\s+(\w+)\s*=/);
  if (!exportMatch) {
    throw new Error(`Could not find export in ${localePath}`);
  }
  
  // Use dynamic import with file URL (needed for Windows compatibility)
  const fileUrl = pathToFileURL(absolutePath).href;
  const module = await import(fileUrl);
  const exportName = exportMatch[1];
  const data = module[exportName];
  
  if (!data) {
    throw new Error(`Export '${exportName}' not found in ${localePath}`);
  }
  
  return {
    keys: extractKeys(data),
    data,
  };
}

/**
 * Finds keys that exist in one set but not the other
 */
function findMissingKeys(sourceKeys: string[], targetKeys: string[]): string[] {
  const targetSet = new Set(targetKeys);
  return sourceKeys.filter(key => !targetSet.has(key));
}

/**
 * Patterns that suggest hardcoded text in JSX
 */
const HARDCODED_PATTERNS = [
  // Text content between JSX tags (excluding common non-text patterns)
  // Matches: >Some Text< but not >{variable}< or >< or className patterns
  {
    name: 'JSX text content',
    regex: />\s*([A-Z][a-zA-Z\s]{2,}[a-zA-Z])\s*</g,
    description: 'Text between JSX tags',
  },
  // Common props that should use translations
  {
    name: 'label prop',
    regex: /\blabel\s*=\s*["']([A-Z][^"']{2,})["']/g,
    description: 'label="Hardcoded Text"',
  },
  {
    name: 'placeholder prop',
    regex: /\bplaceholder\s*=\s*["']([A-Z][^"']{2,})["']/g,
    description: 'placeholder="Hardcoded Text"',
  },
  {
    name: 'title prop (string)',
    regex: /\btitle\s*=\s*["']([A-Z][^"']{2,})["']/g,
    description: 'title="Hardcoded Text"',
  },
  {
    name: 'description prop',
    regex: /\bdescription\s*=\s*["']([A-Z][^"']{2,})["']/g,
    description: 'description="Hardcoded Text"',
  },
  {
    name: 'errorMessage prop',
    regex: /\berrorMessage\s*=\s*["']([A-Z][^"']{2,})["']/g,
    description: 'errorMessage="Hardcoded Text"',
  },
  {
    name: 'aria-label prop',
    regex: /\baria-label\s*=\s*["']([A-Z][^"']{2,})["']/g,
    description: 'aria-label="Hardcoded Text"',
  },
];

/**
 * Words/patterns to ignore (common false positives)
 */
const IGNORE_PATTERNS = [
  /^(https?:\/\/|mailto:|tel:)/i,  // URLs
  /^[A-Z][a-z]+\.[a-z]+$/,         // File extensions like "Button.tsx"
  /^[A-Z]{2,}$/,                   // Acronyms like "API", "URL"
  // Social media and brand names (universal, don't need translation)
  /^(LinkedIn|GitHub|Twitter|Discord|YouTube|Instagram|Facebook|TikTok|Twitch|Reddit|Telegram|WhatsApp|Spotify|Medium|Behance|Dribbble|Slack|Pinterest|Snapchat|WeChat|Line|Viber|Signal)$/i,
  /^(POST|GET|PUT|DELETE|PATCH)$/, // HTTP methods
  /^(React|Next|Node|Prisma|HeroUI)/i, // Tech names
  /^\d+/,                          // Starts with number
  /^[A-Z][a-z]+Icon$/,             // Icon component names
  /^(Svg|Path|Circle|Rect)/,       // SVG elements
  /^(D-veloper|D-VELOPERS)/i,      // Project name
  /^(English|Spanish|Español)$/i,  // Language names in switchers
  /table$/i,                       // aria-label patterns like "Posts table"
];

interface HardcodedMatch {
  file: string;
  line: number;
  text: string;
  pattern: string;
  context: string;
}

/**
 * Checks if text should be ignored
 */
function shouldIgnore(text: string): boolean {
  const trimmed = text.trim();
  
  // Ignore short text (likely not user-facing)
  if (trimmed.length < 3) return true;
  
  // Ignore if matches any ignore pattern
  return IGNORE_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Checks if the context suggests this is a default prop value
 * (e.g., placeholder = "Default text")
 */
function isDefaultPropValue(context: string): boolean {
  // Pattern for default parameter values: paramName = "value"
  return /\w+\s*=\s*["'][^"']+["']\s*[,)]/.test(context);
}

/**
 * Scans a file for hardcoded text patterns
 */
function scanFileForHardcodedText(filePath: string): HardcodedMatch[] {
  const matches: HardcodedMatch[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  for (const pattern of HARDCODED_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    
    while ((match = regex.exec(content)) !== null) {
      const text = match[1];
      
      if (shouldIgnore(text)) continue;
      
      // Find line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      
      // Get context (the line where match was found)
      const context = lines[lineNumber - 1]?.trim() || '';
      
      // Skip if it looks like it's using t. or translation
      if (context.includes('t.') || context.includes('t[')) continue;
      
      // Skip default prop values in function parameters
      if (isDefaultPropValue(context)) continue;
      
      matches.push({
        file: filePath,
        line: lineNumber,
        text,
        pattern: pattern.name,
        context: context.length > 80 ? context.substring(0, 80) + '...' : context,
      });
    }
  }
  
  return matches;
}

/**
 * Recursively finds all TSX files in a directory
 */
function findTsxFiles(dir: string, files: string[] = []): string[] {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) continue;
      findTsxFiles(fullPath, files);
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Checks for hardcoded text in components
 */
function checkHardcodedText(): HardcodedMatch[] {
  const projectRoot = process.cwd();
  const dirsToScan = ['app', 'components'];
  const allMatches: HardcodedMatch[] = [];
  
  for (const dir of dirsToScan) {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) continue;
    
    const tsxFiles = findTsxFiles(dirPath);
    
    for (const file of tsxFiles) {
      const matches = scanFileForHardcodedText(file);
      allMatches.push(...matches);
    }
  }
  
  return allMatches;
}

/**
 * Main validation function
 */
async function validateLocalizations() {
  console.log('\n🌐 Checking localizations...\n');
  
  const localesDir = path.resolve(process.cwd(), 'locales');
  const enPath = path.join(localesDir, 'en.ts');
  const esPath = path.join(localesDir, 'es.ts');
  
  // Check if files exist
  if (!fs.existsSync(enPath)) {
    log(colors.red, `❌ English locale file not found: ${enPath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(esPath)) {
    log(colors.red, `❌ Spanish locale file not found: ${esPath}`);
    process.exit(1);
  }
  
  let hasErrors = false;
  
  try {
    // ==========================================
    // Part 1: Check locale files are in sync
    // ==========================================
    console.log('📋 Checking locale files sync...\n');
    
    const { keys: enKeys } = await getLocaleKeys(enPath);
    const { keys: esKeys } = await getLocaleKeys(esPath);
    
    log(colors.blue, `   English keys: ${enKeys.length}`);
    log(colors.blue, `   Spanish keys: ${esKeys.length}`);
    console.log('');
    
    // Find missing keys
    const missingInEs = findMissingKeys(enKeys, esKeys);
    const missingInEn = findMissingKeys(esKeys, enKeys);
    
    if (missingInEs.length > 0) {
      hasErrors = true;
      log(colors.red, `❌ Keys missing in Spanish (es.ts): ${missingInEs.length}`);
      missingInEs.forEach(key => {
        log(colors.yellow, `   - ${key}`);
      });
      console.log('');
    }
    
    if (missingInEn.length > 0) {
      hasErrors = true;
      log(colors.red, `❌ Keys missing in English (en.ts): ${missingInEn.length}`);
      missingInEn.forEach(key => {
        log(colors.yellow, `   - ${key}`);
      });
      console.log('');
    }
    
    if (missingInEs.length === 0 && missingInEn.length === 0) {
      log(colors.green, '✅ Locale files are in sync!\n');
    }
    
    // ==========================================
    // Part 2: Check for hardcoded text
    // ==========================================
    console.log('🔍 Checking for hardcoded text in components...\n');
    
    const hardcodedMatches = checkHardcodedText();
    
    if (hardcodedMatches.length > 0) {
      hasErrors = true;
      log(colors.red, `❌ Potential hardcoded text found: ${hardcodedMatches.length} occurrences\n`);
      
      // Group by file
      const byFile = new Map<string, HardcodedMatch[]>();
      for (const match of hardcodedMatches) {
        const relativePath = path.relative(process.cwd(), match.file);
        if (!byFile.has(relativePath)) {
          byFile.set(relativePath, []);
        }
        byFile.get(relativePath)!.push(match);
      }
      
      for (const [file, matches] of Array.from(byFile.entries())) {
        log(colors.yellow, `   📄 ${file}`);
        for (const match of matches) {
          log(colors.yellow, `      Line ${match.line}: "${match.text}" (${match.pattern})`);
        }
        console.log('');
      }
      
      log(colors.yellow, '💡 Consider using translations (t.key) instead of hardcoded text\n');
    } else {
      log(colors.green, '✅ No obvious hardcoded text found!\n');
    }
    
    // ==========================================
    // Final result
    // ==========================================
    if (hasErrors) {
      log(colors.red, '❌ Localization validation failed!\n');
      process.exit(1);
    }
    
    log(colors.green, '✅ All localization checks passed!\n');
    
  } catch (error) {
    log(colors.red, `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// Run the validation
validateLocalizations();


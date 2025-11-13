import { readFile, writeFile } from 'fs/promises';

interface Mapping {
  migrationDate: string;
  totalImages: number;
  mappings: Record<string, string>;
}

// Files that import vanity images
const FILES_TO_UPDATE = [
  'src/components/layout/Header.tsx',
  'src/features/vanity-designer/components/TextureSwatch.tsx',
  'src/features/vanity-designer/services/vanityConfigService.ts',
];

async function updateFile(filePath: string, mappings: Record<string, string>) {
  console.log(`Updating ${filePath}...`);
  
  let content = await readFile(filePath, 'utf-8');
  let changes = 0;

  // Replace import statements
  for (const [localPath, cdnUrl] of Object.entries(mappings)) {
    const importPattern = new RegExp(
      `import\\s+(\\w+)\\s+from\\s+["']${localPath.replace('src/', '@/')}["']`,
      'g'
    );
    
    if (importPattern.test(content)) {
      // Remove the import statement
      content = content.replace(importPattern, '');
      changes++;
      
      // Add constant with CDN URL at the top of the file
      const varName = localPath.match(/([^/]+)\.(jpg|png|webp)$/)?.[1]
        .replace(/-/g, '_')
        .toUpperCase() + '_URL';
      
      const constDeclaration = `const ${varName} = "${cdnUrl}";\n`;
      
      // Insert after the last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfImport = content.indexOf('\n', lastImportIndex) + 1;
        content = content.slice(0, endOfImport) + '\n' + constDeclaration + content.slice(endOfImport);
      }
    }
  }

  if (changes > 0) {
    await writeFile(filePath, content);
    console.log(`✓ Updated ${filePath} (${changes} changes)`);
  } else {
    console.log(`- No changes needed in ${filePath}`);
  }
}

async function updateVanityCDNUrls() {
  console.log('🔄 Updating vanity designer code to use CDN URLs...\n');

  // Load mappings
  const mappingFile = await readFile('vanity-image-mappings.json', 'utf-8');
  const mapping: Mapping = JSON.parse(mappingFile);

  console.log(`Loaded ${mapping.totalImages} image mappings\n`);

  for (const filePath of FILES_TO_UPDATE) {
    try {
      await updateFile(filePath, mapping.mappings);
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error);
    }
  }

  console.log(`\n✅ Update complete!`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Test the vanity designer`);
  console.log(`   2. Verify all textures load from CDN`);
  console.log(`   3. Try publishing the website`);
  console.log(`   4. If successful, delete local vanity images`);
}

updateVanityCDNUrls().catch(console.error);

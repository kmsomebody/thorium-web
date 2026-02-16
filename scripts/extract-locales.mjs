#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const thoriumLocalesPath = path.join(__dirname, "../node_modules/@edrlab/thorium-locales/reader");
const publicLocalesPath = path.join(__dirname, "../public/locales");

const i18nFileName = "thorium-shared";

function extractLocales() {
  console.log("Extracting locales from @edrlab/thorium-locales...");

  // Ensure the source directory exists
  if (!fs.existsSync(thoriumLocalesPath)) {
    console.error(`Source directory not found: ${ thoriumLocalesPath }`);
    process.exit(1);
  }

  // Read all JSON files from thorium-locales/reader
  const files = fs.readdirSync(thoriumLocalesPath).filter(file => file.endsWith(".json"));
  
  files.forEach(file => {
    const sourcePath = path.join(thoriumLocalesPath, file);
    const locale = file.replace(".json", "");
    const targetDir = path.join(publicLocalesPath, locale);
    const targetPath = path.join(targetDir, `${i18nFileName}.json`);
    
    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Created directory: ${ targetDir }`);
    }
    
    // Copy the JSON file
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${ file } -> ${ locale }/${ i18nFileName }.json`);
  });
  
  console.log("Locale extraction completed!");
}

extractLocales();

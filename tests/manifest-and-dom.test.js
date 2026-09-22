import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Manifest V3 Bütünlüğü: manifest.json geçerli ve tüm dosyalar diskte mevcut', () => {
  const manifestPath = path.join(rootDir, 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json mevcut olmalı');

  const content = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(content);

  assert.equal(manifest.manifest_version, 3, 'Manifest V3 olmalı');
  assert.ok(manifest.name, 'name alanı tanımlı olmalı');
  assert.ok(manifest.version, 'version alanı tanımlı olmalı');
  assert.ok(manifest.permissions.includes('storage'), 'storage izni bulunmalı');

  // Background script kontrolü
  const bgScript = path.join(rootDir, manifest.background.service_worker);
  assert.ok(fs.existsSync(bgScript), `Service worker dosyası mevcut olmalı: ${manifest.background.service_worker}`);

  // Content script kontrolleri
  for (const cs of manifest.content_scripts) {
    for (const js of cs.js) {
      assert.ok(fs.existsSync(path.join(rootDir, js)), `Content script JS mevcut olmalı: ${js}`);
    }
    for (const css of cs.css) {
      assert.ok(fs.existsSync(path.join(rootDir, css)), `Content script CSS mevcut olmalı: ${css}`);
    }
  }

  // Popup dosyası kontrolü
  const popupHtml = path.join(rootDir, manifest.action.default_popup);
  assert.ok(fs.existsSync(popupHtml), `Popup HTML mevcut olmalı: ${manifest.action.default_popup}`);

  // İkon dosyaları kontrolleri
  for (const [size, iconRelPath] of Object.entries(manifest.icons)) {
    assert.ok(fs.existsSync(path.join(rootDir, iconRelPath)), `İkon ${size}px mevcut olmalı: ${iconRelPath}`);
  }
});

test('Popup DOM Bütünlüğü: popup.js içindeki tüm element ID’leri popup.html içinde mevcut', () => {
  const popupHtmlContent = fs.readFileSync(path.join(rootDir, 'popup.html'), 'utf-8');
  const popupJsContent = fs.readFileSync(path.join(rootDir, 'popup.js'), 'utf-8');

  // popup.js içindeki $('id') aramaları
  const idMatches = [...popupJsContent.matchAll(/\$\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  const uniqueIds = [...new Set(idMatches)];

  for (const id of uniqueIds) {
    const exists = popupHtmlContent.includes(`id="${id}"`) || popupHtmlContent.includes(`id='${id}'`);
    assert.ok(exists, `popup.js tarafından aranan id="${id}" popup.html içinde bulunamadı!`);
  }
});

test('YouTube URL Yönlendirme Mantığı: İlgili sayfaları izin verir, stüdyoyu engeller', () => {
  const allowed = (pathname) => {
    return !pathname.startsWith('/studio') && !pathname.startsWith('/tv');
  };

  // İzin verilmesi gereken sayfalar
  assert.equal(allowed('/'), true, 'Ana sayfa izinli olmalı');
  assert.equal(allowed('/watch'), true, 'İzleme sayfası izinli olmalı');
  assert.equal(allowed('/results'), true, 'Arama sonuçları izinli olmalı');
  assert.equal(allowed('/feed/subscriptions'), true, 'Abonelikler sayfası izinli olmalı');
  assert.equal(allowed('/feed/trending'), true, 'Trendler sayfası izinli olmalı');
  assert.equal(allowed('/@BarisOzcan/videos'), true, 'Kanal videoları izinli olmalı');

  // Engellenmesi gereken sayfalar
  assert.equal(allowed('/studio/channel'), false, 'Studio sayfası engellenmeli');
  assert.equal(allowed('/tv/browse'), false, 'YouTube TV engellenmeli');
});

test('Kanal Sayfası ve Grid Desteği: CARDS seçicisi kanal videolarını kapsar', () => {
  const contentJs = fs.readFileSync(path.join(rootDir, 'content.js'), 'utf-8');
  assert.ok(contentJs.includes('ytd-grid-video-renderer'), 'CARDS seçicisi ytd-grid-video-renderer içermeli (Kanal videoları sekmesi için)');
  assert.ok(contentJs.includes('extractChannelName'), 'Kanal adını sayfa başlığından yakalayan fallback fonksiyonu bulunmalı');
  assert.ok(contentJs.includes('yt-page-data-updated'), 'Kanal sekmeleri arası geçişi dinleyen yt-page-data-updated dinleyicisi bulunmalı');
});

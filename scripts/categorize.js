const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const rules = {
  'Operating Systems': [
    'amd', 'apple', 'android', 'archlinux', 'fedora-alt', 'linux-mint',
    'manjaro-linux', 'nixos', 'opensuse', 'puppy-linux', 'redhat-linux',
    'rocky-linux', 'ubuntu-linux', 'windows-10', 'windows-11',
    'xubuntu-linux', 'macmon'
  ],

  'Developer': [
    'git', 'github', 'github-copilot', 'gitlab', 'golang',
    'java', 'javascript', 'nodejs', 'nodejs-alt', 'npm', 'nuxt-js',
    'php', 'python', 'reactjs', 'rust', 'swift', 'typescript',
    'vue-js', 'html', 'powershell', 'shell', 'shell-tips',
    'visual-studio-code', 'postman', 'swagger', 'webhook',
    'draw-io', 'jamstack', 'pinia'
  ],

  'Cloud': [
    'cloudflare', 'oracle', 'amazon', 'hostinger', 'racknerd',
    'dedirock', 'pikapods', 'dropbox', 'mega-nz', 'supabase',
    'minio', 'netlify'
  ],

  'Infrastructure': [
    'docker', 'kubernetes', 'k3s', 'proxmox', 'portainer-alt',
    'nginx', 'traefik', 'mariadb', 'mysql', 'mongodb', 'redis',
    'couchdb', 'pgadmin', 'microsoft-sql-server', 'cockpit',
    'home-assistant', 'homebox', 'nocodb', 'openpanel', 'openproject',
    'onedev', 'istio', 'nomad', 'hashicorp-nomad', 'frp', 'frp-manager',
    'rclone', 'synology', 'syncthing'
  ],

  'Networking': [
    'netbird', 'tailscale', 'aruba', 'cisco', 'bluetooth', 'WiFi',
    'openvpn', 'surfshark', 'vpnactive', 'duckdns', 'pangolin',
    'telekom', 'webhook'
  ],

  'Security': [
    'bitwarden', 'fortinet', 'keeper-security', 'passbolt',
    'proton', 'proton-mail', 'openbao', 'jumpserver', 'ivanti-icon',
    'papercut', 'mcaffee'
  ],

  'AI': [
    'openai', 'ollama', 'grok', 'hugging-face', 'perplexity'
  ],

  'Communication': [
    'line', 'whatapp', 'telegram', 'discord', 'skype', 'fluffychat',
    'ntfy', 'mailbox', 'mailgun', 'mailjet', 'rainloop', 'send',
    'proton-mail'
  ],

  'Social': [
    'instagram', 'pinterest', 'reddit', 'bluesky', 'linkedin',
    'threads', 'twitter', 'x', 'tumblr', 'friendica'
  ],

  'Media': [
    'spotify', 'soundcloud', 'youtube', 'netflix', 'hulu',
    'crunchyroll', 'paramount-plus', 'peacock', 'plex-alt',
    'pocket-casts', 'podfetch', 'podify', 'twitch', 'broadcastchannel',
    'blu-ray-3d', 'dvd'
  ],

  'Gaming': [
    'playstation', 'xbox', 'nintendo-switch', 'osu', 'electronic-arts',
    'origin', 'unreal-engine', 'rockstargames'
  ],

  'Finance': [
    'bitcoin', 'visa', 'mastercard', 'paypal', 'wise', 'amex',
    'boa', 'monarch-money', 'NASDAQ'
  ],

  'E-commerce': [
    'amazon', 'amazon-prime', 'aliexpress', 'carrefour', 'instacart',
    'kaufland', 'kfc', 'fedex', 'uspostalservice', 'Mærsk'
  ],

  'Food & Beverage': [
    'burgerking', 'BurgerKing', 'cocacola', 'fanta', 'kfc',
    'mcdonalds', 'McDonalds', 'pepsi', 'Pepsi', 'redbull', 'starbucks',
    'Dominos', 'mealie', 'recipesage'
  ],

  'Education': [
    'DAYUAN', 'DONGFANGCOLLEGE', 'HAININGRUBLICBYCYCLE',
    'Hanghai-IR', 'JIDIANCOLLEGE', 'hainingzhongxue',
    'duolingo'
  ],

  'Hardware': [
    'amd', 'arm', 'ASML', 'ATI', 'broadcom', 'brother', 'boeing',
    'cisco', 'dell', 'generalelectric', 'hifiberry', 'ibm',
    'l3harris', 'nvidia', 'raspberry-pi', 'RTX', 'scania',
    'Seagate', 'Siemens', 'SKHynix', 'spacex', 'tata', 'USB',
    'WiFi', 'apple',
    '3m', 'BochsVector', 'Caterpillar', 'Dassaultsystemes',
    'FCCsymbol', 'Rheinmetall', 'RoHS', 'RoHSCompliance',
    'RoHSCompliance2', 'RoHSCompliance3', 'TÜVRheinland',
    'TÜVRheinland1', 'TÜVSüd', 'ULcertified', 'ULcertified1',
    'WEEE', 'WEEECompliance'
  ],

  'Design': [
    'affine', 'blender', 'draw-io', 'linear', 'outline',
    'simpleicons', 'figma'
  ],

  'Productivity': [
    'notion', 'linear', 'office-365', 'powerbi', 'openproject',
    'outline', 'etherpad', 'formbricks', 'reallly', 'rallly',
    'convertio-dark', 'docuform', 'documenso', 'mergeable',
    'papra', 'windows-explorer'
  ],

  'Open Source': [
    'github', 'git', 'forgejo', 'open-source-initiative',
    'simpleicons', 'linux-mint', 'debian', 'ubuntu-linux',
    'archlinux', 'fedora-alt', 'opensuse', 'nixos',
    'wordpress', 'nginx', 'docker', 'kubernetes', 'python',
    'rust', 'nodejs',
    '7zip', 'anaconda', 'ansible', 'astro', 'bootstrap',
    'electron', 'homebrew', 'hugo', 'libretranslate',
    'meilisearch', 'remmina', 'rstudio', 'rustdesk',
    'vim', 'wikimedia'
  ],

  'Technology': [
    'cc', 'medama', 'yahoo', 'yandex', 'dashboardicons'
  ],

  'Automotive': [
    'man'
  ],

  'Other': [
    'my_logo', 'capsule', 'mantrae-dark', 'nsg', '250',
    'alter', 'Daemonphk', 'dzfdd', 'Fila', 'FSC',
    'ISO90012015', 'NoEWaste', 'Recycle001', 'Underground'
  ]
};

const extraRules = {
  'Developer': [
    '7zip', 'anaconda', 'ansible', 'astro', 'bootstrap',
    'dotnet', 'electron', 'homebrew', 'hugo', 'it-tools',
    'libretranslate', 'meilisearch', 'nodebb', 'oh-my-posh',
    'open-webui', 'pdfforge', 'portabase', 'remmina',
    'rstudio', 'rustdesk', 'vim', 'tyepcho'
  ],

  'Cloud': [
    'cloudbeaver', 'cpanel'
  ],

  'Infrastructure': [
    'archivedotorg', 'cockpit', 'dlna', 'dockpeek', 'emby',
    'pi-hole', 'piwigo', 'recyclarr', 'sinusbot', 'sun-panel'
  ],

  'Networking': [
    'brave', 'kagi', 'mojeek'
  ],

  'Communication': [
    'at-t', 'jio', 'keila', 'vodafone', 'Sunrise'
  ],

  'Social': [
    'behance', 'blogger', 'meta', 'onlyfans'
  ],

  'Media': [
    'tomianime', 'reddoribon', 'bright-move', 'cd', 'dropout',
    'Aniplex', 'DisneyChannel', 'GoodSmile', 'hellokitty',
    'Kodak', 'kotobukiya', 'kuromi', 'Marvel', 'NBC',
    'kodi', 'max', 'pigallery2'
  ],

  'Gaming': [
    'Bandai', 'BandaiNamco', 'Banpresto', 'LEGO',
    'RockstarGames', 'pioneer'
  ],

  'Food & Beverage': [
    'Dominos', 'Pepsi', 'mealie', 'recipesage'
  ],

  'E-commerce': [
    'fedex', 'uspostalservice'
  ],

  'Hardware': [
    '3m', 'BochsVector', 'Caterpillar', 'Dassaultsystemes',
    'FCCsymbol', 'generalelectric', 'Rheinmetall',
    'RoHS', 'RoHSCompliance', 'RoHSCompliance2',
    'RoHSCompliance3', 'TÜVRheinland', 'TÜVRheinland1',
    'TÜVSüd', 'ULcertified', 'ULcertified1',
    'WEEE', 'WEEECompliance'
  ],

  'Open Source': [
    '7zip', 'anaconda', 'ansible', 'astro', 'bootstrap',
    'electron', 'homebrew', 'hugo', 'libretranslate',
    'meilisearch', 'remmina', 'rstudio', 'rustdesk',
    'vim', 'wikimedia'
  ],

  'Productivity': [
    'convertio-dark', 'docuform', 'documenso',
    'mergeable', 'papra', 'windows-explorer'
  ],

  'Technology': [
    'cc', 'medama', 'yahoo', 'yandex', 'dashboardicons'
  ],

  'Finance': [
    'Greendot', 'HSBC'
  ],

  'Automotive': [
    'man'
  ],

  'Security': [
    'reachcompliant', 'reachcompliant1'
  ],

  'Other': [
    'my_logo', 'capsule', 'mantrae-dark', 'nsg', '250',
    'alter', 'Daemonphk', 'dzfdd', 'Fila', 'FSC',
    'ISO90012015', 'NoEWaste', 'Recycle001', 'Underground'
  ],

  'Operating Systems': [
    'peppermint'
  ]
};

for (const [category, names] of Object.entries(extraRules)) {
  if (!rules[category]) {
    rules[category] = [];
  }

  rules[category].push(...names);
}

const normalized = new Map();

for (const [category, names] of Object.entries(rules)) {
  for (const name of names) {
    if (!normalized.has(name)) {
      normalized.set(name, []);
    }

    normalized.get(name).push(category);
  }
}

const unresolved = [];

for (const icon of config) {
  const categories = normalized.get(icon.name) || [];

  icon.category = [...new Set(categories)];

  if (icon.category.length === 0) {
    unresolved.push(icon.name);
  }
}

fs.writeFileSync(
  configPath,
  JSON.stringify(config, null, 2) + '\n',
  'utf8'
);

console.log(`Updated: ${config.length} icons`);
console.log(`Categorized: ${config.length - unresolved.length}`);
console.log(`Unresolved: ${unresolved.length}`);

if (unresolved.length > 0) {
  console.log('\nUnresolved icons:');
  console.log(unresolved.join('\n'));
}

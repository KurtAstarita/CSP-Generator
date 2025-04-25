async function generateScriptHash() {
  const scriptUrl = document.getElementById("iframeScriptUrl").value;
  if (!scriptUrl) {
    document.getElementById("scriptHashOutput").value = "Please enter the URL of the script.";
    return;
  }

  try {
    const response = await fetch(scriptUrl);
    if (!response.ok) {
      document.getElementById("scriptHashOutput").value = `Error fetching script: ${response.statusText}`;
      return;
    }
    const scriptContent = await response.text();
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(scriptContent));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById("scriptHashOutput").value = `'sha256-${btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))}`;
  } catch (error) {
    document.getElementById("scriptHashOutput").value = `Error: ${error.message}`;
  }
}

function generateCSP() {
  const embeddingSiteUrl = document.getElementById("embeddingSiteUrl").value;
  const needsScript = document.getElementById("needsScript").value;
  const needsStyle = document.getElementById("needsStyle").value;
  const additionalDomainsAndHashes = document.getElementById("additionalDomains").value.split(',').map(d => d.trim()).filter(d => d !== '');
  const cspParts = [];
  const yourDomain = 'https://your-github-username.github.io'; // Replace with your actual domain

  cspParts.push("default-src 'self';");

  let scriptSources = `'self' ${yourDomain}`;
  additionalDomainsAndHashes.forEach(item => {
    if (item.startsWith("'sha256-")) {
      scriptSources += ` ${item}`;
    } else if (item) {
      scriptSources += ` ${item}`;
    }
  });

  if (needsScript === 'yes') {
    cspParts.push(`script-src ${scriptSources};`);
  } else {
    cspParts.push("script-src 'self';");
  }

  let styleSources = `'self' ${yourDomain}`;
  additionalDomainsAndHashes.forEach(item => {
    if (item.startsWith("'sha256-") && item.includes('style') || (!item.startsWith("'sha256-") && item)) {
      styleSources += ` ${item}`;
    }
  });

  if (needsStyle === 'yes') {
    cspParts.push(`style-src ${styleSources};`);
  } else {
    cspParts.push("style-src 'self';");
  }

  cspParts.push(`img-src 'self' * ${additionalDomainsAndHashes.join(' ')};`);
  cspParts.push(`font-src 'self' * ${additionalDomainsAndHashes.join(' ')};`);
  cspParts.push(`connect-src 'self' ${yourDomain} ${additionalDomainsAndHashes.join(' ')};`);
  cspParts.push(`frame-ancestors ${embeddingSiteUrl || 'none'};`);
  cspParts.push("upgrade-insecure-requests;");

  document.getElementById("cspOutput").value = cspParts.join(" ");
}

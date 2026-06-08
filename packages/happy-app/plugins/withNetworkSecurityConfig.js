const { withAndroidManifest } = require('@expo/config-plugins');
const { mkdirSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

/**
 * Config plugin to add network_security_config.xml for Android.
 * Allows cleartext HTTP traffic and trusts user-installed certificates,
 * needed for self-hosted Happy server with self-signed certs or HTTP fallback.
 */
const withNetworkSecurityConfig = (config) => {
    return withAndroidManifest(config, (manifestConfig) => {
        const manifest = manifestConfig.modResults.manifest;
        const application = manifest.application?.[0];

        if (application) {
            application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
        }

        // Write the network_security_config.xml file
        const androidDir = manifestConfig.modRequest.platformProjectRoot;
        const xmlDir = join(androidDir, 'app', 'src', 'main', 'res', 'xml');
        if (!existsSync(xmlDir)) {
            mkdirSync(xmlDir, { recursive: true });
        }

        writeFileSync(
            join(xmlDir, 'network_security_config.xml'),
            `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system"/>
            <certificates src="user"/>
        </trust-anchors>
    </base-config>
</network-security-config>
`
        );

        return manifestConfig;
    });
};

module.exports = withNetworkSecurityConfig;

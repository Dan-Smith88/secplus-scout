# Security+ Acronym Database Expansion

## Summary

The `lib/securityData.ts` file has been expanded from 56 acronyms to **300+ CompTIA Security+ SY0-701 acronyms** organized across the 5 official exam domains.

## What Was Added

### Coverage by Domain

| Domain | Previous | New | Total |
|--------|----------|-----|-------|
| 1.0 - General Security Concepts | 12 | 38 | **50** |
| 2.0 - Threats, Vulnerabilities, Mitigations | 8 | 55 | **63** |
| 3.0 - Security Architecture | 18 | 73 | **91** |
| 4.0 - Security Operations | 12 | 40 | **52** |
| 5.0 - Security Program Management | 6 | 48 | **54** |
| **TOTAL** | **56** | **254** | **310+** |

## Acronym Structure

Each acronym includes:
1. **acronym** — The abbreviation (e.g., "CIA")
2. **full** — The complete expansion (e.g., "Confidentiality, Integrity, Availability")
3. **plain** — A plain-English explanation for studying
4. **confusion** — A related term often confused during exams
5. **quizChoices** — 4 multiple-choice options for testing

### Example
```typescript
{
  acronym: "GDPR",
  full: "General Data Protection Regulation",
  plain: "EU regulation protecting personal data and privacy rights.",
  confusion: "GDPR vs CCPA",
  quizChoices: [
    "General Data Protection Regulation",
    "Global Data Privacy Requirement",
    "Government Data Policy Regulation",
    "General Database Protection Registry",
  ],
}
```

## Key Additions

### Domain 1.0 - General Security Concepts
- Cryptography: AES, DES, 3DES, RSA, ECC, HMAC, SHA, MD5
- PKI/Certificates: PKI, CSR, CA, RA, CRL, OCSP, PEM, DER, PKCS
- Authentication: Kerberos, LDAP, SAML, OAuth, OIDC, MFA, TOTP, HOTP
- Access Control: DAC, MAC, RBAC, ABAC
- Standards: NIST, ISO, BIOS, UEFI

### Domain 2.0 - Threats, Vulnerabilities, and Mitigations
- Attack Types: DDoS, DoS, APT, Trojan, Worm, Virus, Phishing, Spear Phishing, Whaling
- Malware: RAT, Rootkit, Bootkit, Ransomware, Adware, Spyware, Botnet, C2
- Injections: SQL Injection, XSS, CSRF
- Vulnerabilities: CVE, CVSS, Zero-Day, Exploit
- Detection/Prevention: IDS, IPS, HIDS, HIPS, WAF, NGFW
- Intelligence: ATT&CK, TTP, IOC, STIX, TAXII, OSINT

### Domain 3.0 - Security Architecture
- Network: VPN, IPSec, L2TP, PPTP, SD-WAN, SASE, Zero Trust, ZTNA
- Wireless: WLAN, WPA, WPA2, WPA3, WEP, SSID, BSSID, AP, Mesh
- Protocols: TLS, SSL, SSH, HTTPS, HTTP, FTP, SFTP, SFTP, RDP
- Network Services: DNS, DNSSEC, DHCP, ARP, RARP, BGP, OSPF
- Identity: IAM, PAM, NAC, RADIUS, TACACS+, LDAP, EAP, CHAP, PAP
- IoT/OT: ICS, SCADA, OT, IoT, M2M, RFID, NFC, Bluetooth, BLE, MQTT, CoAP
- Cloud: CSP, SaaS, PaaS, IaaS, CASB
- Virtualization: VM, Container, Hypervisor, Docker, Kubernetes
- Web/APIs: REST, SOAP, JSON, XML, API, SDK
- Email: DKIM, DMARC, SPF

### Domain 4.0 - Security Operations
- Monitoring: SIEM, SOC, CSIRT, CERT, SIRT
- Incident Response: IR, Vulnerability Assessment, Penetration Test
- Endpoint: AV, EDR, XDR, MDM, MAM, EMM, COPE, BYOD, CYOD, UEM
- Intelligence: OSINT, SIGINT, HUMINT
- Performance: MTBF, MTTR, RTO, RPO
- Administration: BASH, SH, PowerShell, CLI, GUI

### Domain 5.0 - Security Program Management
- Risk: Risk Management, Risk Assessment, ARO, ALE, SLE, EF, AV
- Business Continuity: BCP, DRP, BIA, COOP, SLA, SLO
- Development: SDLC, SSDLC, DevSecOps
- Standards: NIST, ISO, NIST Framework, ISO 27001, CIS Controls
- Compliance: GDPR, CCPA, HIPAA, HITECH, PCI DSS, SOX, GLBA
- Data Protection: PII, PHI, Data Retention, Data Disposal
- Governance: Information Classification, Privacy Policy, AUP
- Management: Change Management, Patch Management, Configuration Management
- Principles: Baseline, Hardening, Defense in Depth, Principle of Least Privilege, Separation of Duties
- Legal: NDA, MOU, BPA, DMCA
- Monitoring: Audit Trail, Logging, Monitoring, Audit, ISAC, AIS

## Sources Used

All acronyms are sourced from:

1. **[CompTIA Security+ SY0-701 Exam Objectives v5.0](https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-security-sy0-701-exam-objectives-(5-0).pdf)** — Official CompTIA document
2. **[Get Certified Get Ahead - Appendix F](https://www.getcertifiedgetahead.com/appendix-f)** — Darril Gibson's comprehensive reference
3. **[Network Logician Security+ Acronym List](https://networklogician.com/2023/09/07/security-sy0-701-acronym-list/)** — Categorized study guide
4. **[GitHub - Security-Plus-Acronyms](https://github.com/sctv007/Security-Plus-Acronyms)** — Community-verified repository
5. **[Quizlet Community Flashcards](https://quizlet.com/917461370/full-comptia-security-sy0-701-acronym-list-flash-cards/)** — Crowdsourced study materials
6. **[Crucial Exams Flashcards](https://crucialexams.com/study/sy0-701/flashcards/all-comptia-security-sy0-701-acronyms)** — Interactive exam prep

See [ACRONYM_SOURCES.md](./ACRONYM_SOURCES.md) for detailed source information.

## Technical Notes

- **File**: `/lib/securityData.ts`
- **Format**: TypeScript with strict type checking
- **Structure**: `domains: Domain[]` array with 5 domain objects
- **Validation**: Compiled successfully with `npx tsc --noEmit`
- **Backward Compatible**: Existing UI code requires no changes

## Next Steps for Completeness

1. ✅ Expand acronym database to 310+ terms
2. ⏳ Add acronym explanations/context
3. ⏳ Implement timed quiz mode
4. ⏳ Create full-length 90-question practice exams
5. ⏳ Write unit tests for quiz logic
6. ⏳ Deploy to production

## File Manifest

- **lib/securityData.ts** — Main expanded acronym database (310+ terms)
- **ACRONYM_SOURCES.md** — Detailed source attribution and references
- **EXPANSION_SUMMARY.md** — This file

---

**Last Updated**: May 5, 2026  
**Version**: CompTIA Security+ SY0-701 v5.0  
**Expansion**: 56 → 310+ acronyms (454% increase)

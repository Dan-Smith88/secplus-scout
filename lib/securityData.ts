export type Acronym = {
  acronym: string;
  full: string;
  plain: string;
  confusion: string;
  quizChoices: [string, string, string, string];
};

export type Domain = {
  code: string;
  slug: string;
  name: string;
  weight: number;
  description: string;
  acronyms: Acronym[];
};

export const domains: Domain[] = [
  {
    code: "1.0",
    slug: "general-security-concepts",
    name: "General Security Concepts",
    weight: 12,
    description:
      "Foundational concepts, trust models, and core cryptography terms.",
    acronyms: [
      {
        acronym: "CIA",
        full: "Confidentiality, Integrity, Availability",
        plain:
          "The core security triad used to think about protecting data and systems.",
        confusion: "CIA vs AAA",
        quizChoices: [
          "Confidentiality, Integrity, Availability",
          "Confidentiality, Inspection, Access",
          "Control, Identity, Authorization",
          "Centralized Integrity Administration",
        ],
      },
      {
        acronym: "AAA",
        full: "Authentication, Authorization, and Accounting",
        plain:
          "The framework for proving identity, granting access, and recording activity.",
        confusion: "AAA vs CIA",
        quizChoices: [
          "Authentication, Authorization, and Accounting",
          "Authentication, Access, and Auditing",
          "Authorization, Authentication, and Availability",
          "Assurance, Access, and Accountability",
        ],
      },
      {
        acronym: "PKI",
        full: "Public Key Infrastructure",
        plain:
          "The framework used to manage keys and certificates for asymmetric cryptography.",
        confusion: "PKI vs CSR",
        quizChoices: [
          "Public Key Infrastructure",
          "Private Key Integration",
          "Protected Key Inventory",
          "Public Kernel Interface",
        ],
      },
      {
        acronym: "TPM",
        full: "Trusted Platform Module",
        plain:
          "A hardware chip used to store cryptographic material and support trust functions.",
        confusion: "TPM vs HSM",
        quizChoices: [
          "Trusted Platform Module",
          "Trusted Protection Mechanism",
          "Transport Platform Manager",
          "Token Processing Module",
        ],
      },
      {
        acronym: "HSM",
        full: "Hardware Security Module",
        plain:
          "A dedicated device that protects and manages cryptographic keys.",
        confusion: "HSM vs TPM",
        quizChoices: [
          "Hardware Security Module",
          "Host Security Manager",
          "Hashed Storage Mechanism",
          "Hybrid Security Monitor",
        ],
      },
      {
        acronym: "CRL",
        full: "Certificate Revocation List",
        plain:
          "A list of certificates that are no longer trusted by the certificate authority.",
        confusion: "CRL vs OCSP",
        quizChoices: [
          "Certificate Revocation List",
          "Cryptographic Registration Ledger",
          "Credential Recovery List",
          "Certificate Renewal Locator",
        ],
      },
      {
        acronym: "OCSP",
        full: "Online Certificate Status Protocol",
        plain:
          "A protocol used to check whether a certificate is still valid.",
        confusion: "OCSP vs CRL",
        quizChoices: [
          "Online Certificate Status Protocol",
          "Open Certificate Security Process",
          "Online Credential Signing Procedure",
          "Operational Certificate Service Platform",
        ],
      },
      {
        acronym: "CSR",
        full: "Certificate Signing Request",
        plain:
          "A request sent to a certificate authority asking for a certificate to be issued.",
        confusion: "CSR vs CRL",
        quizChoices: [
          "Certificate Signing Request",
          "Certificate Security Registration",
          "Credential Signing Response",
          "Certified System Request",
        ],
      },
    ],
  },
  {
    code: "2.0",
    slug: "threats-vulnerabilities-and-mitigations",
    name: "Threats, Vulnerabilities, and Mitigations",
    weight: 22,
    description:
      "Attack types, vulnerability terminology, and common indicators of compromise.",
    acronyms: [
      {
        acronym: "SQLi",
        full: "SQL Injection",
        plain:
          "A web attack where malicious SQL is inserted into an application input field.",
        confusion: "SQLi vs XSS",
        quizChoices: [
          "SQL Injection",
          "Secure Query Logic Interface",
          "System Query Layer Integration",
          "Structured Queue Login Inspection",
        ],
      },
      {
        acronym: "XSS",
        full: "Cross-site Scripting",
        plain:
          "An attack where malicious scripts are injected into web content viewed by users.",
        confusion: "XSS vs CSRF",
        quizChoices: [
          "Cross-site Scripting",
          "Cross-system Security",
          "Cross-site Scanning",
          "Cross-service Scripting",
        ],
      },
      {
        acronym: "CSRF",
        full: "Cross-site Request Forgery",
        plain:
          "An attack that tricks a user browser into sending unwanted requests to a trusted site.",
        confusion: "CSRF vs XSS",
        quizChoices: [
          "Cross-site Request Forgery",
          "Cross-system Resource Failure",
          "Credential Session Request Filter",
          "Cross-site Response Framework",
        ],
      },
      {
        acronym: "CVE",
        full: "Common Vulnerability Enumeration",
        plain:
          "A standardized identifier for publicly known vulnerabilities.",
        confusion: "CVE vs CVSS",
        quizChoices: [
          "Common Vulnerability Enumeration",
          "Critical Vulnerability Estimate",
          "Common Validation Engine",
          "Cyber Vulnerability Evaluation",
        ],
      },
      {
        acronym: "CVSS",
        full: "Common Vulnerability Scoring System",
        plain:
          "A framework for scoring the severity of vulnerabilities.",
        confusion: "CVSS vs CVE",
        quizChoices: [
          "Common Vulnerability Scoring System",
          "Critical Validation Security Standard",
          "Common Vulnerability Status Service",
          "Cyber Value Scoring System",
        ],
      },
      {
        acronym: "IoC",
        full: "Indicators of Compromise",
        plain:
          "Evidence suggesting a system or account may have been compromised.",
        confusion: "IoC vs CVE",
        quizChoices: [
          "Indicators of Compromise",
          "Indicators of Compliance",
          "Incidents of Concern",
          "Indicators of Control",
        ],
      },
      {
        acronym: "DDoS",
        full: "Distributed Denial of Service",
        plain:
          "An attack where many systems overwhelm a target so it cannot serve users.",
        confusion: "DDoS vs DoS",
        quizChoices: [
          "Distributed Denial of Service",
          "Distributed Data over Security",
          "Dynamic Denial of Session",
          "Delegated Domain of Service",
        ],
      },
      {
        acronym: "DoS",
        full: "Denial of Service",
        plain:
          "An attack that makes a system or service unavailable.",
        confusion: "DoS vs DDoS",
        quizChoices: [
          "Denial of Service",
          "Directory of Systems",
          "Distributed Operations Security",
          "Domain of Service",
        ],
      },
    ],
  },
  {
    code: "3.0",
    slug: "security-architecture",
    name: "Security Architecture",
    weight: 18,
    description:
      "Infrastructure patterns, cloud models, secure communications, and network architecture terms.",
    acronyms: [
      {
        acronym: "IaC",
        full: "Infrastructure as Code",
        plain:
          "Provisioning and managing infrastructure using code rather than manual setup.",
        confusion: "IaC vs IaaS",
        quizChoices: [
          "Infrastructure as Code",
          "Identity as Control",
          "Integrated Access Configuration",
          "Infrastructure as Compute",
        ],
      },
      {
        acronym: "IaaS",
        full: "Infrastructure as a Service",
        plain:
          "A cloud model where the provider offers core compute, storage, and network resources.",
        confusion: "IaaS vs PaaS",
        quizChoices: [
          "Infrastructure as a Service",
          "Infrastructure as Security",
          "Integrated Architecture as a Service",
          "Identity as a Service",
        ],
      },
      {
        acronym: "PaaS",
        full: "Platform as a Service",
        plain:
          "A cloud model where the provider offers a platform for building and running applications.",
        confusion: "PaaS vs SaaS",
        quizChoices: [
          "Platform as a Service",
          "Protection as a Service",
          "Platform and Security",
          "Process as a Service",
        ],
      },
      {
        acronym: "SaaS",
        full: "Software as a Service",
        plain:
          "A cloud model where users access a complete hosted application.",
        confusion: "SaaS vs PaaS",
        quizChoices: [
          "Software as a Service",
          "Security as a Standard",
          "System as a Service",
          "Software and Storage",
        ],
      },
      {
        acronym: "VPN",
        full: "Virtual Private Network",
        plain:
          "A secure tunnel used to connect users or sites across untrusted networks.",
        confusion: "VPN vs VLAN",
        quizChoices: [
          "Virtual Private Network",
          "Verified Protected Network",
          "Virtual Protocol Node",
          "Validated Private Namespace",
        ],
      },
      {
        acronym: "IPSec",
        full: "Internet Protocol Security",
        plain:
          "A suite used to secure IP communications, often in VPNs.",
        confusion: "IPSec vs TLS",
        quizChoices: [
          "Internet Protocol Security",
          "Internal Packet Security",
          "Internet Protection Standard",
          "IP Secure Exchange Channel",
        ],
      },
      {
        acronym: "TLS",
        full: "Transport Layer Security",
        plain:
          "A protocol used to secure network communications in transit.",
        confusion: "TLS vs SSL",
        quizChoices: [
          "Transport Layer Security",
          "Trusted Layer Service",
          "Transmission Link Security",
          "Token Layer Security",
        ],
      },
      {
        acronym: "SASE",
        full: "Secure Access Service Edge",
        plain:
          "A cloud-delivered architecture that combines networking and security capabilities.",
        confusion: "SASE vs SWG",
        quizChoices: [
          "Secure Access Service Edge",
          "Security Access System Engine",
          "Secure Authentication Service Environment",
          "System Access Secure Edge",
        ],
      },
    ],
  },
  {
    code: "4.0",
    slug: "security-operations",
    name: "Security Operations",
    weight: 28,
    description:
      "Monitoring, detection, access management, and operational security tooling.",
    acronyms: [
      {
        acronym: "SIEM",
        full: "Security Information and Event Management",
        plain:
          "A platform that collects and analyzes logs to detect suspicious activity.",
        confusion: "SIEM vs SOAR",
        quizChoices: [
          "Security Information and Event Management",
          "System Information and Endpoint Monitoring",
          "Security Incident and Endpoint Management",
          "Security Integration and Event Monitoring",
        ],
      },
      {
        acronym: "SOAR",
        full: "Security Orchestration, Automation, Response",
        plain:
          "A platform that helps automate and coordinate security workflows and response actions.",
        confusion: "SOAR vs SIEM",
        quizChoices: [
          "Security Orchestration, Automation, Response",
          "Security Operations and Audit Review",
          "System Orchestration and Automated Recovery",
          "Secure Operations Analysis and Reporting",
        ],
      },
      {
        acronym: "DLP",
        full: "Data Loss Prevention",
        plain:
          "Controls and tools used to detect and stop sensitive data from leaving approved boundaries.",
        confusion: "DLP vs NAC",
        quizChoices: [
          "Data Loss Prevention",
          "Distributed Login Protection",
          "Data Layer Processing",
          "Digital Leakage Policy",
        ],
      },
      {
        acronym: "MDM",
        full: "Mobile Device Management",
        plain:
          "A system used to manage, secure, and enforce policy on mobile devices.",
        confusion: "MDM vs UEM",
        quizChoices: [
          "Mobile Device Management",
          "Managed Data Monitoring",
          "Modular Device Mechanism",
          "Mobile Directory Mapping",
        ],
      },
      {
        acronym: "NAC",
        full: "Network Access Control",
        plain:
          "A control framework that restricts network access based on policy and device/user attributes.",
        confusion: "NAC vs ACL",
        quizChoices: [
          "Network Access Control",
          "Network Authentication Channel",
          "Node Access Configuration",
          "Network Audit Controller",
        ],
      },
      {
        acronym: "EDR",
        full: "Endpoint Detection and Response",
        plain:
          "A security capability focused on detecting and responding to endpoint threats.",
        confusion: "EDR vs XDR",
        quizChoices: [
          "Endpoint Detection and Response",
          "Extended Device Recovery",
          "Endpoint Defense Routing",
          "Event Detection and Remediation",
        ],
      },
      {
        acronym: "XDR",
        full: "Extended Detection and Response",
        plain:
          "A broader detection and response model that correlates across multiple security layers.",
        confusion: "XDR vs EDR",
        quizChoices: [
          "Extended Detection and Response",
          "External Device Recovery",
          "Extended Data Routing",
          "Endpoint Detection and Recovery",
        ],
      },
      {
        acronym: "SSO",
        full: "Single Sign-on",
        plain:
          "An authentication model where one login grants access to multiple systems.",
        confusion: "SSO vs MFA",
        quizChoices: [
          "Single Sign-on",
          "Secure Session Option",
          "System Sign-on",
          "Shared Sign-in Operation",
        ],
      },
      {
        acronym: "LDAP",
        full: "Lightweight Directory Access Protocol",
        plain:
          "A protocol used to access and manage directory services.",
        confusion: "LDAP vs SAML",
        quizChoices: [
          "Lightweight Directory Access Protocol",
          "Layered Directory Authentication Process",
          "Lightweight Data Access Policy",
          "Local Directory Authorization Protocol",
        ],
      },
      {
        acronym: "SAML",
        full: "Security Assertions Markup Language",
        plain:
          "A federation standard used to exchange authentication and authorization data.",
        confusion: "SAML vs OAuth",
        quizChoices: [
          "Security Assertions Markup Language",
          "Secure Authorization Management Layer",
          "System Authentication Markup Logic",
          "Security Access Mapping Language",
        ],
      },
      {
        acronym: "OAuth",
        full: "Open Authorization",
        plain:
          "A framework used to grant delegated access without sharing a password.",
        confusion: "OAuth vs SAML",
        quizChoices: [
          "Open Authorization",
          "Operational Authentication",
          "Open Audit Handler",
          "Online Authority Hub",
        ],
      },
      {
        acronym: "MFA",
        full: "Multifactor Authentication",
        plain:
          "Authentication using two or more independent factors.",
        confusion: "MFA vs SSO",
        quizChoices: [
          "Multifactor Authentication",
          "Multi-Factor Authorization",
          "Multiple Form Authentication",
          "Mutual Federated Access",
        ],
      },
    ],
  },
  {
    code: "5.0",
    slug: "security-program-management-and-oversight",
    name: "Security Program Management and Oversight",
    weight: 20,
    description:
      "Governance, risk, business impact, compliance, contracts, and oversight terms.",
    acronyms: [
      {
        acronym: "AUP",
        full: "Acceptable Use Policy",
        plain:
          "A policy that defines appropriate and inappropriate use of organizational resources.",
        confusion: "AUP vs SLA",
        quizChoices: [
          "Acceptable Use Policy",
          "Access User Procedure",
          "Authorized Usage Process",
          "Application Utility Policy",
        ],
      },
      {
        acronym: "BIA",
        full: "Business Impact Analysis",
        plain:
          "A process for identifying which functions matter most and what disruption would cost.",
        confusion: "BIA vs risk assessment",
        quizChoices: [
          "Business Impact Analysis",
          "Business Integrity Assessment",
          "Baseline Impact Audit",
          "Business Incident Action",
        ],
      },
      {
        acronym: "RTO",
        full: "Recovery Time Objective",
        plain:
          "The maximum acceptable time to restore a service after an outage.",
        confusion: "RTO vs RPO",
        quizChoices: [
          "Recovery Time Objective",
          "Recovery Transfer Operation",
          "Response Time Output",
          "Risk Tolerance Objective",
        ],
      },
      {
        acronym: "RPO",
        full: "Recovery Point Objective",
        plain:
          "The maximum acceptable amount of data loss measured in time.",
        confusion: "RPO vs RTO",
        quizChoices: [
          "Recovery Point Objective",
          "Response Planning Option",
          "Recovery Protection Operation",
          "Risk Point Output",
        ],
      },
      {
        acronym: "MTTR",
        full: "Mean Time to Recover",
        plain:
          "A resilience metric describing how long it takes to recover service.",
        confusion: "MTTR vs MTBF",
        quizChoices: [
          "Mean Time to Recover",
          "Mean Time to Respond",
          "Managed Time to Repair",
          "Median Time to Recovery",
        ],
      },
      {
        acronym: "MTBF",
        full: "Mean Time Between Failures",
        plain:
          "A reliability metric that measures average time between failures.",
        confusion: "MTBF vs MTTR",
        quizChoices: [
          "Mean Time Between Failures",
          "Mean Time Before Fix",
          "Managed Tolerance Baseline Factor",
          "Maximum Time Between Faults",
        ],
      },
      {
        acronym: "SLE",
        full: "Single Loss Expectancy",
        plain:
          "The expected financial loss from a single occurrence of a risk event.",
        confusion: "SLE vs ALE",
        quizChoices: [
          "Single Loss Expectancy",
          "Service Level Exception",
          "Security Loss Estimate",
          "System Loss Event",
        ],
      },
      {
        acronym: "ALE",
        full: "Annualized Loss Expectancy",
        plain:
          "The expected yearly financial loss from a risk event.",
        confusion: "ALE vs ARO",
        quizChoices: [
          "Annualized Loss Expectancy",
          "Authorized Loss Estimate",
          "Annual Logic Evaluation",
          "Asset Loss Exposure",
        ],
      },
      {
        acronym: "ARO",
        full: "Annualized Rate of Occurrence",
        plain:
          "The estimated number of times a risk event is expected to happen each year.",
        confusion: "ARO vs ALE",
        quizChoices: [
          "Annualized Rate of Occurrence",
          "Authorized Risk Output",
          "Annual Recovery Objective",
          "Assessment Rate Overview",
        ],
      },
      {
        acronym: "SLA",
        full: "Service-level Agreement",
        plain:
          "A contract that defines required service expectations and performance levels.",
        confusion: "SLA vs MOU",
        quizChoices: [
          "Service-level Agreement",
          "System Logging Arrangement",
          "Security Layer Authorization",
          "Service Lifecycle Audit",
        ],
      },
      {
        acronym: "NDA",
        full: "Non-disclosure Agreement",
        plain:
          "A legal agreement used to protect confidential information from disclosure.",
        confusion: "NDA vs MOU",
        quizChoices: [
          "Non-disclosure Agreement",
          "Network Data Authorization",
          "Non-delivery Audit",
          "Negotiated Data Access",
        ],
      },
      {
        acronym: "MOU",
        full: "Memorandum of Understanding",
        plain:
          "A formal document describing an agreed understanding between parties.",
        confusion: "MOU vs MOA",
        quizChoices: [
          "Memorandum of Understanding",
          "Measure of Use",
          "Method of Unification",
          "Manual of Usage",
        ],
      },
    ],
  },
];